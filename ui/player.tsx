import * as React from 'react';
import { Component, Props, CSSProperties } from 'react';
import { Panel, Grid, Row, Col } from 'react-bootstrap';
import * as ReactDOM from 'react-dom';
import { Line } from 'react-chartjs-2';

import PerPlayerStats from './components/per-player-stats';
import PlayerStats from './components/player-stats';
import RecentGames from './components/recent-game-list';
import NavigationBar from './components/navigation-bar';
import Game from './model/game';
import PerPlayerStat from './model/per-player-stat';
import Player from './model/player';
import { getParameterByName, getLadderLeagueClass, formatEpoch } from './utils/utils';

interface SkillChartProps {
  playerName: string;
  games: Game[];
}
function SkillChart(props: SkillChartProps): JSX.Element {
  const { playerName, games } = props;
  let skill = 0;
  const skillLine = games.map((game) => {
    skill += game.red.name == playerName ? game.red.skillChange : game.blue.skillChange;
    return {x: game.date * 1000, y: skill};
  });
  const data = {datasets: [{
    data: skillLine,
    fill: false,
    borderColor: '#0000FF',
  }]};
  const options = {
    scales: {xAxes: [{type: 'time'}]},
    legend: {display: false},
    tooltips: {callbacks: {
      title: (tooltip: any, point: any) => formatEpoch(tooltip[0].xLabel / 1000),
      label: (tooltip: any, point: any) => tooltip.yLabel.toFixed(3),
    }}
  };
  return (
    <Panel header={'Skill Chart'}>
      <Line data={data} options={options}/>
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
  perPlayerStats: PerPlayerStat[];
}
class PlayerPage extends Component<PlayerPageProps, PlayerPageState> {
  constructor(props: PlayerPageProps, context: any) {
      super(props, context);
      this.state = {
        player: undefined,
        games: undefined,
        perPlayerStats: undefined,
      };
  }
  async loadSummary() {
    const { root, playerName } = this.props;
    const url = `${root}player.cgi?method=view&view=json&player=${playerName}`;
    const r = await fetch(url);
    this.setState({player: await r.json()} as PlayerPageState);
  }
  async loadGames() {
    const { root, playerName } = this.props;
    const url = `${root}player.cgi?method=games&view=json&player=${playerName}`;
    const r = await fetch(url);
    this.setState({games: await r.json()} as PlayerPageState);
  }
  async loadPerPlayerStats() {
    const { root, playerName } = this.props;
    const url = `${root}player.cgi?method=perplayerstats&view=json&player=${playerName}`;
    const r = await fetch(url);
    this.setState({perPlayerStats: await r.json()} as PlayerPageState);
  }
  componentDidMount() {
    this.loadSummary();
    this.loadGames();
    this.loadPerPlayerStats();
  }
  render() {
    const { playerName, root, addURL } = this.props;
    const { player, games, perPlayerStats } = this.state;
    const numActivePlayers = 0;
    // getTotalActivePlayers(this.state.playersStats)
    return (
      <div className="playerPage">
        <NavigationBar
          root={root}
          addURL={addURL}
        />
        {player && games ?
          <Grid fluid={true}>
            <Row>
              <Col md={8}>
                <PlayerStats player={player} numActivePlayers={numActivePlayers} games={games}/>
                <SkillChart playerName={player.name} games={games} />
                <PerPlayerStats playerName={playerName} stats={perPlayerStats}/>
              </Col>
              <Col md={4}>
                <RecentGames games={games.slice(games.length - 5).reverse()} showAllGames={true}/>
                {/*TODO <Most significant />*/}
                {/*TODO <First game />*/}
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
