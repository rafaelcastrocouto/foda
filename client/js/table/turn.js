game.turn = {
  build: function (time) {
    if (!game.turn.builded) {
      game.turn.builded = true;
      game.turn.msg = $('<p>').appendTo(game.topbar).addClass('turns').text(game.data.ui.turns + ': 0/0 (0)');
      game.turn.time = $('<p>').appendTo(game.topbar).addClass('time').text(game.data.ui.time + ': 0:00 Day');
      game.turn.el = $('<h1>').addClass('turntitle').appendTo(game.states.table.el);
    }
    game.time = time || 0;
    game.player.turn = 0;
    game.enemy.turn = 0;
    game.player.kills = 0;
    game.enemy.kills = 0;
    game.moves = [];
    game.turn.tickTime();
  },
  beginPlayer: function (cb) {
    if (game.currentState == 'table') {
      game.player.turn += 1;
      game.message.text(game.data.ui.yourturn);
      game.turn.el.text(game.data.ui.yourturn).addClass('show');
      game.turn.start('player-turn', cb);
    }
  },
  beginEnemy: function (cb) {
    if (game.currentState == 'table') {
      game.enemy.turn += 1;
      game.message.text(game.data.ui.enemyturn);
      game.loader.addClass('loading');
      game.turn.start('enemy-turn', cb);
    }
  },
  start: function (turn, cb) {
    game.currentMoves = [];
    $('.table .card.dead').each(function () {
      var dead = $(this);
      if (game.time > dead.data('reborn') && !dead.hasBuff('wk-ult') ) { 
        dead.reborn();
      }
    });
    $('.table .card').each(function () {
      var card = $(this);
      card.trigger('turnstart', { target: card });
      if (turn == 'player-turn') card.trigger('playerturnstart', { target: card });
      if (turn == 'enemy-turn') card.trigger('enemyturnstart', { target: card });
    });
    game.timeout(400, game.turn.tickTime);
    game.timeout(800, function () {
      game.turn.el.removeClass('show');
      if (turn == 'player-turn') {
        game.timeout(400, function () {
          game.loader.removeClass('loading');
          $('.map .card').removeClass('done');
          game.states.table.el.addClass('turn');
          game.states.table.skip.attr('disabled', false);
          game.highlight.map();
        });
      }
      if (cb) {
        if (turn == 'player-turn') cb(turn);
        else game.timeout(1000, cb.bind(this, turn));
      }
    });
  },
  count: function (turn, endCallback, countCallback) {
    if (game.turn.counter >= 0) {
      var turncount;
      if (turn === 'player-turn') turncount = game.data.ui.yourturncount;
      if (turn === 'enemy-turn') turncount = game.data.ui.enemyturncount;
      game.message.text(turncount + ' ' + game.turn.counter + ' ' + game.data.ui.seconds);
      if (game.turn.counter > 0) {
        if (countCallback) countCallback(turn);
        game.turn.counter -= 1;
        game.turn.timeout = game.timeout(1000, game.turn.count.bind(this, turn, endCallback, countCallback));
      }
      if (game.turn.counter === 0 && endCallback) {
        clearTimeout(game.turn.timeout);
        game.turn.timeout = game.timeout(1000, function () { endCallback(turn); });
      }
    }
  },
  stopCount: function () {
    clearTimeout(game.turn.timeout);
    game.turn.counter = -1;
  },
  end: function (turn, cb) {
    if (game.currentState == 'table') {
      game.turn.tickTime();
      game.message.text(game.data.ui.turnend);
      game.moves.push(game.currentMoves.join('|'));
      $('.map .card').each(function (i, card) {
        var hero = $(card);
        game.turn.channel(hero);
        game.buff.turn(hero);
        hero.trigger('turnend', { target: hero });
      });
      if (turn == 'player-turn') {
        game.states.table.el.removeClass('turn');
        game.states.table.skip.attr('disabled', true);
      }
      if (turn == 'enemy-turn' && game.mode !== 'library') { 
        game.turn.el.text(game.data.ui.enemyturn).addClass('show');
        game.timeout(800, function () { game.turn.el.removeClass('show'); });
      }
      if (cb) cb(turn);
    }
  },
  channel: function (hero) {
    if (hero.hasClass('channeling')) {
      var duration = hero.data('channeling');
      if (duration >= 0) {
        hero.trigger('channel', hero.data('channel event')); 
        duration -= 1;
        hero.data('channeling', duration);
        if (duration === 0) hero.stopChanneling();
      }
    }
  },
  noAvailableMoves: function () {
    return $('.map .player.card:not(.towers, .ghost)').length == $('.map .player.card.done:not(.towers, .ghost)').length;
  },
  tickTime: function () { 
    game.time += 0.5; // console.trace('t', game.time, game.turn.hours() );
    game.totalTurns = Math.floor(game.player.turn + game.enemy.turn);
    game.turn.msg.text(game.data.ui.turns + ': ' + game.player.turn + '/' + game.enemy.turn + ' (' + game.totalTurns + ')');
    game.turn.time.html(game.data.ui.time + ': ' + game.turn.hours() + ' ' + game.turn.dayNight());
  },
  hours: function () {
    var convertedMin, intMin, stringMin,
      hours = game.time % (game.dayLength * 2),
      intHours = parseInt(hours, 10),
      minutes = hours - intHours;
    convertedMin = minutes * 60;
    intMin = parseInt(convertedMin, 10);
    stringMin = intMin < 10 ? '0' + intMin : intMin;
    return intHours + ':' + stringMin;
  },
  dayNight: function () {
    var hours = game.time % (game.dayLength * 2);
    if (hours >= 6 && hours < 18) {
      game.camera.removeClass('night');
      return '<span title="' + game.data.ui.day + '">☀</span>';
    } else {
      game.camera.addClass('night');
      return '<span title="' + game.data.ui.night + '">🌙</span>';
    }
  }
};
