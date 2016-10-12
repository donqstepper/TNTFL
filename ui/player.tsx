import * as React from 'react';
import { Component, Props, CSSProperties } from 'react';
import { Panel, Grid, Row, Col } from 'react-bootstrap';
import * as ReactDOM from 'react-dom';

import GameList from './components/game-list';
import NavigationBar from './components/navigation-bar';
import Game from './model/game';
import Player from './model/player';
import { getParameterByName, getLadderLeagueClass } from './utils/utils';

interface StatBoxProps {
  title: string;
  caption?: string;
  classes?: string;
  style?: CSSProperties;
  children?: any;
}
function StatBox(props: StatBoxProps): JSX.Element {
  const { title, caption, children, classes, style } = props;
  return (
    <div className="col-sm-3 col-md-offset-0">
      <Panel header={<h3>{title}</h3>}>
        {children}
      </Panel>
    </div>
  );
}

interface PlayerStatsProps {
  player: Player;
  games: Game[];
  numActivePlayers: number;
}
function PlayerStats(props: PlayerStatsProps): JSX.Element {
  function sideStyle(player: Player): CSSProperties {
    var redness = (player.total.gamesAsRed / player.total.games);
    return {backgroundColor: 'rgb(' + Math.round(redness * 255) + ', 0, '  + Math.round((1 - redness) * 255) + ')'};
  };
  function sidePreference(player: Player): string {
    var redness = (player.total.gamesAsRed / player.total.games) * 100;
    return (redness >= 50) ? (redness.toFixed(2) + "% red") : ((100-redness).toFixed(2) + "% blue")
  };
  function getSkillChange(playerName: string, games: Game[]): number {
    var skill = 0;
    for (var i = 0; i < games.length; i++)
      skill += games[i].red.name == playerName ? games[i].red.skillChange : games[i].blue.skillChange;
    return skill;
  };
  function getRankChange(playerName: string, games: Game[]): number {
    var change = 0;
    if (games.length > 0) {
      var endRank = games[games.length - 1].red.name == playerName ? games[games.length - 1].red.newRank : games[games.length - 1].blue.newRank
      var startRank = games[0].red.name == playerName ? games[0].red.newRank - games[0].red.rankChange : games[0].blue.newRank - games[0].blue.rankChange;
      change = startRank - endRank;
    }
    return change;
  };
  const { player, numActivePlayers, games } = props;
  const gamesToday = games.slice(games.length - player.total.gamesToday);
  const overrated = 0; //getOverrated(player.name, player.games);
  const goalRatio = player.total.for / player.total.against;
  const skillChangeToday = getSkillChange(player.name, gamesToday);
  const rankChangeToday = getRankChange(player.name, gamesToday);
  return (
    <Panel header={<h1>{player.name}</h1>}>
      <Row>
        <StatBox title="Current Ranking" classes={"ladder-position " + getLadderLeagueClass(player.rank, numActivePlayers)}>
          {player.rank !== -1 ? player.rank : '-'}
        </StatBox>
        <StatBox title="Skill">{player.skill.toFixed(3)}</StatBox>
        <StatBox title="Overrated" classes={overrated <= 0 ? "positive" : "negative"}>{overrated.toFixed(3)}</StatBox>
        <StatBox title="Side preference" classes="side-preference" style={sideStyle(player)}>{sidePreference(player)}</StatBox>
      </Row>
      <Row>
        <StatBox title="Total games">{player.total.games}</StatBox>
        <StatBox title="Wins">{player.total.wins}</StatBox>
        <StatBox title="Losses">{player.total.losses}</StatBox>
        <StatBox title="Draws">{(player.total.games - player.total.wins - player.total.losses)}</StatBox>
      </Row>
      <Row>
        <StatBox title="Goals for">{player.total.for}</StatBox>
        <StatBox title="Goals against">{player.total.against}</StatBox>
        <StatBox title="Goal ratio" classes={goalRatio > 1 ? "positive" : "negative"}>{goalRatio.toFixed(3)}</StatBox>
      </Row>
      <Row>
        <StatBox title="Games today">{gamesToday.length}</StatBox>
        <StatBox title="Skill change today" classes={skillChangeToday >= 0 ? "positive" : "negative"}>{skillChangeToday.toFixed(3)}</StatBox>
        <StatBox title="Rank change today" classes={rankChangeToday >= 0 ? "positive" : "negative"}>{rankChangeToday}</StatBox>
        {/*TODO <StatBox title="Current streak">{get_template("durationStat.mako", value="{0} {1}".format(currentStreak.count, currentStreakType), fromDate=currentStreak.fromDate, toDate=currentStreak.toDate, base=self.attr.base))</StatBox>*/}
      </Row>
      <Row>
        {/*TODO <StatBox title="Highest ever skill">{get_template("pointInTimeStat.mako", skill=skillBounds['highest']['skill'], time=skillBounds['highest']['time'], base=self.attr.base))</StatBox>*/}
        {/*TODO <StatBox title="Lowest ever skill">{get_template("pointInTimeStat.mako", skill=skillBounds['lowest']['skill'], time=skillBounds['lowest']['time'], base=self.attr.base))</StatBox>*/}
        {/*TODO <StatBox title="Longest winning streak">{get_template("durationStat.mako", value=winStreak.count, fromDate=winStreak.fromDate, toDate=winStreak.toDate, base=self.attr.base))</StatBox>*/}
        {/*TODO <StatBox title="Longest losing streak">{get_template("durationStat.mako", value=loseStreak.count, fromDate=loseStreak.fromDate, toDate=loseStreak.toDate, base=self.attr.base))</StatBox>*/}
      </Row>
      <Row>
        {/*TODO <StatBox title="Total achievements">{str(sum([len(g) for g in player.achievements.values()])) + '<div class="date"><a href="#achievements">See all</a></div>' )</StatBox>*/}
      </Row>
    </Panel>
  );
}

