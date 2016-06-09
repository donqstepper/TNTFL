import time
from datetime import date


class Streak(object):
    def __init__(self):
        self.win = True
        self.gameTimes = []

    @property
    def count(self):
        return len(self.gameTimes)

    @property
    def fromDate(self):
        return self.gameTimes[0] if self.count > 0 else 0

    @property
    def toDate(self):
        return self.gameTimes[-1] if self.count > 0 else 0


class Player(object):
    def __init__(self, name):
        self.name = name
        self.elo = 0.0
        self.games = []
        self.wins = 0
        self.losses = 0
        self.goalsFor = 0
        self.goalsAgainst = 0
        self.gamesAsRed = 0
        self.highestSkill = {"time": 0, "skill": 0}
        self.lowestSkill = {"time": 0, "skill": 0}
        self.achievements = {}

    def game(self, game):
        if self.name == game.redPlayer:
            delta = -game.skillChangeToBlue
            self.gamesAsRed += 1
            if game.redScore > game.blueScore:
                self.wins += 1
            elif game.redScore < game.blueScore:
                self.losses += 1
            self.goalsFor += game.redScore
            self.goalsAgainst += game.blueScore
        elif self.name == game.bluePlayer:
            delta = game.skillChangeToBlue
            if game.redScore < game.blueScore:
                self.wins += 1
            elif game.redScore > game.blueScore:
                self.losses += 1
            self.goalsFor += game.blueScore
            self.goalsAgainst += game.redScore
        else:
            return
        self.elo += delta

        if (self.elo > self.highestSkill["skill"]):
            self.highestSkill = {"time": game.time, "skill": self.elo}

        if (self.elo < self.lowestSkill["skill"]):
            self.lowestSkill = {"time": game.time, "skill": self.elo}

        self.games.append(game)

    def getSkillBounds(self):
        return {"highest": self.highestSkill, "lowest": self.lowestSkill}

    def mostSignificantGame(self):
        mostSignificantGame = None
        for game in self.games:
            if self.name == game.redPlayer:
                delta = -game.skillChangeToBlue
            else:
                delta = game.skillChangeToBlue
            if mostSignificantGame is None or abs(delta) > abs(mostSignificantGame.skillChangeToBlue):
                mostSignificantGame = game
        return mostSignificantGame

    @property
    def gamesToday(self):
        today = date.today()
        return self.gamesOn(today)

    def gamesOn(self, date):
        return len([g for g in self.games if g.timeAsDatetime().date() == date])

    def skillChangeToday(self):
        today = date.today()
        skillChange = 0
        for game in [g for g in self.games if g.timeAsDatetime().date() == today]:
            skillChange += game.skillChangeToBlue if game.bluePlayer == self.name else -game.skillChangeToBlue
        return skillChange

    def rankChangeToday(self):
        today = date.today()
        change = 0
        for game in [g for g in self.games if g.timeAsDatetime().date() == today]:
            change += game.bluePosChange if game.bluePlayer == self.name else game.redPosChange
        return change

    def achieve(self, achievements, game):
        for achievement in achievements:
            if achievement in self.achievements.keys():
                self.achievements[achievement].append(game)
            else:
                self.achievements[achievement] = [game]

    def overrated(self):
        if len(self.games) >= 10:
            skill = 0
            total = 0
            for game in self.games[-10:]:
                skill += game.skillChangeToBlue if game.bluePlayer == self.name else -game.skillChangeToBlue
                total += skill
            return skill - (total / 10)
        return 0

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return self.name + ":" + str(self.elo)

    def wonGame(self, game):
        return (game.redPlayer == self.name and game.redScore > game.blueScore) or (game.bluePlayer == self.name and game.blueScore > game.redScore)

    def lostGame(self, game):
        return (game.redPlayer == self.name and game.redScore < game.blueScore) or (game.bluePlayer == self.name and game.blueScore < game.redScore)

    def getAllStreaks(self, games):
        streaks = []
        currentStreak = Streak()

        for game in games:
            wonGame = self.wonGame(game)
            lostGame = self.lostGame(game)
            if (wonGame and currentStreak.win) or (lostGame and not currentStreak.win):
                currentStreak.gameTimes.append(game.time)
            else:
                # end of streak
                if currentStreak.count >= 1:
                    streaks.append(currentStreak)
                currentStreak = Streak()
                if wonGame or lostGame:
                    currentStreak.gameTimes.append(game.time)
                currentStreak.win = wonGame
        return {'past': streaks, 'current': currentStreak}

    def getStreaks(self):
        streaks = self.getAllStreaks(self.games)
        winStreaks = sorted([s for s in streaks['past'] if s.win], key=lambda s: s.count, reverse=True)
        loseStreaks = sorted([s for s in streaks['past'] if not s.win], key=lambda s: s.count, reverse=True)
        currentStreakType = "(last game was a draw)" if streaks['current'].count == 0 else "wins" if streaks['current'].win else "losses"
        return {
            'win': winStreaks[0] if len(winStreaks) > 0 else Streak(),
            'lose': loseStreaks[0] if len(loseStreaks) > 0 else Streak(),
            'current': streaks['current'],
            'currentType': currentStreakType
        }


class PerPlayerStat(object):
    games = 0
    goalsFor = 0
    goalsAgainst = 0
    skillChange = 0
    wins = 0
    losses = 0
    draws = 0

    def __init__(self, opponent):
        self.opponent = opponent

    def append(self, goalsFor, goalsAgainst, skillChange):
        self.games += 1
        self.goalsFor += goalsFor
        self.goalsAgainst += goalsAgainst
        self.skillChange += skillChange
        if goalsFor > goalsAgainst:
            self.wins += 1
        elif goalsFor < goalsAgainst:
            self.losses += 1
        else:
            self.draws += 1
