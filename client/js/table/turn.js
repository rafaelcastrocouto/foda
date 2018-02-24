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
    game.player.deaths = 0;
    game.enemy.deaths = 0;
    game.turn.tickTime(true);
  },
  begin: function(side, cb) {
    if (game.currentState == 'table') {
      game[side].turn += 1;
      game.message.text(game.data.ui[side+'turn']);
      game.turn.el.text(game.data.ui[side+'turn']).addClass('show');
      if (!game.recovering) game.currentMoves = [];
      var t = 800;
      if (game.mode == 'local') t = 2800;
      game.timeout(t, function () {
        game.turn.el.removeClass('show');
        game.timeout(400, game.turn.play.bind(this, side, cb));
      });
    }
  },
  play: function (side, cb) {
    game.currentTurnSide = side;
    $('.map .fountain.enemyarea .card.enemy').heal(game.fountainHeal);
    $('.map .fountain.playerarea .card.player').heal(game.fountainHeal);
    $('.map .jungle .card.heroes').each(game.turn.jungle);
    $('.table .card').each(function () {
      game.turn.triggerStart(this, side);
    });
    if (game.mode == 'library') {
      if (side == 'player') {
        game.turn.enableAttackMove('player');
        game.turn.enableAttackMove('enemy');
      }
    } else game.turn.enableAttackMove(side);
    if (side == 'player') game.states.table.el.addClass('turn');
    if (side == 'enemy' && game.mode == 'local') game.states.table.el.addClass('unturn');
    game.loader.removeClass('loading');
    if (game.canPlay()) {
      game.states.table.skip.attr('disabled', false);
      game.states.table.surrender.attr('disabled', false);
    }
    game.highlight.map();
    if (cb) {
      game.timeout(400, cb.bind(this, side));
    }
  },
  count: function (side, endCallback, countCallback) {
    if (game.turn.counter >= 0 && !game.recovering) {
      var turncount;
      if (side === 'player') turncount = game.data.ui.playerturncount;
      if (side === 'enemy') turncount = game.data.ui.enemyturncount;
      game.message.text(turncount + ' ' + game.turn.counter + ' ' + game.data.ui.seconds);
      if (game.turn.counter > 0) {
        if (countCallback) countCallback(side);
        if (!((game.mode == 'local' || game.mode == 'single') && game.container.hasClass('option-state'))) {
          game.turn.counter -= 1;
        }
        game.turn.timeout = game.timeout(1000, game.turn.count.bind(this, side, endCallback, countCallback));
      }
      if (game.turn.counter === 0 && endCallback) {
        clearTimeout(game.turn.timeout);
        game.turn.timeout = game.timeout(1000, function () { endCallback(side); });
      }
    }
  },
  stopCount: function () {
    clearTimeout(game.turn.timeout);
    game.turn.counter = -1;
  },
  end: function (side, cb) {
    if (game.currentState == 'table') {
      game.currentTurnSide = false;
      game.message.text(game.data.ui.turnend);
      game.states.table.skip.attr('disabled', true);
      $('.map .card').each(function (i, el) {
        var card = $(el);
        card.removeClass('can-attack can-move');
        game.turn.channel(card);
        game.buff.turn(card);
        card.trigger('turnend', { target: card });
      });
      if (side == 'player') {
        game.states.table.el.removeClass('turn');
      }
      if (game.mode == 'local') {
        game.states.table.el.removeClass('turn unturn');
      }
      if (side == 'enemy' && game.mode !== 'library') {
        game.states.table.el.removeClass('unturn');
      }
      if (!game.recovering) {
        game.audio.play('activate');
        var move = 'U:'+side;
        game.history.saveMove(move);
      }
      game.turn.tickTime();
      if (cb) cb(side);
    }
  },
  jungle: function () {
    var hero = $(this);
    var side = hero.side();
    game.items.addMoney(side, game.jungleFarm);
  },
  triggerStart: function (el, side) {
    var card = $(el);
    card.trigger('turnstart', { target: card });
    card.trigger(side+'turnstart', { target: card });
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
  enableAttackMove: function(side) {
    $('.map .card.'+side+':not(.towers, .ghost)').each(function () {
      var unit = $(this);
      if (unit.canAttack(true)) unit.addClass('can-attack');
      if (unit.canMove(true)) unit.addClass('can-move');
    });
  },
  tickTime: function (build) { 
    if (!build) game.time += 0.5; // console.trace('t', game.time, game.turn.hours() );
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
