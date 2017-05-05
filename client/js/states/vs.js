game.states.vs = {
  build: function () {
    this.player = $('<div>').addClass('vsplayer slide');
    this.playername = $('<h1>').appendTo(this.player);
    this.playerdeck = $('<div>').addClass('vsdeckplayer').appendTo(this.player);
    this.vs = $('<p>').text('VS').addClass('versus').appendTo(this.el);
    this.enemy = $('<div>').addClass('vsenemy slide');
    this.enemyname = $('<h1>').appendTo(this.enemy);
    this.enemydeck = $('<div>').addClass('vsdeckenemy').appendTo(this.enemy);
    this.el.append(this.player).append(this.enemy);
  },
  start: function (recover) {
    this.clear();
    game.message.text(game.data.ui.battle);
    if (recover && game.mode == 'online') {
      //todo: recover online games
      game.states.changeTo('log');
    } else {
      this.buildPlayer();
      this.buildEnemy();
      this.player.removeClass('slide');
      this.enemy.removeClass('slide');
      var t = 3600;
      if (game.mode == 'library') t = 2000;
      game.timeout(t - 300, function () {
        this.player.addClass('slide');
        this.enemy.addClass('slide');
      }.bind(this));
      game.timeout(t, this.toTable);
    }
  },
  buildPlayer: function () {
    this.playername.text(game.player.name);
    if (!game.player.type) game.player.type = 'challenged';
    game.player.picks = game.states.vs.playerPicks();
    game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('vsplayerdeck').appendTo(game.states.vs.playerdeck);
      }
    });
  },
  buildEnemy: function () {
    if (!game.enemy.name) {
      if (game.mode == 'tutorial') game.enemy.name = game.data.ui.tutorial;
      if (game.mode == 'library') game.enemy.name = game.data.ui.library;
      if (game.mode == 'single') game.enemy.name = 'Stage ' + (localStorage.getItem('stage') || 1);
    }
    this.enemyname.text(game.enemy.name);
    if (!game.enemy.type) game.enemy.type = 'challenger';
    game.enemy.picks = game.states.vs.enemyPicks();
    game.deck.build({
      name: 'heroes',
      filter: game.enemy.picks,
      cb: function (deck) {
        deck.addClass('vsenemyrdeck').appendTo(game.states.vs.enemydeck);
      }
    });
  },
  playerPicks: function () {
    if (game.mode == 'library') {
      var hero;
      if (game.library.hero) {
        hero = game.library.hero;
      } else {
        hero = localStorage.getItem('choose');
        game.library.hero = hero;
      }
      return [hero];
    } else {
      var picks = game.player.picks;
      if (picks && picks.length === 5) return picks;
      else return localStorage.getItem('mydeck').split(',');
    }
  },
  enemyPicks: function () {
    var picks;
    if (game.mode == 'library' || game.mode == 'tutorial') {
      return [ 'nyx', 'kotl', 'pud', 'ld', 'am' ];
    }
    if (game.mode == 'online') {
      picks = game.enemy.picks;
      if (picks && picks.length === 5) return picks;
      else return localStorage.getItem('enemydeck').split(',');
    }
    if (game.mode == 'single') {
      picks = game.enemy.picks;
      if (!picks || picks.length !== 5) picks = localStorage.getItem('enemydeck').split(',');
      // picks = ['am']
      return picks.shuffle();
    }
  },
  toTable: function () {
    game.states.vs.clear();
    game.states.changeTo('table');
  },
  clear: function () {
    $('.card', game.states.vs.el).remove();
  },
  end: function () {
  }
};
