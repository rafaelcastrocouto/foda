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
           game.online.battle('creator', game.currentData.creator);
      else game.online.battle('challenger', game.currentData.challenger);
    }
  },
  updateList: function () {
    game.states.config.listTitle.text(game.data.ui.loading);
    game.db({
      'get': 'waiting'
    }, function (waiting) {
      game.online.buildList(waiting);
    });
   if (game.mode === 'online') setTimeout(game.online.updateList, 4000);
  },
  buildList: function (list) {
    $('.onlineList .button').remove();
    if (Object.keys(list).length) {
      game.states.config.listTitle.hide();
      for (var id in list) {
        var waiting = list[id];
        var button = $('<div>').addClass('button').text(waiting.creator+' '+waiting.size).on('mouseup touchend', game.online.clickList).data('waiting', waiting);
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
    game.player.type = 'creator';
    game.setData('creator', game.player.name);
    game.setData('size', game.size);
    game.loader.addClass('loading');
    game.message.text(game.data.ui.loading);
    game.peer = new Peer();
    game.peer.on('open', game.online.joinList);
  },
  joinList: function () {
    game.newId();
    game.setData('id', game.id);
    game.db({
      'set': 'join',
      'data': {
        id: game.id,
        size: game.size,
        creator: game.player.name,
        peer: game.peer.id
      },
    }, function (waiting) {
      game.online.buildList(waiting);
      setTimeout(game.online.wait, 1000);
      game.peer.on('connection', function (conn) {
        if (!game.online.challengerConnected) {
          game.online.challengerConnected = true;
          game.online.challengerFound(conn);
          conn.on('data', game.online.challengerData);
        }
      });
    });
  },
  wait: function () {
    game.states.changeTo('choose');
    game.loader.addClass('loading');
    game.message.text(game.data.ui.waiting);
    game.online.waiting = true;
    game.tries = 1;
    setTimeout(game.online.searching, 1000);
  },
  searching: function () {
    if (game.id && game.online.waiting) {
      game.triesCounter.text(game.tries);
      if (game.tries > game.waitLimit) {
        game.online.joinList();
      } else { 
        game.tries += 1;
        game.timeout(1000, game.online.searching);
      }
    }
  },
  challengerFound: function (conn) {
    if (game.online.waiting) {
      game.message.text(game.data.ui.gamefound);

      var sendConn = game.peer.connect(conn.peer);
      sendConn.on('open', function () {
        game.online.enemyConn = sendConn;
      });
    }
  },
  challengerData: function (data) { // -> creator
    if (game.online.waiting && data.challenger) {
      game.online.waiting = false;
      game.online.matchData = data;
      game.online.battle('challenger', data.challenger);
    }
    if (data.challengerDeck) {
      game.online.matchData.challengerDeck = data.hallengerDeck;
      if (game.online.picked) game.online.foundDecks();
    }
    game.online.getTurnData(data);
  },
  backClick: function () {
    game.online.builded = false;
    game.online.started = false;
    game.loader.removeClass('loading');
    game.triesCounter.text('');
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
  joinGame: function (match) {
    game.player.type = 'challenger';
    game.setData('challenger', game.player.name);
    game.online.waiting = true;
    game.loader.addClass('loading');
    game.message.text(game.data.ui.loading);
    game.online.confirmMatch();
    game.peer = new Peer();
    game.peer.on('open', function () { //console.log('game.peer.open')
      var sendConn = game.peer.connect(match.peer);
      sendConn.on('open', function () {
        game.online.enemyConn = sendConn;
        game.message.text(game.data.ui.gamefound);
        game.online.waiting = false;
        game.online.found(match);
        match.challenger = game.player.name;
        sendConn.send(match);
        game.online.matchData = match;
      });
    });
    game.peer.on('connection', function (conn) {
      conn.on('data', game.online.creatorData);
    });
  },
  confirmMatch: function () {
    if (game.online.waiting) {
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
  },
  found: function (match) {
    game.states.choose.back.attr({disabled: true});
    game.message.text(game.data.ui.gamefound);
    game.setId(match.id);
    game.states.config.size(match.size);
    game.online.battle('creator', match.creator);
    game.states.changeTo('choose');
  },
  creatorData: function (data) {// -> challenger
    if (data.creatorDeck) {
      game.online.matchData.creatorDeck = data.creatorDeck;
      if (game.online.picked) game.online.foundDecks();
    } 
    game.online.getTurnData(data);
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
    game.online.choosing = true;
  },
  enablePick: function () {
    game.states.choose.randombt.show().attr({disabled: false});
    game.states.choose.mydeck.show();
    if (game.getData('mydeck')) game.states.choose.mydeck.attr({disabled: false});
    game.states.choose.enablePick();
    game.states.choose.count = game.timeToPick;
    game.online.loadDeck();
    setTimeout(game.online.pickCount, 1000);
  },
  pickCount: function () {
    game.states.choose.count -= 1;
    if (game.online.choosing) {
      game.states.choose.counter.text(game.data.ui.pickdeck + ': ' + game.states.choose.count);
    }
    if (game.states.choose.count < 0 || game.online.picked) {
      game.states.choose.counter.text(game.data.ui.getready);
      game.online.choosing = false;
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
        if (game.online.matchData[game.enemy.type + 'Deck']) {
          game.online.choosing = false;
        }
      }
    }
  },
  chooseEnd: function (picked) {
    game.states.choose.disablePick();
    game.states.choose.counter.text(game.data.ui.getready);
    game.states.choose.fillPicks('player', picked);
    game.online.picked = true;
    game.online.sendDeck();
    if (game.online.matchData[game.enemy.type + 'Deck']) game.online.foundDecks();
  },
  sendDeck: function () {
    var picks = game.player.picks.join('|');
    game.setData(game.player.type + 'Deck', picks);
    game.online.matchData[game.player.type + 'Deck'] = picks;
    game.online.enemyConn.send(game.online.matchData);
  },
  loadDeck: function () {
    if (game.online.picked) game.message.text(game.data.ui.loadingdeck);
    if (game.online.matchData[game.enemy.type + 'Deck']) {
      game.triesCounter.text('');
      if (game.online.picked) game.online.foundDecks();
    } else {
      game.triesCounter.text(game.tries);
      if (game.tries >= game.timeToPick + game.connectionLimit) {
        game.states.choose.back.attr({disabled: false});
      } else if (game.tries >= game.timeToPick + (2 * game.connectionLimit)) {
        game.online.backClick();
      } else { 
        game.tries += 1;
        game.timeout(1000, game.online.loadDeck);
      }
    }
  },
  foundDecks: function () {
    if (!game.online.decksPicked) {
      game.online.decksPicked = true;
      game.online.choosing = false;
      game.triesCounter.text('');
      var enemyDeck = game.enemy.type + 'Deck';
      game.setData(enemyDeck, game.online.matchData[enemyDeck]);
      game.enemy.picks = game.online.matchData[enemyDeck].split('|');
      game.setData(game.enemy.type+'Deck', game.enemy.picks);
      game.states.choose.clear();
      game.states.changeTo('vs');
    }
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
      game.turn.count(turn, game.online.countEnd);
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
      game.online.waitTurnData();
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
    var moves = game.currentMoves.join('|');
    if (!moves) moves = true;
    game.setData('moves', moves);
    game.setData(challengeTurn, game.player.turn);
    game.online.matchData.moves = moves;
    game.online.matchData[challengeTurn] = game.player.turn;
    game.online.enemyConn.send(game.online.matchData);
    game.online.beginEnemy();
  },

  beginEnemy: function () {
    game.turn.begin('enemy', function () {
      game.online.startTurn('enemy');
      game.turn.buy('enemy');
      game.online.waitintTurnData = true;
    });
  },
  getTurnData: function (data) { //console.log(data)
    if (data.surrender) game.online.win();
    else {
      var challengeTurn = game.enemy.type + 'Turn';
      if (data[challengeTurn] === game.enemy.turn+1) { 
        game.turn.stopCount();
        game.online.waitintTurnData = false;
        game.online.beginEnemyMoves(data);
      }
    }
  },
  waitTurnData: function () {
    if (game.online.waitintTurnData) {
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
        game.timeout(1000, game.online.waitTurnData);
      }
    }
  },
  beginEnemyMoves: function (data) {
    game.triesCounter.text('');
    game.setData(game.enemy.type, game.enemy.turn);
    game.setData('moves', data.moves);
    game.enemy.autoMove(data.moves, game.online.endEnemy);
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
    game.online.matchData.surrender = game.player.type;
    game.online.matchData[game.player.type+'Turn'] = game.player.turn;
    game.online.enemyConn.send(game.online.matchData);
    game.online.lose();
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
