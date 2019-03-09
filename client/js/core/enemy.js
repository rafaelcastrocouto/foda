game.enemy = {
  startX: 4,
  startY: 6,
  money: 0,
  placeHeroes: function() {
    game.enemy.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.enemy.picks,
      cb: function(deck) {
        deck.addClass('cemitery enemy').hide().appendTo(game.states.table.enemy);
        var x = game.enemy.startX;
        var y = game.height - 1;
        $.each(JSON.parse(deck.data('cards')), function(i, cardId) {
          var card = $('#'+cardId);
          var p = game.enemy.picks.indexOf(card.data('hero'));
          card.addClass('enemy').on('mousedown touchstart', game.card.select);
          card.place(game.map.mirrorPosition(game.map.toPosition(x + p, y)));
          //console.log(p, card.data('hero'))
          if (game.mode == 'tutorial')
            card.on('select', game.tutorial.selected);
        });
      }
    });
  },
  autoMove: function(moves, cb) {
    if (game.recovering) game.message.text(game.data.ui.enemymove);
    if (typeof (moves) == 'string')
      game.currentMoves = moves.split('|');
    else
      game.currentMoves = moves;
    //console.log(game.currentMoves)
    game.enemy.autoMoveCount = 0;
    game.enemy.moveEndCallback = cb;
    if (game.currentMoves.length && game.currentMoves[0].length)
      game.timeout(1000, game.enemy.autoMoving);
    else
      game.timeout(1000, game.enemy.movesEnd);
  },
  autoMoving: function() {
    var from, to, hero, skillid, move;
    var m = game.currentMoves[game.enemy.autoMoveCount];
    if (m && m.length)
      move = m.split(':');
    if (move && move.length) {
      $('.enemyMoveHighlight').removeClass('enemyMoveHighlight');
      $('.enemyMoveHighlightTarget').removeClass('enemyMoveHighlightTarget');
      $('.source').removeClass('source');
      game.enemy.moveAnimation = 1600;
      //console.log(move)
      if (move[1]) {
        if (game.recovering) from = move[1];
        else from = game.map.mirrorPosition(move[1]);
        if (move[2]) {
          if (game.recovering) to = move[2];
          else to = game.map.mirrorPosition(move[2]);
        }
        if (move[0] === 'M') { // MOVE
          game.enemy.move(from, to);
        }
        if (move[0] === 'A') { // ATTACK
          game.enemy.attack(from, to);
        }
        if (move[0] === 'C') { // CAST
          hero = move[3];
          skillid = move[4];
          game.enemy.cast(from, to, hero, skillid);
          game.enemy.moveAnimation = 2000;
          if (skillid == 'ult') game.enemy.moveAnimation = 3000;
        }
        if (move[0] === 'P') { // PASSIVE
          if (game.recovering) to = move[1];
          else to = game.map.mirrorPosition(move[1]);
          hero = move[2];
          skillid = move[3];
          game.enemy.passive(to, hero, skillid);
        }
        if (move[0] === 'T') { // TOGGLE
          if (game.recovering) to = move[1];
          else to = game.map.mirrorPosition(move[1]);
          hero = move[2];
          skillid = move[3];
          game.enemy.toggle(to, hero, skillid);
        }
        if (move[0] === 'S') { // SUMMON
          if (game.recovering && game.currentTurnSide == 'player') to = move[1];
          else to = game.map.mirrorPosition(move[1]);
          creep = move[2];
          game.enemy.summonCreepMove(to, creep);
        }
        if (move[0] === 'D') { // DISCARD
          hero = move[1];
          skillid = move[2];
          game.enemy.discardMove(hero, skillid);
          game.enemy.moveAnimation = 600;
        }
        if (move[0] === 'G') { // STOP CHANNEL
          game.enemy.stopChanneling(from);
        }
        if (move[0] === 'B') { // BUY ITEM
          game.enemy.buyItem(move[1],move[2]);
        }
        if (move[0] === 'U') { // END TURN
          var cb = game[game.mode].endPlayer;
          if (move[1] == 'enemy') cb = game[game.mode].endEnemy;
          cb();
        }
      }
      game.enemy.autoMoveCount++;
      if ( (game.enemy.autoMoveCount < game.currentMoves.length) && 
          !(game.mode == 'single' && game.turn.counter < 1) ) {
          game.timeout(game.enemy.moveAnimation, game.enemy.autoMoving);
      } else
        game.timeout(game.enemy.moveAnimation, game.enemy.movesEnd);
    }
  },
  movesEnd: function() {
    $('.enemyMoveHighlight').removeClass('enemyMoveHighlight');
    $('.enemyMoveHighlightTarget').removeClass('enemyMoveHighlightTarget');
    $('.source').removeClass('source');
    if (game.mode == 'single' && game.turn.counter < 1)
      game.ai.endTurn();
    else
      game.timeout(1000, game.enemy.moveEndCallback);
  },
  move: function(from, to) {
    var target = $('#' + from + ' .card')
      , destiny = $('#' + to);
    var canMove = target.hasClass('can-move') && target.hasClass('enemy');
    if (to && (canMove || game.recovering) && target.move && destiny.hasClass('free')) {
      target.addClass('enemyMoveHighlight');
      target.removeClass('can-move');
      target.move(to);
    }
  },
  attack: function(from, to) {
    var source = $('#' + from + ' .card');
    var target = $('#' + to + ' .card');
    if (to && (source.hasClass('enemy') || game.recovering) && source.attack && target) {
      source.addClass('enemyMoveHighlight');
      source.attack(to);
      target.addClass('enemyMoveHighlightTarget');
    }
  },
  cast: function(from, to, hero, skillid) {// console.log('cast')
    var source = $('#' + from + ' .card');
    var target = $('#' + to);
    var s = hero + '-' + skillid;
    var skill = $('.'+game.currentTurnSide+'decks .hand .skills.' + s + ', .'+game.currentTurnSide+'decks .sidehand .skills.' + s).first();
    if (source.hasClass('towers')) //item
      skill = $('.table .items.' + hero + '.' + skillid).first();
    var targets = skill.data('targets');
    var card;
    if (targets) {
      targets = JSON.parse(targets);
      if (targets.indexOf(game.data.ui.enemy) >= 0 || targets.indexOf(game.data.ui.ally) >= 0 || targets.indexOf(game.data.ui.self) >= 0) {
        card = $('#' + to + ' .card');
        if (card.length)
          target = card;
      }
    }
    skill.addClass('showMoves');
    source.addClass('enemyMoveHighlight');
    if (target.hasClass('.card'))
      target.addClass('enemyMoveHighlightTarget');
    if (game.mode == 'single')
      skill.data('ai discard', undefined);
    if (skill && (source.hasClass('enemy') || game.recovering) && source.cast) {
      game.timeout(game.enemy.moveAnimation, function(skill, target, hero, skillid) {
        if (source.hasClass('towers') && game.items[hero] && game.items[hero][skillid] && game.items[hero][skillid].cast) {
          source.cast(skill, target);
        } else if (game.skills[hero] && game.skills[hero][skillid] && game.skills[hero][skillid].cast) {
          source.cast(skill, target);
        }
      }
      .bind(this, skill, target, hero, skillid));
    }
  },
  passive: function(to, hero, skillid) {
    // console.log(game.currentData.moves)
    var target = $('#' + to + ' .card');
    var s = hero + '-' + skillid;
    var skill = $('.'+game.currentTurnSide+'decks .hand .skills.' + s + ', .'+game.currentTurnSide+'decks .sidehand .skills.' + s).first();
    skill.addClass('showMoves');
    target.addClass('enemyMoveHighlight');
    game.timeout(game.enemy.moveAnimation, function(skill, target, hero, skillid) {
      skill.removeClass('showMoves');
      if (game.skills[hero][skillid].passive && skill && target.hasClass('enemy') && skill.passive) {
        skill.passive(target);
      }
    }
    .bind(this, skill, target, hero, skillid));
  },
  toggle: function(to, hero, skillid) {
    var target = $('#' + to + ' .card');
    var s = hero + '-' + skillid;
    var skill = $('.'+game.currentTurnSide+'decks .hand .skills.' + s + ', .'+game.currentTurnSide+'decks .sidehand .skills.' + s).first();
    skill.addClass('showMoves');
    target.addClass('enemyMoveHighlight');
    game.timeout(game.enemy.moveAnimation, function(skill, target, hero, skillid) {
      skill.removeClass('showMoves');
      if (game.skills[hero][skillid].toggle && skill && target.hasClass('enemy') && skill.toggle) {
        skill.toggle(target);
      }
    }
    .bind(this, skill, target, hero, skillid));
  },
  summonCreep: function(event) {
    var target = $(this);
    var to = target.getPosition();
    var card = game.selectedCard;
    var creep = card.data('unit');
    if (card.canPlay() || game.mode == 'library') {
      game.units.summonCreep(target, to, creep, event);
    }
  },
  summonCreepMove: function(to, creep) {
    var target = $('#' + to);
    var creepCard = game[game.currentTurnSide].skills.sidehand.children('.creeps-' + creep).first();
    if (target.hasClass('free') && creepCard.length) {
      game.audio.play('activate');
      creepCard.addClass('showMoves');
      game.timeout(game.enemy.moveAnimation, function() {
        game.fx.add('ld-return-target', target);
        creepCard.removeClass('showMoves flipped').place(target);
        creepCard.trigger('summon');
      });
    }
  },
  stopChanneling: function(pos) {
    //console.log(pos)
    var card = $('#' + pos + ' .card');
    if (card.length) card.stopChanneling();
  },
  buyItem: function (item, itemtype) {
    var card = $('.items.'+game.currentTurnSide+' .'+item+'.'+itemtype);
    if (card.length) game.items.newCard(game.currentTurnSide,card);
    if (game.currentTurnSide == 'player') {
      game.items.addMoney(game.currentTurnSide, -card.data('price'));
      card.data('buyTurn', game.totalTurns);
    }
  },
  discard: function(skill) {
    game.skill.disableDiscard();
    skill.addClass('discardMove');
    game.timeout(200, function() {
      this.removeClass('discardMove');
      this.discard();
    }
    .bind(skill));
  },
  discardMove: function(hero, skillid) {
    var s = hero + '-' + skillid;
    var skill = $('.'+game.currentTurnSide+'decks .hand .skills.' + s).first();
    if (!skill.length) {
      s = hero + '.' + skillid;
      skill = $('.'+game.currentTurnSide+'decks .sidehand .items.' + s).first();
    }
    if (skill) {
      skill.addClass('discardMove');
      game.timeout(game.enemy.moveAnimation, skill.discard.bind(skill));
    }
    if (skill.hasClass('items')) {
       game.items.addMoney(game.currentTurnSide, skill.data('price')/2);
    }
  },
  cardsInHand: function() {
    return game.enemy.skills.hand.children().length;
  }
};
