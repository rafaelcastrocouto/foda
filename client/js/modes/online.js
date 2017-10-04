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
  },
  ask: function () {
    game.db({
      'set': 'waiting',
      'data': game.currentData
    }, function (waiting) { //console.log('response:', waiting);
      if (waiting.id == 'none') game.online.wait();
      else game.online.found(waiting);
    });
  },
  wait: function () {
    game.loader.addClass('loading');
    game.setData('id', game.id);
    game.player.type = 'challenged';
    game.setData('challenged', game.player.name);
    game.db({
      'set': game.id,
      'data': game.currentData
    }, function () {
      game.message.text(game.data.ui.waiting);
      game.tries = 0;
      game.online.waiting = true;
      setTimeout(game.online.searching, 1000);
    });
  },
  searching: function () {
    if (game.id && game.online.waiting) {
      game.db({ 'get': game.id }, function (found) {
        if (found.challenger) {
          game.online.waiting = false;
          game.online.challengerFound(found.challenger);
        } else {
          game.triesCounter.text(game.tries += 1);
          if (game.tries >= game.waitLimit) {
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
    /*if (game.currentData[game.player.type+'Deck'] &&
        game.currentData[game.player.type+'Deck'].split('|').length == 5) {
      game.player.picks = game.currentData[game.player.type+'Deck'].split('|');
      game.online.chooseEnd();
    } else */
    setTimeout(game.online.enablePick, 200);
  },
  enablePick: function () {
    game.states.choose.randombt.show().attr({disabled: false});
    game.states.choose.mydeck.show();
    if (localStorage.getItem('mydeck')) game.states.choose.mydeck.attr({disabled: false});
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
        game.online.chooseEnd();
      }
    }
  },
  chooseEnd: function () {
    game.states.choose.disablePick();
    game.states.choose.counter.text(game.data.ui.getready);
    game.states.choose.fillPicks('player');
    game.online.sendDeck();
  },
  sendDeck: function () {
    game.states.choose.pickDeck.css('margin-left', 0);
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
        if (game.tries >= 10) game.states.choose.back.attr({disabled: false});
        if (game.tries > game.connectionLimit) {
          game.reset('online.js 167: Unable to load enemy deck');
        } else { game.timeout(1000, game.online.loadDeck.bind(this, type)); }
      }
    });
  },
  foundDeck: function (type, found) {
    game.triesCounter.text('');
    var typeDeck = type + 'Deck';
    game.setData(typeDeck, found[typeDeck]);
    game.enemy.picks = found[typeDeck].split('|');
    localStorage.setItem('enemydeck', game.enemy.picks);
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
      game.player.placeHeroes();
      game.enemy.placeHeroes();
      game.states.table.surrender.show();
      game.states.table.discard.attr('disabled', true).show();
      game.states.table.skip.show();
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
    if (turn == 'enemy-turn') {
      t = 3000;
      game.loader.addClass('loading');
    }
    game.timeout(t, function () { 
      game.turn.count(turn, game.online.countEnd, game.online.preGetTurnData);
    });
  },
  countEnd: function (turn) {
    if (turn == 'player-turn') { 
      game.online.endPlayerTurn();
    }
    if (turn == 'enemy-turn') {
      game.tries = 0;
      game.loader.addClass('loading');
      game.message.text(game.data.ui.loadingturn);
      game.online.getTurnData();
    }
  },

  beginPlayer: function () {
    game.turn.beginPlayer(function () {
      game.online.startTurn('player-turn');
      if (game.player.turn === game.ultTurn) {
        $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
      } 
      game.player.buyHand();
      game.tower.attack('enemy');
    });
  },
  action: function () {
    game.timeout(400, function () {
      if (game.turn.noAvailableMoves()) {
        game.online.preEndPlayer();
      }
    });
  },
  skip: function () {
    game.online.preEndPlayer();
  },
  preEndPlayer: function () {
    game.turn.stopCount();
    game.online.endPlayerTurn();
  },
  endPlayerTurn: function () {
    game.turn.end('player-turn', game.online.sendTurnData);
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
    game.turn.beginEnemy(function () {
      game.online.startTurn('enemy-turn');
      if (game.enemy.turn === game.ultTurn) {
        $('.card', game.enemy.skills.ult).appendTo(game.enemy.skills.deck);
      }
      game.enemy.buyHand();
    });
  },
  preGetTurnData: function (turn) {
    if (turn == 'enemy-turn') {
      game.db({ 'get': game.id }, function (data) {
        var challengeTurn = game.enemy.type + 'Turn';
        if (data[challengeTurn] === game.enemy.turn) 
          game.online.preEndEnemy(data);
      });
    }
  },
  preEndEnemy: function (data) {
    game.turn.stopCount();
    game.online.beginEnemyMoves(data, 'pre');
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
          game.reset('online.js 307: Unable to load enemy turn data');
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
      game.enemy.startMoving(game.online.endEnemyTurn);
    }
  },
  endEnemyTurn: function () {
    game.turn.end('enemy-turn', game.online.beginPlayer);
  },
  win: function () {
    game.turn.stopCount();
    game.winner = game.player.name;
    game.player.points += 10;
    localStorage.setItem('points', game.player.points);
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
    game.winner = game.enemy.name;
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
    game.moves = [];
    localStorage.removeItem('data');
    localStorage.removeItem('seed');
    localStorage.removeItem('challenge');
  }
};
