game.local = {
  build: function () {
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.player.type = 'challenged';
    game.enemy.type = 'challenger';
    game.setData('challenged', game.player.name);
    game.setData('challenger', game.enemy.name);
  },
  chooseStart: function (hero, sec) {
    var playerDeck = game.getData(game.player.type+'Deck');
    if (!sec && playerDeck) {
      // recovering
      game.player.picks = playerDeck.split('|');
      game.local.secondDeck();
    } else {
      game.loader.removeClass('loading');
      game.states.choose.pickedbox.show();
      game.states.choose.randombt.show().attr({disabled: false});
      game.states.choose.mydeck.show().attr({disabled: true});
      if (!sec && game.getData('mydeck')) game.states.choose.mydeck.attr({disabled: false});
      if (sec && game.getData('mysecdeck')) game.states.choose.mydeck.attr({disabled: false});
      game.states.choose.enablePick();
      game.states.choose.counter.show().text(game.data.ui.clickpick);
      $('.slot').addClass('available');
      if (!sec) game.message.text('Select player 1 deck');
      else game.message.text('Now, select player 2 deck');
      if (hero) game.states.choose.selectHero(hero, 'force');
      else game.states.choose.selectFirst('force');
    }
  },
  pick: function () {
    var availableSlots = $('.slot.available:visible').length;
    if (!availableSlots) {
      if (!game.local.firstDeck) {
        game.loader.addClass('loading');
        game.timeout(100, game.local.secondDeck.bind(this, 'picked'));
      } else {
        game.local.chooseEnd('picked');
      }
    }
  },
  secondDeck: function (picked) {
    game.local.firstDeck = true;
    game.states.choose.fillPicks('player', picked);
    game.setData(game.player.type + 'Deck', game.player.picks.join('|'));
    game.states.choose.clear();
    game.timeout(100, function () {
      game.local.chooseStart(false, true);
    });
  },
  chooseEnd: function (picked) {
    if (!game.local.firstDeck) {
      game.timeout(100, game.local.secondDeck);
    } else {
      game.states.choose.fillPicks('enemy', picked);
      game.setData(game.enemy.type + 'Deck', game.enemy.picks.join('|'));
      game.timeout(100, function () {
        game.states.choose.clear();
        game.local.firstDeck = false;
        game.states.changeTo('vs');
      });
    }
  },
  setTable: function () {
    game.player.placeHeroes();
    game.enemy.placeHeroes();
    game.audio.play('horn');
    game.items.enableShop();
    game.message.text(game.data.ui.battle);
    game.states.table.enableUnselect();
    game.turn.build(6);
    game.timeout(400, function () {
      game.skill.build('enemy');
      game.skill.build('player', false, function () {
        game.timeout(1000, game.local.beginPlayer);
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
    if (turn == 'player') { 
       game.local.endPlayer();
    } else {
      game.local.endEnemy();
    }
  },
  beginPlayer: function () {
    game.turn.begin('player', function () {
      game.local.startTurn('player');
      game.highlight.refresh();
      if (game.player.turn === game.ultTurn) {
        $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
      }
      game.skill.buyHand('player');
      game.tower.attack('enemy');
      game.items.addMoney('player', 50);
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
    if (game.selectedCard) game.selectedCard.unselect();
    game.turn.end('player', game.local.beginEnemy);
  },

  beginEnemy: function () { 
    game.items.updateShop('enemy');
    game.turn.begin('enemy', function () {
      game.local.startTurn('enemy');
      game.highlight.refresh();
      if (game.enemy.turn === game.ultTurn) {
        $('.card', game.enemy.skills.ult).appendTo(game.enemy.skills.deck);
      }
      game.skill.buyHand('enemy');
      game.tower.attack('player');
      game.items.addMoney('enemy', 50);
    });
  },
  endEnemy: function () {
    if (game.selectedCard) game.selectedCard.unselect();
    game.turn.end('enemy', game.local.beginPlayer);
  },
  win: function () {
    game.turn.stopCount();
    game.winner = game.player.type;
    game.states.changeTo('result');
  },
  surrender: function () {
    if (game.currentTurnSide == 'enemy') game.local.win();
    else game.local.lose();
  },
  lose: function () {
    game.turn.stopCount();
    game.winner = game.enemy.type;
    game.states.changeTo('result');
  },
  clear: function () {
    game.local.firstDeck = false;
    game.seed = 0;
    game.id = null;
  }
};
