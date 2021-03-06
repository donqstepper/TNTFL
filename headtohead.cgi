#!/usr/bin/env python
import cgi
import tntfl.constants as Constants
from tntfl.ladder import TableFootballLadder
from tntfl.web import serve_template, fail_404, getString
import tntfl.template_utils as utils

form = cgi.FieldStorage()

player1 = getString('player1', form)
player2 = getString('player2', form)
if player1 and player2:
    ladder = TableFootballLadder(Constants.ladderFilePath)
    player1 = ladder.getPlayer(player1)
    player2 = ladder.getPlayer(player2)
    if getString('method', form) == "games":
        games = utils.getSharedGames(player1, player2)
        pageTitle = "%s vs %s" % (player1.name, player2.name)
        serve_template("headtoheadgames.mako", pageTitle=pageTitle, games=games, ladder=ladder)
    else:
        serve_template("headtohead.mako", ladder=ladder, player1=player1, player2=player2)
