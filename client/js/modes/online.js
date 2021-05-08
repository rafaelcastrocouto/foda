game.online = {
  build: function (recover) {
    game.online.builded = true;
    game.tries = 1;
    if (recover) {
      game.online.recover();
    }
  },
  recover: function () {
    if (game.currentData.challenger) {
      if (game.player.name == game.currentData.challenger) 
           game.online.battle('challenged', game.currentData.challenged);
      else game.online.battle('challenger', game.currentData.challenger);
    }
  },
  updateList: function () {
    game.states.config.listTitle.text(game.data.ui.loading);
    game.db({
      'get': 'waiting'
    }, function (waiting) {//  console.log('updateList',waiting)
      game.online.buildList(waiting);
    });
   if (game.mode === 'online') setTimeout(game.online.updateList, 10000/3);
  },
  buildList: function (list) {
    $('.onlineList .button').remove();
    if (Object.keys(list).length) {
      game.states.config.listTitle.hide();
      for (var id in list) {
        var waiting = list[id]; //  console.log(match)
        var button = $('<div>').addClass('button').text(waiting.name+' '+waiting.size).on('mouseup touchend', game.online.clickList).data('waiting', waiting);
        if (waiting.id === game.id) button.attr('disabled', true);
        game.states.config.list.append(button);
      }
    } else {
      game.states.config.listTitle.text(game.data.ui.waiting).show();
    }
  },
  // CHALLENGED
  create: function () {
    game.online.started = true;
    game.currentData = {};
    game.player.type = 'challenged';
    game.newId();
    game.setData('id', game.id);
    game.setData('challenged', game.player.name);
    game.setData('size', game.size);
    game.loader.addClass('loading');
    game.message.text(game.data.ui.loading);
    game.online.joinList();
  },
  joinList: function () { //console.log('joining list');
    game.db({
      'set': 'join',
      'data': {
        id: game.id,
        size: game.size,
        name: game.player.name
      },
    }, function (waiting) {// console.log('joined list', waiting);
      game.online.buildList(waiting);
      setTimeout(game.online.wait, 1000);
    });
  },
  wait: function () {// console.log('wait')
    game.states.changeTo('choose');
    game.loader.addClass('loading');
    game.message.text(game.data.ui.waiting);
    game.online.waiting = true;
    game.tries = 1;
    //game.states.choose.back.attr({disabled: false});
    setTimeout(game.online.searching, 1000);
  },
  searching: function () { //console.log('searching')
    if (game.id && game.online.waiting) {
      game.db({ 'get': game.id + 'challenger' }, function (found) {  // searching
        if (found.challenger) {
          game.online.waiting = false;
          game.online.challengerFound(found.challenger);
        } else {
          game.triesCounter.text(game.tries);
          if (game.tries > game.waitLimit) {
            game.online.joinList();
          } else { 
            game.tries += 1;
            game.timeout(1000, game.online.searching);
          }
        }
      });
    }
  },
  challengerFound: function (enemyName) { //console.log('challengerFound')
    game.db({
      'set': game.id + 'challenged',
      'data': game.currentData
    }, function () {
      game.message.text(game.data.ui.gamefound);
      game.online.battle('challenger', enemyName);
    });
  },
  backClick: function () { //console.log('back')
    game.online.builded = false;
    game.online.started = false;
    game.db({
      'set': 'back',
      'data': game.id,
    });
    game.states.changeTo('config');
  },
  clickList: function () {
    var button = $(this);
    button.attr('disabled', true);
    game.online.possibleButton = button;
    game.online.joinGame(button.data('waiting'));
  },
  // CHALLENGER
  joinGame: function (match) { //console.log('joinGame');
    game.online.possibleMatch = match;
    game.player.type = 'challenger';
    game.setData('challenger', game.player.name);
    game.db({
      'set': game.online.possibleMatch.id + 'challenger',
      'data': game.currentData
    }, function () {
      game.message.text(game.data.ui.gamefound);
      game.online.waiting = true;
      game.online.confirmMatch();
    });
  },
  confirmMatch: function () {
    if (game.online.waiting) {
      game.db({ 'get': game.online.possibleMatch.id + 'challenged' }, function (match) {  // searching
        if (match.challenged) {
          game.online.waiting = false;
          game.online.found(match);
        } else {
          game.triesCounter.text(game.tries);
          if (game.tries > game.waitLimit/4) {
            game.online.possibleButton.remove();
            game.message.text('');
            game.online.waiting = false;
            game.online.clear();
          } else { 
            game.tries += 1;
            game.timeout(1000, game.online.confirmMatch);
          }
        }
      });
    }
    game.db({ 'get': game.online.possibleMatch.id + 'challenged' }, function (match) {
      //console.log(match)
      if (match) {
       
      }
    });
  },
  found: function (match) { //console.log('found',match.id)
    game.states.choose.back.attr({disabled: true});
    game.message.text(game.data.ui.gamefound);
    game.setId(match.id);
    // ask challenged name
    game.db({ 'get': match.id + 'challenged' }, function (found) { // found
      var enemyName = found.challenged; //console.log('found:', found);
      if (enemyName) { // tell player name
        game.db({
          'set': game.id + 'challenger',
          'data': game.currentData
        }, function () { //console.log('tochoose')
          game.states.config.size(found.size);
          game.online.battle('challenged', enemyName);
          game.states.changeTo('choose');
        });
      }
    });
  },
  battle: function (type, name) {
    game.tries = 1;
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
  chooseStart: function () {
    game.states.choose.randombt.show().attr({disabled: true});
    game.states.choose.mydeck.show().attr({disabled: true});
    game.states.choose.pickedbox.hide();
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
    var cb;
    game.setData(game.player.type + 'Deck', picks);
    game.db({
      'set': game.id + game.player.type, // send deck
      'data': game.currentData
    }, function () {
      game.online.loadDeck(game.enemy.type);
    });
  },
  loadDeck: function (type) {
    game.message.text(game.data.ui.loadingdeck);
    game.loader.addClass('loading');
    game.db({ 'get': game.id + type }, function (found) { // load deck
      if (found[type + 'Deck']) {
        game.online.foundDeck(type, found);
      } else {
        game.triesCounter.text(game.tries);
        if (game.tries >= game.timeToPick + game.connectionLimit) {
          game.states.choose.back.attr({disabled: false});
        } else if (game.tries >= game.timeToPick + (2 * game.connectionLimit)) {
          game.online.backClick();
        } else { 
          game.tries += 1;
          game.timeout(1000, game.online.loadDeck.bind(this, type));
        }
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
      game.tries = 1;
      game.loader.addClass('loading');
      game.message.text(game.data.ui.loadingturn);
      game.online.getTurnData();
    }
  },
  beginPlayer: function () {
    game.turn.begin('player', function () {
      game.online.startTurn('player');
      game.turn.buy('player');
    });
  },
  skip: function () {
    game.turn.stopCount();
    game.online.endPlayer();
  },
  endPlayer: function () {
    game.turn.end('player', game.online.sendTurnData);
  },
  sendTurnData: function (cb) {
    var challengeTurn = game.player.type + 'Turn';
    game.message.text(game.data.ui.uploadingturn);
    game.setData('moves', game.currentMoves.join('|'));
    game.setData(challengeTurn, game.player.turn);
    //check if enemy surrendered
    game.db({ 'get': game.id + game.enemy.type }, function (data) { // check surrender
      if (data.surrender) {
        game.online.win();
      } else if (cb) {
        cb();
      } else {
        game.db({
          'set': game.id + game.player.type, // send turn
          'data': game.currentData
        }, game.online.beginEnemy);
      }
    });
  },

  beginEnemy: function () {
    game.turn.begin('enemy', function () {
      game.online.startTurn('enemy');
      game.turn.buy('enemy');
    });
  },
  preGetTurnData: function (turn) {
    if (turn == 'enemy') {
      game.db({ 'get': game.id + game.enemy.type }, function (data) { // pre get turn
        var challengeTurn = game.enemy.type + 'Turn';
        //console.log(data[challengeTurn], game.enemy.turn)
        if (data[challengeTurn] === game.enemy.turn+1) {
          game.turn.stopCount();
          game.online.beginEnemyMoves(data, 'pre');
        }
      });
    }
  },
  getTurnData: function () {
    game.db({ 'get': game.id + game.enemy.type }, function (data) { // get turn
      var challengeTurn = game.enemy.type + 'Turn';
      if (data[challengeTurn] === game.enemy.turn+1) {
        game.online.beginEnemyMoves(data);
      } else {
        game.triesCounter.text(game.tries);
        if (game.tries > game.connectionLimit) {
          if (game.debug) game.reset('online.js: Unable to load enemy turn data');
          else {
            game.db({ 'get': 'server' }, function (serverdata) {
              if (serverdata.status == 'online') game.online.win();
            });
          }
        } else {
          game.tries += 1;
          game.timeout(1000, game.online.getTurnData);
        }
      }
    });
  },
  beginEnemyMoves: function (data) {
    if (data.surrender == game.enemy.type) {
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
    game.online.sendTurnData(function () {
      game.states.changeTo('result');
    });
  },
  surrender: function () {
    game.turn.stopCount();
    game.setData('surrender', game.player.type);
    game.setData(game.player.type+'Turn', game.player.turn);
    game.db({
      'set': game.id + game.player.type, // surrender
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
