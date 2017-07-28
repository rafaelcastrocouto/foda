game.local = {
  build: function () {
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
  },
  chooseStart: function (hero, sec) {
    game.loader.removeClass('loading');
    game.states.choose.pickedbox.show();
    game.states.choose.randombt.show();
    game.states.choose.mydeck.show();
    game.states.choose.enablePick();
    game.states.choose.counter.show().text(game.data.ui.clickpick);
    $('.slot').addClass('available');
    if (!sec) game.message.text('Select player 1 deck');
    else game.message.text('Now, select player 2 deck');
    if (hero) game.states.choose.selectHero(hero, 'force');
    else game.states.choose.selectFirst('force');
  },
  pick: function () {
    var availableSlots = $('.slot.available').length;
    if (!availableSlots) {
      if (!game.local.firstDeck) {
        game.loader.addClass('loading');
        game.timeout(100, game.local.secondDeck);
      } else {
        game.local.chooseEnd();
      }
    }
  },
  secondDeck: function () {
    game.local.firstDeck = true;
    game.states.choose.fillPicks('player');
    game.states.choose.clear();
    game.timeout(100, function () {
      game.local.chooseStart(false, true);
    });
  },
  chooseEnd: function () {
    if (!game.local.firstDeck) {
      game.timeout(100, game.local.secondDeck);
    } else {
      game.local.firstDeck = false;
      game.states.choose.fillPicks('enemy');
      game.timeout(100, function () {
        game.states.choose.clear();
        game.states.changeTo('vs');
      });
    }
  },
  setTable: function () {
    game.player.placeHeroes();
    game.enemy.placeHeroes();
    game.message.text(game.data.ui.battle);
    game.states.table.surrender.show();
    game.states.table.skip.attr('disabled', true).show();
    game.states.table.discard.attr('disabled', true).show();
    game.states.table.enableUnselect();
    game.player.kills = 0;
    game.enemy.kills = 0;
    game.turn.build(6);
    game.timeout(400, function () {
      game.skill.build('enemy');
      game.skill.build('player', 0, function () {
        game.timeout(400, game.local.beginPlayer);
      });
    });
  },
  startTurn: function (turn) {
    game.states.table.skip.attr('disabled', false);
    game.turn.counter = game.timeToPlay;
    game.timeout(1000, function () { 
      game.turn.count(turn, game.local.countEnd);
    });
  },
  countEnd: function (turn) {
    if (turn == 'player-turn') { 
       game.local.endPlayer();
    } else {
      game.local.endEnemy();
    }
  },
  beginPlayer: function () {
    game.turn.beginPlayer(function () {
      game.local.startTurn('player-turn');
      if (game.player.turn === game.ultTurn) {
        $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
      }
      game.player.buyHand();
      game.tower.attack('enemy');
    });
  },
  skip: function () {
    if ( game.currentTurnSide == 'player' ) {
      game.local.endPlayer();
    } else {
      game.local.endEnemy();
    }
  },
  endPlayer: function () {
    
    game.turn.end('player-turn', game.local.beginEnemy);
  },

  beginEnemy: function () { 
    game.turn.beginEnemy(function () {
      game.local.startTurn('enemy-turn');
      if (game.selectedCard) game.selectedCard.reselect();
      if (game.enemy.turn === game.ultTurn) {
        $('.card', game.enemy.skills.ult).appendTo(game.enemy.skills.deck);
      }
      game.enemy.buyHand();
      game.tower.attack('player');
    });
  },
  endEnemy: function () {
    game.turn.end('enemy-turn', game.local.beginPlayer);
  },
  
  win: function () {
    game.turn.stopCount();
    game.winner = game.player.name;
    game.states.result.updateOnce = true;
    game.states.changeTo('result');
  },
  surrender: function () {
    if (game.currentTurnSide == 'enemy') game.local.win();
    else game.local.lose();
  },
  lose: function () {
    game.turn.stopCount();
    game.winner = game.enemy.name;
    game.states.result.updateOnce = true;
    game.states.changeTo('result');
  },
  clear: function () {
    game.seed = 0;
    game.id = null;
    game.moves = [];
  }
};
