game.history = {
  build: function () {
    game.history.state = localStorage.getItem('state');
    game.history.backstate = localStorage.getItem('backstate');
    game.history.mode = localStorage.getItem('mode');
    game.history.data = localStorage.getItem('data');
    game.history.seed = localStorage.getItem('seed');
    game.history.last = localStorage.getItem('last-activity');
  },
  recover: function () {
    var mode = game.history.mode,
        state = game.history.state,
        valid = game.states.validState(state),
        log = localStorage.getItem('log'),
        logged = (localStorage.getItem('logged') === 'true');
    var delay = 1000 * 60 * 60 * 24 * 3; // 3 days
    var recent = (new Date().valueOf() - game.history.last) < delay; 
    var recovering = logged && log && valid && recent;
    if (!recovering) game.history.jumpTo('log');
    else {
      game.options.opt.show();
      game.states.log.out.show();
      game.rank.start();
      game.player.name = log;
      if (state !== 'log') {
        game.states.log.createBkgDeck();
        game.chat.build();
        setTimeout(game.chat.set.bind(game.chat, game.data.ui.reconnected), 200);
      }
      if (game.debug) {
        if (state == 'loading') state = 'log';
        if (state == 'table') state = 'vs';
        if (mode) game.setMode(mode, recovering);
        if (mode == 'online') {
          game.currentData = JSON.parse(game.history.data);
          game.setId(game.currentData.id);
        }
        game.history.jumpTo(state, recovering);
      } else {
        game.history.jumpTo('menu', recovering);
      }
    }
  },
  jumpTo: function (state, recover) {
    localStorage.setItem('last-activity', new Date().valueOf());
    //if (!recover && game.history.state !== 'choose') game.clear();
    //game.db({ 'get': 'server' }, function (server) {
      //if (server.status === 'online') {
        game.states.changeTo(state, recover);
      //} else { game.reset('history.js 46: Server offline'); }
    //});
  }
};
