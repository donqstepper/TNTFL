<%!
title = "Achievements | "
base = ""
%>
<%inherit file="html.mako" />
<%namespace name="blocks" file="blocks.mako" />
<div class="container-fluid">
    ${blocks.render("components/achievementList", achievements=achievements)}
</div>
