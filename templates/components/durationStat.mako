<%page args="value, base, toDate, fromDate"/>
<%namespace name="blocks" file="../blocks.mako"/>${value}
% if toDate > 0:
<div class="date">
From ${blocks.render("components/gameLink", time=fromDate, base=base)}<br/>
to ${blocks.render("components/gameLink", time=toDate, base=base)}
</div>
% endif
