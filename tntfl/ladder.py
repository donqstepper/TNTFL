import os.path
import cPickle as pickle
import time
from tntfl.achievements import Achievements
from tntfl.player import Player, Streak
from tntfl.caching_game_store import CachingGameStore
from tntfl.game import Game


class TableFootballLadder(object):

    # Number of days inactivity after which players are considered inactive
    DAYS_INACTIVE = 60

    def __init__(self, ladderFilePath, useCache=True, timeRange=None):
        self.games = []
        self.players = {}
        self.achievements = Achievements()
        self._recentlyActivePlayers = (-1, [])
        self._gameStore = CachingGameStore(ladderFilePath, useCache)

        self._ladderTime = {'now': timeRange is None, 'range': timeRange}
        self._theTime = time.time()
        self._gameStore.loadGames(self, self._ladderTime)

    def getPlayer(self, name):
        if name not in self.players:
            self.players[name] = Player(name)
        return self.players[name]

    def addGame(self, game):
        self.games.append(game)

        if game.isDeleted():
            return

        red = self.getPlayer(game.redPlayer)
        blue = self.getPlayer(game.bluePlayer)

        self._calculateSkillChange(red, game, blue)

        activePlayers = {p.name: p for p in self.getActivePlayers(game.time - 1)}
        players = sorted(activePlayers.values(), key=lambda x: x.elo, reverse=True)
        redPosBefore = players.index(red) if red in players else -1
        bluePosBefore = players.index(blue) if blue in players else -1

        blue.game(game)
        red.game(game)

        activePlayers[red.name] = red
        activePlayers[blue.name] = blue
        self._recentlyActivePlayers = (game.time, activePlayers.values())
        players = sorted(activePlayers.values(), key=lambda x: x.elo, reverse=True)
        redPosAfter = players.index(red)
        bluePosAfter = players.index(blue)

        game.bluePosAfter = bluePosAfter + 1  # because it's zero-indexed here
        game.redPosAfter = redPosAfter + 1

        if bluePosBefore > 0:
            game.bluePosChange = bluePosBefore - bluePosAfter  # It's this way around because a rise in position is to a lower numbered rank.
        if redPosBefore > 0:
            game.redPosChange = redPosBefore - redPosAfter

        if self._ladderTime['now']:
            game.redAchievements = self.achievements.getAllForGame(red, game, blue, self)
            game.blueAchievements = self.achievements.getAllForGame(blue, game, red, self)
            red.achieve(game.redAchievements, game)
            blue.achieve(game.blueAchievements, game)

    # returns blue's goal ratio
    def predict(self, red, blue):
        return 1 / (1 + 10 ** ((red.elo - blue.elo) / 180))

    def _calculateSkillChange(self, red, game, blue):
        predict = self.predict(red, blue)
        result = float(game.blueScore) / (game.blueScore + game.redScore)
        delta = 25 * (result - predict)
        game.skillChangeToBlue = delta

    def getActivePlayers(self, atTime=None):
        if atTime is None:
            atTime = self._getTime()
        if self._recentlyActivePlayers[0] != atTime:
            self._recentlyActivePlayers = (atTime, [p for p in self.players.values() if self.isPlayerActive(p, atTime)])
        return self._recentlyActivePlayers[1]

    def isPlayerActive(self, player, atTime=None):
        if atTime is None:
            atTime = self._getTime()
        for game in reversed(player.games):
            if game.time <= atTime:
                return (atTime - game.time) < (60 * 60 * 24 * self.DAYS_INACTIVE)
        return False

    def _getTime(self):
        if self._ladderTime['now']:
            return self._theTime
        else:
            return self._ladderTime['range'][1]

    def getSkillBounds(self):
        highSkill = {'player': None, 'skill': 0, 'time': 0}
        lowSkill = {'player': None, 'skill': 0, 'time': 0}
        for player in self.players.values():
            skill = player.getSkillBounds()
            if skill['highest']['skill'] > highSkill['skill']:
                highSkill['player'] = player
                highSkill['skill'] = skill['highest']['skill']
                highSkill['time'] = skill['highest']['time']
            if skill['lowest']['skill'] < lowSkill['skill']:
                lowSkill['player'] = player
                lowSkill['skill'] = skill['lowest']['skill']
                lowSkill['time'] = skill['lowest']['time']
        return {'highest': highSkill, 'lowest': lowSkill}

    def getStreaks(self):
        winning = {'player': None, 'streak': Streak()}
        losing = {'player': None, 'streak': Streak()}
        for player in self.players.values():
            streaks = player.getStreaks()
            if streaks['win'].count > winning['streak'].count:
                winning['player'] = player
                winning['streak'] = streaks['win']
            if streaks['lose'].count > losing['streak'].count:
                losing['player'] = player
                losing['streak'] = streaks['lose']
        return {'win': winning, 'lose': losing}

    def addAndWriteGame(self, redPlayer, redScore, bluePlayer, blueScore):
        game = None
        redScore = int(redScore)
        blueScore = int(blueScore)
        if redScore >= 0 and blueScore >= 0 and (redScore + blueScore) > 0:
            game = Game(redPlayer, redScore, bluePlayer, blueScore, int(time.time()))
            self.addGame(game)
            self._gameStore.writeGame(game)
        return game

    def deleteGame(self, gameTime, deletedBy):
        return self._gameStore.deleteGame(gameTime, deletedBy)

    def getPlayers(self):
        return sorted([p for p in self.players.values()], key=lambda x: x.elo, reverse=True)

    def getPlayerRank(self, playerName):
        ranked = [p.name for p in self.getPlayers() if self.isPlayerActive(p)]
        if playerName in ranked:
            return ranked.index(playerName) + 1
        return -1

    def getAchievements(self):
        achievements = {}
        for ach in self.achievements.achievements:
            achievements[ach.__class__] = 0

        for player in self.players.values():
            for name, games in player.achievements.iteritems():
                achievements[name] += len(games)
        return achievements
