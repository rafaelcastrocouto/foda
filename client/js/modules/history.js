game.history = {
  build: function () {
    game.history.last = game.getData('last-activity');
    game.history.state = game.getData('state');
    game.history.mode = game.getData('mode');
    game.history.seed = game.getData('seed');
  },
  recover: function () {
    game.audio.rememberVolume();
    var mode = game.history.mode,
        state = game.history.state,
        valid = game.states.validState(state),
        name = game.getData('name'),
        logged = (game.getData('logged') === true);
    var delay = 1000 * 60 * 60 * 24 * 30; // 30 days
    var recent = (new Date().valueOf() - game.history.last) < delay; 
    var recovering = logged && name && valid && recent;
    if (!recovering || state == 'log' || state == 'loading') {
      game.states.changeTo('log');
    } else {
      game.options.opt.show();
      game.states.log.out.show();
      if ((game.debug) || (state == 'choose' && mode == 'library')){
        game.history.jumpMode(mode, state, recovering);
      } else {
        game.history.jumpTo('menu', recovering);
      }
    }
    //console.log(mode, state, logged, name, valid, recent)
  },
  jumpMode: function (mode, state, recovering) {
    if (state == 'result') {
      mode = false;
      state = 'menu';
    }
    if (mode) {
      game.recovering = true;
      game.history.match(mode, recovering);
      game.history.picks();
    }
    game.history.jumpTo(state, recovering);
  },
  jumpTo: function (state, recover) {
    game.setData('last-activity', new Date().valueOf());
    game.confirm(function (confirmed) {
      if (confirmed) {
        game.player.name = game.getData('name');
        game.history.rank();
        game.history.campaign();
        game.chat.build(game.data.ui.reconnected);
        if ('AudioContext' in window) game.audio.build();
        game.states.changeTo(state, recover);
      } else game.states.changeTo('log');
    }, game.data.ui.welcome +' '+ game.getData('name') +'! '+ game.data.ui.log +'?');
  },
  campaign: function() {
    var id = game.getData('stage') || 'start';    
    game.states.campaign.stage = game.data.campaign[id];
    game.states.campaign.buildDesc(game.states.campaign.stage);
    if (game.getData('campaignDone')) {
      game.states.campaign.done = true;
      game.states.campaign.enableAllStages();
    } else {
      game.states.campaign.lane = game.getData('lane') || ['m', 'm'];
      var order = ['start','easy','normal','hard','last'];
      var end = order.indexOf(id);
      if (end > 0) {
        for (var i=1; i<=end; i++) { 
          var stage = order[i];
          game.states.campaign[stage+'Show']();
        }
      }
    }
  },
  match: function(mode, recovering) {
    game.setMode(mode, recovering);
    game.seed = game.history.seed;
    game.setData('seed', game.seed);
  },
  rank: function () {
    var p = game.getData('points');
    if ( typeof(p) == 'number') game.player.points = p;
  },
  picks: function() {
    var playerPicks = game.getData(game.player.type+'Deck');
    if (playerPicks) game.player.picks = playerPicks.split('|');
    var enemyPicks = game.getData(game.enemy.type+'Deck');
    if (enemyPicks) game.enemy.picks = enemyPicks.split('|');
  },
  saveMove: function (move) {
    var matchData = game.getData('matchData');
    if (!matchData) matchData = [];
    matchData.push(move);
    game.setData('matchData', matchData);
  },
  recoverMatch: function () {// console.log('recover')
    if (game.getData('challenged') == game.player.name) {
      game.player.type = 'challenged';
      game.enemy.type = 'challenger';
      game.currentTurnSide = 'player';
    } else {
      game.player.type = 'challenger';
      game.enemy.type = 'challenged';
      game.currentTurnSide = 'enemy';
    }
    if (!game.player.picks) game.player.picks = game.getData(game.player.type+'Deck').split('|');
    game.skill.calcMana('player');
    if (!game.enemy.picks) game.enemy.picks = game.getData(game.enemy.type+'Deck').split('|');
    game.skill.calcMana('enemy');
    game.units.build('player');
    game.units.build('enemy');
    game[game.mode].setTable();
    game.turn.el.text('Recovering').addClass('show');
    setTimeout(function () {
      game.enemy.autoMove(game.getData('matchData'), function () {
        game.recovering = false;
        game.turn.el.removeClass('show');
      });
    }, 1400);
  }
};
