<%!
title = "Speculate | "
base = "../"

def serialise(games):
    return ','.join(['%s,%s,%s,%s' % (g.redPlayer, g.redScore, g.blueScore, g.bluePlayer) for g in games])
%>
<%inherit file="html.mako" />
<div class="container-fluid">
  <div class="row">
    <div class="col-md-8">
      <div class="panel panel-default ${"panel-warning" if len(speculativeGames) > 0 else ""}">
% if len(speculativeGames) > 0:
        <div class="panel-heading">
          <h2 class="panel-title">Speculative Ladder</h2>
        </div>
% endif
        <div class="panel-body ${"speculative" if len(speculativeGames) > 0 else ""}" id="ladderHolder">
          ${self.blocks.render("ladder", base=self.attr.base)}
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h2 class="panel-title">Speculative Games</h2>
        </div>
        <div class="panel-body" id="recentHolder">
          <form class="form-inline game-entry" method="post" action=".">
            <div class="form-group">
              <input type="text" name="redPlayer" class="form-control red player" id="spec-red-player" placeholder="Red">
              <input type="text" name="redScore" class="form-control red score" id="spec-red-score" placeholder="0" maxlength="2"> - <input type="text" id="spec-blue-score" name="blueScore" class="form-control blue score" placeholder="0" maxlength="2">
              <input type="text" name="bluePlayer" class="form-control blue player" id="spec-blue-player" placeholder="Blue">
              <script type="text/javascript">
                $("#spec-red-score").change(function() {
                  $("#spec-blue-score").val(10 - $("#spec-red-score").val());
                })
              </script>
              <input type="hidden" name="previousGames" value="${serialise(speculativeGames)}" />
            </div>
            <button type="submit" class="btn btn-default">Speculate <span class="glyphicon glyphicon-triangle-right"></span></button>
          </form>
% if len(speculativeGames) > 0:
          <hr />
            ${self.blocks.render("components/gameList", ladder=ladder, games=reversed(speculativeGames), base=self.attr.base, speculative=True)}
          <hr />
          <a href=".">Reset speculation</a>
% endif
        </div>
      </div>
    </div>
  </div>
</div>
