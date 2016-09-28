#!/usr/bin/env python

import cgi
import os
import tntfl.constants as Constants
from tntfl.ladder import TableFootballLadder
from tntfl.web import redirect_302, fail_404, serve_template

form = cgi.FieldStorage()


ladder = TableFootballLadder(Constants.ladderFilePath)

gameTime = form.getfirst('game')
if gameTime is not None:
    if form.getfirst('deleteConfirm') == "true":
        deletedBy = os.environ["REMOTE_USER"] if "REMOTE_USER" in os.environ else "Unknown"
        deleted = ladder.deleteGame(gameTime, deletedBy)
        if deleted:
            redirect_302("./")
        else:
            fail_404()
    else:
        found = False
        for game in ladder.games:
            if game.time == gameTime and not found:
                found = True
                serve_template("deleteGame.mako", ladder=ladder, game=game)
        if not found:
            fail_404()
            print
else:
    fail_404()
