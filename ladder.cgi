#!/usr/bin/env python

import cgi
from tntfl.ladder import TableFootballLadder
from tntfl.web import serve_template


form = cgi.FieldStorage()

ladder = TableFootballLadder("ladder.txt")
serve_template("ladder.mako", ladder=ladder, base="",
               sortCol=form['sortCol'].value if "sortCol" in form else None,
               sortOrder=form["sortOrder"].value if "sortOrder" in form else None,
               showInactive=form["showInactive"].value if "showInactive" in form else 0)
