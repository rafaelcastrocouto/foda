game.single = {
  build: function () {
    if (!game.single.builded) {
      game.single.builded = false;
      game.newId();
    }
    game.player.type = 'challenged';
    game.enemy.type = 'challenger';
  },
  chooseStart: function (hero) {
    game.states.choose.randombt.show();
    game.states.choose.mydeck.attr({disabled: false}).show();
    if (game.getData('mydeck')) game.states.choose.mydeck.attr({disabled: false});
    game.states.choose.enablePick();
    game.states.choose.counter.show().text(game.data.ui.clickpick);
  },
  pick: function () {
    var availableSlots = $('.slot.available').length;
    if (!availableSlots) {
      game.loader.addClass('loading');
      game.states.choose.back.attr('disabled', true);
      game.single.chooseEnd('picked');
    }
  },
  chooseEnd: function (picked) {
    game.states.choose.fillPicks('player', picked);
    game.timeout(400, function () {
      game.states.changeTo('vs');
    });
  },
  setTable: function () {
    if (!game.single.started) {
      game.audio.play('horn');
      game.single.started = true;
      game.items.enableShop();
      game.states.table.enableUnselect();
      game.message.text(game.data.ui.battle);
      game.loader.removeClass('loading');
      game.player.placeHeroes();
      game.enemy.placeHeroes();
      game.turn.build(6);
      game.ai.start();
      game.timeout(400, function () {
        game.skill.build('enemy');
        game.skill.build('player', 0, function () {
          game.timeout(1000, game.single.beginPlayer);
        });
      });
    }
  },
  startTurn: function (turn) {
    if (turn == 'player') game.turn.counter = game.timeToPlay;
    else game.turn.counter = game.ai.timeToPlay;
    game.timeout(1000, function () {
      game.turn.count(turn, game.single.countEnd); 
    });
  },
  countEnd: function (turn) {
    if (turn == 'player') { 
       game.single.endPlayer();
    }
  },
  beginPlayer: function () {
    game.turn.begin('player', function () {
      game.single.startTurn('player');
      if (game.player.turn === game.ultTurn) {
        $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
      }
      game.skill.buyHand('player');
      game.tower.attack('enemy');
      game.items.addMoney('player', 50);
    });
  },
  skip: function () {
    game.single.endPlayer();
  },
  endPlayer: function () {
    game.turn.end('player', game.single.beginEnemy);
  },
  beginEnemy: function () {
    game.turn.begin('enemy', function () {
      game.single.startTurn('enemy');
      if (game.enemy.turn === game.ultTurn) {
        $('.card', game.enemy.skills.ult).appendTo(game.enemy.skills.deck);
      }
      game.skill.buyHand('enemy');
      game.tower.attack('player');
      game.items.addMoney('enemy', 50);
      game.timeout(2000, game.ai.turnStart);
    });
  },
  endEnemy: function () {
    game.turn.stopCount();
    game.turn.end('enemy', game.single.beginPlayer);
  },
  win: function () {
    game.turn.stopCount();
    game.nextStage = true;
    game.winner = game.player.type;
    game.player.points += 1;
    game.setData('points', game.player.points);
    game.states.changeTo('result');
  },
  surrender: function () {
    game.single.lose();
  },
  lose: function () {
    game.turn.stopCount();
    game.winner = game.enemy.type;
    game.loader.removeClass('loading');
    game.states.changeTo('result');
  },
  clear: function () {
    game.single.started = false;
  }
};