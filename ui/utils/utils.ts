import * as React from 'react';
import * as moment from 'moment';

import Game from '../model/game';

export function getLadderLeagueClass(rank: number, numActivePlayers: number) {
  var league = "";
  if (rank == -1)
    league = "inactive";
  else if (rank == 1)
    league = "ladder-first";
  else if (1 < rank && rank <= numActivePlayers * 0.1)
    league = "ladder-silver";
  else if (0.1 * numActivePlayers < rank && rank <= numActivePlayers * 0.3)
    league = "ladder-bronze";
  return `ladder-position ${league}`;
}

function formatDate(date: moment.Moment) {
  if (date.isBefore(moment().subtract(7, 'days'))) {
    return date.format("YYYY-MM-DD HH:mm");
  }
  else if (date.isBefore(moment().startOf('day'))) {
    return date.format("ddd HH:mm");
  }
  else {
    return date.format("HH:mm");
  }
}

export function formatEpoch(epoch: number) {
  return formatDate(moment.unix(epoch));
}

export function getParameters(num: number): string[] {
  const url = window.location.href;
  const split = url.split("/").filter((s) => s.length > 0);
  return split.slice(split.length - num);
}

export function formatRankChange(rankChange: number): string {
  return (rankChange > 0 ? '▲' : '▼') + Math.abs(rankChange);
}

export function getNearlyInactiveClass(lastPlayed: number, now: number): string {
  const nearlyInactiveDays = 14;
  const nearlyInactiveTime = (60 - nearlyInactiveDays) * 24 * 60 * 60;
  const isNearlyInactive = now - lastPlayed > nearlyInactiveTime;
  return isNearlyInactive ? 'nearly-inactive' : '';
}

export function mostRecentGames(games: Game[]): Game[] {
  return games.slice(games.length > 5 ? games.length - 5 : 0).reverse();
}
