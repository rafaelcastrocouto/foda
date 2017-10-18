game.single = {
  build: function () {
    if (!game.single.builded) {
      game.single.builded = false;
      game.newId();
    }
  },
  chooseStart: function (hero) {
    game.states.choose.randombt.show();
    game.states.choose.mydeck.show();
    game.states.choose.enablePick();
    game.states.choose.counter.show().text(game.data.ui.clickpick);
  },
  pick: function () {
    var availableSlots = $('.slot.available').length;
    if (!availableSlots) {
      game.loader.addClass('loading');
      game.states.choose.back.attr('disabled', true);
      game.timeout(400, game.single.chooseEnd);
    }
  },
  chooseEnd: function () {
    game.states.choose.fillPicks('player');
    game.states.changeTo('vs');
  },
  setTable: function () {
    if (!game.single.started) {
      game.audio.play('horn');
      game.single.started = true;
      game.states.table.enableUnselect();
      game.message.text(game.data.ui.battle);
      game.loader.removeClass('loading');
      game.player.placeHeroes();
      game.enemy.placeHeroes();
      game.states.table.surrender.show();
      game.states.table.skip.show().attr('disabled', true);
      game.states.table.discard.attr('disabled', true).show();
      game.turn.build(6);
      game.player.kills = 0;
      game.enemy.kills = 0;
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
    if (turn == 'player-turn') game.turn.counter = game.timeToPlay;
    else game.turn.counter = 30;
    game.timeout(1000, function () { 
      game.turn.count(turn, game.single.countEnd); 
    });
  },
  countEnd: function (turn) {
    if (turn == 'player-turn') { 
       game.single.endPlayerTurn();
    }
  },
  beginPlayer: function () {
    game.turn.beginPlayer(function () {
      game.single.startTurn('player-turn');
      if (game.player.turn === game.ultTurn) {
        $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
      }
      game.player.buyHand();
      game.tower.attack('enemy');
    });
  },
  skip: function () {
    game.single.endPlayerTurn();
  },
  endPlayerTurn: function () {
    game.turn.end('player-turn', game.single.beginEnemy);
  },
  beginEnemy: function () {
    game.turn.beginEnemy(function () {
      game.single.startTurn('enemy-turn');
      if (game.enemy.turn === game.ultTurn) {
        $('.card', game.enemy.skills.ult).appendTo(game.enemy.skills.deck);
      }
      game.enemy.buyHand();
      game.tower.attack('player');
      game.timeout(2000, game.ai.turnStart);
    });
  },
  endEnemyTurn: function () {
    game.turn.stopCount();
    game.turn.end('enemy-turn', game.single.beginPlayer);
  },
  win: function () {
    game.turn.stopCount();
    game.states.campaign.nextStage();
    game.winner = game.player.name;
    game.player.points += 1;
    localStorage.setItem('points', game.player.points);
    game.states.changeTo('result');
  },
  surrender: function () {
    game.single.lose();
  },
  lose: function () {
    game.turn.stopCount();
    game.winner = game.enemy.name;
    game.loader.removeClass('loading');
    game.states.changeTo('result');
  },
  clear: function () {
    game.single.started = false;
  }
};