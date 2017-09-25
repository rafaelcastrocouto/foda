game.enemy = {
  placeHeroes: function() {
    game.enemy.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.enemy.picks,
      cb: function(deck) {
        deck.addClass('cemitery enemy').hide().appendTo(game.states.table.enemy);
        var x = 2;
        var y = 4;
        $.each(deck.data('cards'), function(i, card) {
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
  buyCard: function() {
    var availableSkills = $('.table .enemy .skills.available .card'), card, heroid, hero, to, skillid;
    if (availableSkills.length < game.enemy.cardsPerTurn + 1) {
      $('.table .enemy .skills.cemitery .card').appendTo(game.enemy.skills.deck);
      availableSkills = $('.table .enemy .skills.available .card');
    }
    card = availableSkills.randomCard();
    if (card.data('hand') === game.data.ui.right) {
      if (game.enemy.skills.hand.children().length < game.maxSkillCards) {
        card.appendTo(game.enemy.skills.hand);
      }
    } else if (game.enemy.skills.sidehand.children().length < game.maxSkillCards) {
      card.appendTo(game.enemy.skills.sidehand);
    }
  },
  buyHand: function() {
    //if (!game.debug) {
    //  game.enemy.buyCards(4);
    //} else {
      game.enemy.buyCreeps();
      if (game.enemy.turn > 1)
        game.enemy.buyCards(game.enemy.cardsPerTurn);
    //}
  },
  buyCreeps: function(force, catapultforce) {
    var ranged, melee, catapult;
    if (game.enemy.turn === game.creepTurn || force) {
      game.units.buy('enemy');
    }
    if (game.enemy.turn === game.catapultTurn || catapultforce) {
      game.units.buyCatapult('enemy');
    }
  },
  buyCards: function(n) {
    for (var i = 0; i < n; i++) {
      game.enemy.buyCard();
    }
  },
  startMoving: function(cb) {
    game.message.text(game.data.ui.enemymove);
    if (typeof (game.currentData.moves) == 'string')
      game.currentMoves = game.currentData.moves.split('|');
    else
      game.currentMoves = game.currentData.moves;
    //console.log(game.currentMoves)
    game.enemy.autoMoveCount = 0;
    game.enemy.moveEndCallback = cb;
    if (game.currentMoves.length && game.currentMoves[0].length)
      game.timeout(1000, game.enemy.autoMove);
    else
      game.timeout(1000, game.enemy.movesEnd);
  },
  autoMove: function() {
    var from, to, hero, skillid, move;
    var m = game.currentMoves[game.enemy.autoMoveCount];
    if (m && m.length) move = m.split(':');
    if (move && move.length) {
      $('.enemyMoveHighlight').removeClass('enemyMoveHighlight');
      $('.enemyMoveHighlightTarget').removeClass('enemyMoveHighlightTarget');
      $('.source').removeClass('source');
      game.enemy.moveAnimation = 1600;
      if (move[1]) {
        from = game.map.mirrorPosition(move[1]);
        if (move[2])
          to = game.map.mirrorPosition(move[2]);
        if (move[0] === 'M') {
          game.enemy.move(from, to);
        }
        if (move[0] === 'A') {
          game.enemy.attack(from, to);
        }
        if (move[0] === 'C') {
          skillid = move[3];
          hero = move[4];
          game.enemy.cast(from, to, hero, skillid);
          game.enemy.moveAnimation = 3600;
        }
        if (move[0] === 'P') {
          to = game.map.mirrorPosition(move[1]);
          skillid = move[2];
          hero = move[3];
          game.enemy.passive(to, hero, skillid);
        }
        if (move[0] === 'T') {
          to = game.map.mirrorPosition(move[1]);
          skillid = move[2];
          hero = move[3];
          game.enemy.toggle(to, hero, skillid);
        }
        if (move[0] === 'S') {
          to = game.map.mirrorPosition(move[1]);
          creep = move[2];
          game.enemy.summonCreepMove(to, creep);
        }
        if (move[0] === 'D') {
          skillid = move[1];
          hero = move[2];
          game.enemy.discard(hero, skillid);
        }
        if (move[0] === 'G') {
          game.enemy.stopChanneling(from);
        }
      }
      game.enemy.autoMoveCount++;
      if (game.enemy.autoMoveCount < game.currentMoves.length) {
        game.timeout(game.enemy.moveAnimation, game.enemy.autoMove);
      } else
        game.timeout(game.enemy.moveAnimation, game.enemy.movesEnd);
    }
  },
  movesEnd: function() {
    $('.enemyMoveHighlight').removeClass('enemyMoveHighlight');
    $('.enemyMoveHighlightTarget').removeClass('enemyMoveHighlightTarget');
    $('.source').removeClass('source');
    game.timeout(1000, game.enemy.moveEndCallback);
  },
  move: function(from, to) {
    var target = $('#' + from + ' .card');
    if (to && !target.hasClass('done') && target.hasClass('enemy') && target.move) {
      target.addClass('enemyMoveHighlight');
      target.move(to);
      target.addClass('done');
    }
  },
  attack: function(from, to) {
    var source = $('#' + from + ' .card');
    var target = $('#' + to + ' .card');
    if (to && !source.hasClass('done') && source.hasClass('enemy') && source.attack && target) {
      source.addClass('enemyMoveHighlight');
      source.attack(to);
      source.addClass('done');
      target.addClass('enemyMoveHighlightTarget');
    }
  },
  cast: function(from, to, hero, skillid) {
    var source = $('#' + from + ' .card');
    var target = $('#' + to);
    var s = hero + '-' + skillid;
    var skill = $('.enemydecks .hand .skills.' + s + ', .enemydecks .sidehand .skills.' + s).first();
    var targets = skill.data('targets');
    var card;
    if (targets) {
      if (targets.indexOf(game.data.ui.enemy) >= 0 || targets.indexOf(game.data.ui.ally) >= 0 || targets.indexOf(game.data.ui.self) >= 0) {
        card = $('#' + to + ' .card');
        if (card.length)
          target = card;
      }
    }
    skill.addClass('showMoves');
    source.addClass('enemyMoveHighlight');
    if (target.hasClass('.card')) target.addClass('enemyMoveHighlightTarget');
    if (game.mode == 'single') skill.data('ai discard', undefined);
    setTimeout(function(skill, target, hero, skillid) {
      //console.log(skill, target, hero, skillid)
      if (game.skills[hero][skillid].cast && skill && source.hasClass('enemy') && source.cast) {
        source.cast(skill, target);
      }
    }
    .bind(this, skill, target, hero, skillid), game.enemy.moveAnimation);
  },
  passive: function(to, hero, skillid) {
    // console.log(game.currentData.moves)
    var target = $('#' + to + ' .card');
    var s = hero + '-' + skillid;
    var skill = $('.enemydecks .hand .skills.' + s + ', .enemydecks .sidehand .skills.' + s).first();
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
    var skill = $('.enemydecks .hand .skills.' + s + ', .enemydecks .sidehand .skills.' + s).first();
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
    var creep = game.selectedCard.data('type');
    if (!game.isPlayerTurn() || game.mode == 'library') {
      game.units.summonCreep(target, to, creep);
    }
  },
  summonCreepMove: function(to, creep) {
    var target = $('#' + to);
    var creepCard = game.enemy.skills.sidehand.children('.' + creep).first();
    if (!game.isPlayerTurn() && target.hasClass('free') && creepCard.length) {
      game.audio.play('activate');
      creepCard.addClass('showMoves');
      game.timeout(game.enemy.moveAnimation, function() {
        creepCard.removeClass('showMoves flipped').addClass('done').place(target);
        creepCard.trigger('summon');
      });
    }
  },
  stopChanneling: function(pos) {
    //console.log(pos)
    var card = $('#' + pos + ' .card');
    if (card.length) {
      if (card.data('illuminate-ghost'))
        card.data('illuminate-ghost').stopChanneling();
      else
        card.stopChanneling();
      card.stopChanneling();
    }
  },
  discard: function(hero, skillid) {
    var s = hero + '-' + skillid;
    var skill = $('.enemydecks .hand .skills.' + s).first();
    if (skill) {
      skill.addClass('discardMove');
      game.timeout(game.enemy.moveAnimation, skill.discard.bind(skill));
    }
  },
  cardsInHand: function() {
    return game.enemy.skills.hand.children().length;
  }
};
