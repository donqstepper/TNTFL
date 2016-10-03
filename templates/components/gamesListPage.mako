<%page args="base, pageTitle, ladder, games"/>
<%namespace name="blocks" file="../blocks.mako" />
<div class="container-fluid">
  <div class="row">
    <div class="col-md-8">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h1 class="panel-title">${pageTitle}</h1>
        </div>
        <div class="panel-body">
          ${blocks.render("components/gameList", ladder=ladder, games=games, base=base)}
        </div>
      </div>
    </div>
  </div>
</div>