interface SkillChartProps {
  playerName: string;
  games: any[];
}
function SkillChart(props: SkillChartProps): JSX.Element {
  // function plot() {
  //   var getSkillHistory = function(playerName, games) {
  //     var history = [];
  //     var skill = 0;
  //     for (var i = 0; i < games.length; i++) {
  //       skill += games[i].red.name == playerName ? games[i].red.skillChange : games[i].blue.skillChange;
  //       history.push([games[i].date * 1000, skill]);
  //     }
  //     return history;
  //   };
  //   plotPlayerSkill("#playerchart", [getSkillHistory(playerName, games)]);
  // }

  return (
    <Panel header={'Skill Chart'}>
      <div id="playerchart"></div>
    </Panel>
  );
}

interface RecentGamesProps {
  games: Game[];
  numActivePlayers: number;
}
function RecentGames(props: RecentGamesProps): JSX.Element {
  const { games, numActivePlayers } = props;
  const recentGames = Array.prototype.slice.call(games).reverse();
  return (
    <Panel header={'Recent Games'}>
      <GameList games={recentGames} base={"../../"} numActivePlayers={numActivePlayers}/>
      <a className="pull-right" href="games/">See all games</a>
    </Panel>
  );
}

interface PlayerPageProps extends Props<PlayerPage> {
  root: string;
  addURL: string;
  playerName: string;
}
interface PlayerPageState {
  player: Player;
  games: Game[];
}
class PlayerPage extends Component<PlayerPageProps, PlayerPageState> {
  constructor(props: PlayerPageProps, context: any) {
      super(props, context);
      this.state = {
        player: undefined,
        games: [],
      };
  }
  async load() {
    const { root, playerName } = this.props;
    const url = `${root}player.cgi?method=view&view=json&player=${playerName}`;
    const r = await fetch(url);
    this.setState({player: await r.json()} as PlayerPageState);
  }
  componentDidMount() {
    this.load();
  }
  render() {
    const { root, addURL } = this.props;
    const numActivePlayers = 0;
    // getTotalActivePlayers(this.state.playersStats)
    return (
      <div className="playerPage">
        <NavigationBar
          root={root}
          addURL={addURL}
        />
        {this.state.player ?
          <Grid fluid={true}>
            <Row>
              <Col md={8}>
                <PlayerStats player={this.state.player} numActivePlayers={numActivePlayers} games={this.state.games}/>
                <SkillChart playerName={this.state.player.name} games={this.state.games} />
                {/*TODO <PerPlayerStats />*/}
              </Col>
              <Col md={4}>
                <RecentGames games={this.state.games} numActivePlayers={numActivePlayers}/>
                {/*TODO <Most significant />*/}
                {/*TODO <least significant />*/}
                {/*TODO <achievements />*/}
              </Col>
            </Row>
          </Grid>
          : 'Loading...'
        }
      </div>
    );
  }
};

ReactDOM.render(
  <PlayerPage
    root={'http://www/~tlr/tntfl-test/'}
    addURL={'game/add'}
    playerName={getParameterByName('player')}
  />,
  document.getElementById('entry')
);