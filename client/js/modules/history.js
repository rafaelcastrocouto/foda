game.history = {
  build: function () {
    game.history.state = game.getData('state');
    game.history.backstate = game.getData('backstate');
    game.history.mode = game.getData('mode');
    game.history.seed = game.getData('seed');
    game.history.last = game.getData('last-activity');
  },
  recover: function () {
    var mode = game.history.mode,
        state = game.history.state,
        valid = game.states.validState(state),
        name = game.getData('name'),
        logged = (game.getData('logged') === true);
    var delay = 1000 * 60 * 60 * 24 * 3; // 3 days
    var recent = (new Date().valueOf() - game.history.last) < delay; 
    var recovering = logged && name && valid && recent;
    if (!recovering) game.history.jumpTo('log');
    else {
      game.options.opt.show();
      game.states.log.out.show();
      game.rank.start();
      game.player.name = name;
      if (state !== 'log') {
        game.bkgdeck.create();
        game.chat.build();
        setTimeout(game.chat.set.bind(game.chat, game.data.ui.reconnected), 200);
      }
      if (state == 'loading') state = 'log';
      if (state == 'result') {
        mode = false;
        state = 'menu';
      }
      if (game.debug) {
        if (mode) {
          var picks = game.getData(game.player.type+'Deck');
          if (picks) game.player.picks = picks.split('|');
          picks = game.getData(game.enemy.type+'Deck');
          if (picks) game.enemy.picks = picks.split('|');
          game.recovering = true;
          game.setMode(mode, recovering);
          game.setId(game.currentData.id);
        }
        game.history.jumpTo(state, recovering);
      } else if (state == 'log' || (state == 'choose' && mode == 'library')) {
        game.history.jumpTo(state, recovering);
      } else {
        game.history.jumpTo('menu', recovering);
      }
    }
  },
  jumpTo: function (state, recover) {
    game.setData('last-activity', new Date().valueOf());
    if (state == 'log') game.states.changeTo('log');
    else game.confirm(function (confirmed) {
      if (confirmed) {
        if ('AudioContext' in window) game.audio.build();
        game.states.changeTo(state, recover);
      } else game.states.changeTo('log');
    }, game.data.ui.welcome +' '+ game.getData('name') +'! '+ game.data.ui.log +'?');
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
