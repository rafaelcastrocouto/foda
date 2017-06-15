game.player = {
  placeHeroes: function () {
    game.player.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('player').appendTo(game.states.table.player).hide();
        if (game.mode == 'library') {
          var card = deck.data('cards')[0];
          card.addClass('player').on('mousedown touchstart', game.card.select);
          card.place(game.map.toPosition(4, 3));
          card.on('action', game.library.action).on('death', game.library.action);
        } else {
          var x = 2, y = 4;
          $.each(deck.data('cards'), function (i, card) {
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player').on('mousedown touchstart', game.card.select);
            card.place(game.map.toPosition(x + p, y));
            if (game.mode == 'online') card.on('action', game.online.action);
            if (game.mode == 'tutorial') card.on('select', game.tutorial.selected);
          });
        }
      }
    });
  },
  buyCard: function () {
    var availableSkills = $('.table .player .skills.available .card'),
      card,
      heroid,
      hero,
      to,
      skillid;
    if (availableSkills.length < game.player.cardsPerTurn + 1) {
      $('.table .player .skills.cemitery .card').appendTo(game.player.skills.deck);
      availableSkills = $('.table .player .available .card');
    }
    card = availableSkills.randomCard();
    if (card.data('hand') === game.data.ui.right) {
      if (game.player.skills.hand.children().length < game.maxCards) {
        card.appendTo(game.player.skills.hand);
      }
    } else if (game.player.skills.sidehand.children().length < game.maxCards) {
      card.appendTo(game.player.skills.sidehand);
    }
  },
  buyHand: function () {
    game.player.buyCreeps();
    if (game.player.turn > 1) game.player.buyCards(game.player.cardsPerTurn);
  },
  buyCreeps: function (force, catapultforce) {
    var ranged, melee, catapult;
    if (game.player.turn === game.creepTurn || force) {
      ranged = game.player.unitsDeck.children('.ranged');
      game.units.clone(ranged).appendTo(game.player.skills.sidehand).on('mousedown touchstart', game.card.select);
      for (var i = 0; i < 2; i += 1) {
        melee = game.player.unitsDeck.children('.melee');
        game.units.clone(melee).appendTo(game.player.skills.sidehand).on('mousedown touchstart', game.card.select);
      }
    }
    if (game.player.turn === game.catapultTurn || catapultforce) {
      ranged = game.player.unitsDeck.children('.ranged');
      game.units.clone(ranged).appendTo(game.player.skills.sidehand).on('mousedown touchstart', game.card.select);
      melee = game.player.unitsDeck.children('.melee');
      game.units.clone(melee).appendTo(game.player.skills.sidehand).on('mousedown touchstart', game.card.select);
      catapult = game.player.unitsDeck.children('.catapult');
      game.units.clone(catapult).appendTo(game.player.skills.sidehand).on('mousedown touchstart', game.card.select);
     }
  },
  buyCards: function (n) {
    for (var i=0; i<n; i++) {
      game.player.buyCard();
    }
  },
  move: function (event) {
    var spot = $(this),
      card = game.selectedCard,
      from = card.getPosition(),
      to = spot.getPosition();
    if (game.isPlayerTurn() &&
        spot.hasClass('free') &&
        from !== to &&
        !card.hasClass('done')) {
      card.move(to);
      card.removeClass('draggable').addClass('done');
      if (game.mode == 'online') game.currentMoves.push('M:' + from + ':' + to);
    }
  },
  attack: function (event) { 
    var target = $(this),
      source = game.selectedCard,
      from = source.getPosition(),
      to = target.getPosition();
    if (game.isPlayerTurn() &&
        source.data('damage') && 
        from !== to && 
        !source.hasClass('done') && 
        target.data('current hp')) {
      source.attack(target);
      source.addClass('done').removeClass('draggable');
      if (game.mode == 'online') game.currentMoves.push('A:' + from + ':' + to);
      game.highlight.clearMap();
    }
  },
  passive: function (event) {
    var target = $(this),
      skill = game.selectedCard,
      hero = skill.data('hero'),
      skillid = skill.data('skill'),
      to = target.getPosition();
    if (game.isPlayerTurn() && hero && skillid) {
      skill.passive(target);
      if (game.mode == 'online') game.currentMoves.push('P:' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, target, event);
    }
  },
  toggle: function (event) {
    var target = $(this),
      skill = game.selectedCard,
      hero = skill.data('hero'),
      skillid = skill.data('skill'),
      to = target.getPosition();
    if (game.isPlayerTurn() && hero && skillid) {
      skill.toggle(target);
      if (game.mode == 'online') game.currentMoves.push('T:' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, target, event);
    }
  },
  cast: function (event) {
    var target = $(this),
      skill = game.selectedCard,
      source = $('.map .source'),
      from = source.getPosition(),
      to = target.getPosition(),
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (game.isPlayerTurn() &&
        hero && skillid && from && to) {
      source.cast(skill, to);
      if (skill.data('targets').indexOf(game.data.ui.summon) >= 0) {
        target.addClass('done').removeClass('draggable');
      }
      if (game.mode == 'online') game.currentMoves.push('C:' + from + ':' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, to, event);
    }
  },
  stopChanneling: function () {
    var card = $(this);
    if (card.data('illuminate-ghost')) card.data('illuminate-ghost').stopChanneling();
    else card.stopChanneling();
    if (game.mode == 'online') {
      var to = card.getPosition();
      game.currentMoves.push('G:' + to);
    }
    card.select();
  },
  summonCreep: function () {
    var target = $(this),
        to = target.getPosition(),
        creep = game.selectedCard.data('type');
    if ( game.isPlayerTurn() &&
         target.hasClass('free')) {
      if (game.mode == 'online') game.currentMoves.push('S:' + to + ':' + creep);
      game.highlight.clearMap();
      game.states.table.animateCast(game.selectedCard, target, event, function () {
        this.creep.addClass('done');
        this.creep.unselect();
        this.creep.place(this.slot);
        this.creep.trigger('summon');
      }.bind({creep: game.selectedCard, slot: target}));
    }
  },
  discard: function (skill) {
    var hero = skill.data('hero'),
        skillid = skill.data('skill');
    game.currentMoves.push('D:' + skillid + ':' + hero);
    game.states.table.discard.attr('disabled', true);
    skill.addClass('slidedown');
    setTimeout(function () {
      this.removeClass('slidedown').discard();
    }.bind(skill), 200);
  },
  cardsInHand: function () {
    return game.player.skills.hand.children().length;
  }
};
