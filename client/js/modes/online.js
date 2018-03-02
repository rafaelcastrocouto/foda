game.online = {
  build: function (recover) {
    game.online.builded = true;
    game.loader.addClass('loading');
    game.states.choose.randombt.show().attr({disabled: true});
    game.states.choose.mydeck.show().attr({disabled: true});
    game.states.choose.pickedbox.hide();
    if (!game.online.started && !recover) game.online.start();
    if (recover) {
      if (game.currentData.challenger) {
        if (game.player.name == game.currentData.challenger) game.online.battle('challenged', game.currentData.challenged);
        else game.online.battle('challenger', game.currentData.challenger);
      }
      else game.online.wait();
    }
  },
  start: function () {
    game.online.started = true;
    game.currentData = {};
    game.newId();
    game.setData('id', game.id);
    game.online.ask();
    game.tries = 0;
    game.triesLoop = 0;
    game.loader.addClass('loading');
    game.message.text(game.data.ui.loading);
    game.states.choose.back.attr({disabled: true});
  },
  ask: function () {//console.log('ask');
    game.db({
      'set': 'waiting',
      'data': game.id,
    }, function (waiting) { //console.log('ask:', waiting);
      game.triesCounter.text(game.tries += 1);
      game.triesLoop += 1;
      if (waiting && waiting.id) {
        if (waiting.id == 'none' || waiting.id == game.id) game.online.wait();
        else game.online.found(waiting);
      } else {
        setTimeout(game.online.ask, 1000);
      }
    });
  },
  backClick: function () {
    game.db({
      'set': 'back',
      'data': game.id,
    }, game.states.choose.toMenu);
  },
  wait: function () {
    game.setData('id', game.id);
    game.player.type = 'challenged';
    game.setData('challenged', game.player.name);
    game.db({
      'set': game.id,
      'data': game.currentData
    }, function () {
      game.message.text(game.data.ui.waiting);
      game.online.waiting = true;
      game.triesLoop = 0;
      setTimeout(game.online.searching, 1000);
    });
  },
  searching: function () {
    game.states.choose.back.attr({disabled: false});
    if (game.id && game.online.waiting) {
      game.db({ 'get': game.id }, function (found) {
        if (found.challenger) {
          game.online.waiting = false;
          game.online.challengerFound(found.challenger);
        } else {
          game.triesCounter.text(game.tries += 1);
          game.triesLoop += 1;
          if (game.triesLoop >= game.waitLimit) {
            game.online.ask();
          } else { game.timeout(1000, game.online.searching); }
        }
      });
    }
  },
  challengerFound: function (enemyName) {
    game.states.choose.back.attr({disabled: true});
    game.message.text(game.data.ui.gamefound);
    game.online.battle('challenger', enemyName);
  },
  found: function (waiting) {
    game.states.choose.back.attr({disabled: true});
    game.message.text(game.data.ui.gamefound);
    game.setId(waiting.id);
    game.player.type = 'challenger';
    game.setData('challenger', game.player.name);
    // ask challenged name
    game.db({ 'get': waiting.id }, function (found) {
      //console.log('found:', found);
      var enemyName = found.challenged;
      if (enemyName) { // tell player name
        game.db({
          'set': game.id,
          'data': game.currentData
        }, function () {
          game.online.battle('challenged', enemyName);
        });
      }
    });
  },
  battle: function (type, name) {
    game.tries = 0;
    game.triesCounter.text('');
    game.loader.removeClass('loading');
    game.enemy.name = name;
    game.enemy.type = type;
    game.setData(type, name);
    game.message.html(game.data.ui.battlefound + ' <b>' + game.player.name + '</b> vs <b class="enemy">' + game.enemy.name + '</b>');
    game.states.choose.counter.show();
    game.audio.play('battle');
    setTimeout(game.online.enablePick, 400);
  },
  enablePick: function () {
    game.states.choose.randombt.show().attr({disabled: false});
    game.states.choose.mydeck.show();
    if (game.getData('mydeck')) game.states.choose.mydeck.attr({disabled: false});
    game.states.choose.enablePick();
    game.states.choose.count = game.timeToPick;
    setTimeout(game.online.pickCount, 1000);
  },
  pickCount: function () {
    game.states.choose.count -= 1;
    if ($('.slot.available').length) {
      game.states.choose.counter.text(game.data.ui.pickdeck + ': ' + game.states.choose.count);
    }
    if (game.states.choose.count < 0) {
      game.states.choose.counter.text(game.data.ui.getready);
      if (!game.online.picked) {
        game.states.choose.disablePick();
        game.states.choose.counter.text(game.data.ui.getready);
        game.states.choose.randomFill(game.online.chooseEnd);
      }
    } else { game.timeout(1000, game.online.pickCount); }
  },
  pick: function () {
    if ($('.slot.available').length === 0) {
      if (!game.online.picked) {
        game.online.picked = true;
        game.online.chooseEnd('picked');
      }
    }
  },
  chooseEnd: function (picked) {
    game.states.choose.disablePick();
    game.states.choose.counter.text(game.data.ui.getready);
    game.states.choose.fillPicks('player', picked);
    game.online.sendDeck();
  },
  sendDeck: function () {
    //game.states.choose.pickDeck.css('margin-left', 0);
    var picks = game.player.picks.join('|');
    // check if enemy picked
    game.db({ 'get': game.id }, function (found) {
      var cb;
      game.setData(game.player.type + 'Deck', picks);
      if (found[game.enemy.type + 'Deck']) {
        cb = function () { game.online.foundDeck(game.enemy.type, found); };
      } else cb = function () { game.online.loadDeck(game.enemy.type); };
      game.db({
        'set': game.id,
        'data': game.currentData
      }, cb);
    });
  },
  loadDeck: function (type) {
    game.message.text(game.data.ui.loadingdeck);
    game.loader.addClass('loading');
    game.db({ 'get': game.id }, function (found) {
      if (found[type + 'Deck']) {
        game.online.foundDeck(type, found);
      } else {
        game.triesCounter.text(game.tries += 1);
        if (game.tries >= game.timeToPick + game.connectionLimit) {
          game.states.choose.back.attr({disabled: false});
        } else if (game.tries >= game.timeToPick + (2 * game.connectionLimit)) {
          //game.reset('Online.js 184: Unable to load enemy deck');
          game.online.backClick();
        } else { game.timeout(1000, game.online.loadDeck.bind(this, type)); }
      }
    });
  },
  foundDeck: function (type, found) {
    game.triesCounter.text('');
    var typeDeck = type + 'Deck';
    game.setData(typeDeck, found[typeDeck]);
    game.enemy.picks = found[typeDeck].split('|');
    game.setData(game.enemy.type+'Deck', game.enemy.picks);
    game.states.choose.clear();
    game.states.changeTo('vs');
  },

  setTable: function () {
    if (!game.online.table) {
      game.online.table = true;
      game.states.table.enableUnselect();
      game.loader.addClass('loading');
      game.message.text(game.data.ui.battle);
      game.audio.play('horn');
      game.items.enableShop();
      game.player.placeHeroes();
      game.enemy.placeHeroes();
      game.turn.build(6);
      game.timeout(400, function () {
        game.skill.build('enemy');
        game.skill.build('player', 0, function () {
          if (game.player.type === 'challenger') {
            game.timeout(1000, game.online.beginEnemy);
          } else {
            game.timeout(1000, game.online.beginPlayer);
          }
        });
      });
    }
  },
  startTurn: function (turn) {
    game.turn.counter = game.timeToPlay;
    var t = 1000;
    if (turn == 'enemy') {
      t = 3000;
      game.loader.addClass('loading');
    }
    game.timeout(t, function () {
      game.turn.count(turn, game.online.countEnd, game.online.preGetTurnData);
    });
  },
  countEnd: function (turn) {
    if (turn == 'player') { 
      game.online.endPlayer();
    }
    if (turn == 'enemy') {
      game.tries = 0;
      game.loader.addClass('loading');
      game.message.text(game.data.ui.loadingturn);
      game.online.getTurnData();
    }
  },

  beginPlayer: function () {
    game.turn.begin('player', function () {
      game.online.startTurn('player');
      if (game.player.turn === game.ultTurn) {
        $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
      } 
      game.skill.buyHand('player');
      game.tower.attack('enemy');
      game.items.addMoney('player', 50);
    });
  },
  skip: function () {
    game.turn.stopCount();
    game.online.endPlayer();
  },
  endPlayer: function () {
    game.turn.end('player', game.online.sendTurnData);
  },
  sendTurnData: function () {
    var challengeTurn = game.player.type + 'Turn';
    game.message.text(game.data.ui.uploadingturn);
    game.setData('moves', game.currentMoves.join('|'));
    game.setData(challengeTurn, game.player.turn);
    game.db({ 'get': game.id }, function (data) {
      if (data.surrender) {
        game.online.win();
      } else {
        game.db({
          'set': game.id,
          'data': game.currentData
        }, game.online.beginEnemy);
      }
    });
  },

  beginEnemy: function () {
    game.turn.begin('enemy', function () {
      game.online.startTurn('enemy');
      if (game.enemy.turn === game.ultTurn) {
        $('.card', game.enemy.skills.ult).appendTo(game.enemy.skills.deck);
      }
      game.skill.buyHand('enemy');
      game.tower.attack('player');
      game.items.addMoney('enemy', 50); 
    });
  },
  preGetTurnData: function (turn) {
    if (turn == 'enemy') {
      game.db({ 'get': game.id }, function (data) {
        var challengeTurn = game.enemy.type + 'Turn';
        if (data[challengeTurn] === game.enemy.turn) {
          game.turn.stopCount();
          game.online.beginEnemyMoves(data, 'pre');
        }
      });
    }
  },
  getTurnData: function () {
    game.db({ 'get': game.id }, function (data) {
      var challengeTurn = game.enemy.type + 'Turn';
      if (data[challengeTurn] === game.enemy.turn) {
        game.online.beginEnemyMoves(data);
      } else {
        game.tries += 1;
        game.triesCounter.text(game.tries);
        if (game.tries > game.connectionLimit) {
          if (game.debug) game.reset('online.js 307: Unable to load enemy turn data');
          else {
            game.db({ 'get': 'server' }, function (serverdata) {
              if (serverdata.status == 'online') game.online.win();
            });
          }
        } else { game.timeout(1000, game.online.getTurnData); }
      }
    });
  },
  beginEnemyMoves: function (data) {
    if (data.surrender) {
      game.online.win();
    } else {
      game.triesCounter.text('');
      game.setData(game.enemy.type, game.enemy.turn);
      game.setData('moves', data.moves);
      game.enemy.autoMove(data.moves, game.online.endEnemy);
    }
  },
  endEnemy: function () {
    game.turn.end('enemy', game.online.beginPlayer);
  },
  win: function () {
    game.turn.stopCount();
    game.winner = game.player.type;
    game.player.points += 10;
    game.setData('points', game.player.points);
    game.online.sendTurnData('over');
    game.states.changeTo('result');
  },
  surrender: function () {
    game.turn.stopCount();
    game.setData('surrender', true);
    game.setData(game.player.type+'Turn', game.player.turn);
    game.db({
      'set': game.id,
      'data': game.currentData
    }, game.online.lose);
  },
  lose: function () {
    game.turn.stopCount();
    game.winner = game.enemy.type;
    game.loader.removeClass('loading');
    game.states.changeTo('result');
  },
  clear: function () {
    game.online.builded = false;
    game.online.started = false;
    game.online.picked = false;
    game.online.table = false;
    game.currentData = {};
    game.seed = 0;
    game.id = null;
  }
};
