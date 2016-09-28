#!/usr/bin/env python

import tntfl.constants as Constants
from tntfl.ladder import TableFootballLadder
from tntfl.web import serve_template


ladder = TableFootballLadder(Constants.ladderFilePath)
serve_template("achievements.mako", achievements=sorted(ladder.getAchievements().iteritems(), reverse=True, key=lambda t: t[1]))
