game.states.vs = {
  build: function () {
    this.player = $('<div>').addClass('vsplayer slide');
    this.playername = $('<h1>').appendTo(this.player);
    this.playerdeck = $('<div>').addClass('vsdeckplayer').appendTo(this.player);
    this.playerinfo = $('<div>').addClass('vsplayerinfo').appendTo(this.player);
    this.vs = $('<p>').text('VS').addClass('versus').appendTo(this.el);
    this.enemy = $('<div>').addClass('vsenemy slide');
    this.enemyname = $('<h1>').appendTo(this.enemy);
    this.enemydeck = $('<div>').addClass('vsdeckenemy').appendTo(this.enemy);
    this.enemyinfo = $('<div>').addClass('vsenemyinfo').appendTo(this.enemy);
    this.el.append(this.player).append(this.enemy);
  },
  start: function (recover) {
    this.clear();
    game.message.text(game.data.ui.battle);
    if (recover && game.mode == 'online') {
      //todo: recover online games
      game.states.changeTo('log');
    } else {
      game.audio.stopSong();
      if (game.mode !== 'library') {
        game.audio.play('RandomEncounter', /*loop*/false, 'music', game.states.table.music);
      } else {
        setTimeout(game.states.table.music, 1600);
      }
      this.buildPlayer();
      this.buildEnemy();
      this.player.removeClass('slide');
      this.enemy.removeClass('slide');
      game.units.build('player');
      game.units.build('enemy');
      var t = 4600;
      if (game.mode == 'library') t = 1800;
      game.timeout(t - 300, function () {
        this.player.addClass('slide');
        this.enemy.addClass('slide');
        game.fx.build();
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
        var ch = deck.children();
        ch.sort(function (a,b) { 
          return game.player.picks.indexOf($(a).data('hero')) - game.player.picks.indexOf($(b).data('hero')); 
        });
        deck.append(ch);
      }
    });
    game.skill.calcMana('player');
    if (game.mode != 'library') this.playerinfo.text(game.data.ui.cardsperturn+': '+game.player.cardsPerTurn/*+' Max: '+game.player.maxCards*/);
    else {
      game.player.cardsPerTurn = 10;
      this.playerinfo.text(game.data.ui.mana + ': '+$('.vsplayerdeck .card').data('mana')/*+' Max: '+game.player.maxCards*/);
    }
  },
  buildEnemy: function () {
    if (game.mode == 'tutorial') game.enemy.name = game.data.ui.tutorial;
    if (game.mode == 'library') game.enemy.name = game.data.ui.library;
    if (game.mode == 'single') game.enemy.name = game.states.campaign.stage.name;
    if (game.mode == 'local') game.enemy.name = 'Challenger';
    this.enemyname.text(game.enemy.name);
    if (!game.enemy.type) game.enemy.type = 'challenger';
    game.enemy.picks = game.states.vs.enemyPicks();
    game.deck.build({
      name: 'heroes',
      filter: game.enemy.picks,
      cb: function (deck) {
        deck.addClass('vsenemyrdeck').appendTo(game.states.vs.enemydeck);
        var ch = deck.children();
        ch.sort(function (a,b) { 
          return game.enemy.picks.indexOf($(b).data('hero')) - game.enemy.picks.indexOf($(a).data('hero')); 
        });
        deck.append(ch);
      }
    });
    game.skill.calcMana('enemy');
    this.enemyinfo.text(game.data.ui.cardsperturn+': '+game.enemy.cardsPerTurn/*+' Max: '+game.enemy.maxCards*/);
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
    if (game.mode == 'library') {
      return [ 'lina', 'pud', 'wk', 'com', 'cat' ];
    }
    if (game.mode == 'tutorial') {
      return [ 'wk', 'cm', 'am', 'pud', 'ld' ];
    }
    if (game.mode == 'online') {
      picks = game.enemy.picks;
      if (picks && picks.length === 5) return picks;
      else return localStorage.getItem('enemydeck').split(',');
    }
    if (game.mode == 'single') {
      picks = game.enemy.picks;
      if (!picks || picks.length !== 5) picks = localStorage.getItem('enemydeck').split(',');
      //if (game.debug) picks = ['wk'];
      return picks;
    }
    if (game.mode == 'local') return game.enemy.picks;
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
