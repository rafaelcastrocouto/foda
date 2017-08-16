game.units = {
  build: function () {
    game.neutrals = {};
    game.neutrals.unitsDeck = game.deck.build({
      name: 'units',
      filter: ['forest'],
      cb: function (deck) {
        deck.addClass('neutral units cemitery').hide().appendTo(game.states.table.el);
        $.each(deck.data('cards'), function (i, card) {
          card.addClass('neutral unit').data('side', 'neutral');
        });
      }
    });
    game.player.unitsDeck = game.deck.build({
      name: 'units',
      filter: ['creeps'],
      cb: function (deck) {
        //console.log(deck.data('cards'));
        deck.addClass('player units cemitery').hide().appendTo(game.states.table.player);
        $.each(deck.data('cards'), function (i, card) {
          card.addClass('player unit').data('side', 'player');
          card.on('action', game.library.action).on('death', game.library.action);
        });
      }
    });
    game.enemy.unitsDeck = game.deck.build({
      name: 'units',
      filter: ['creeps'],
      cb: function (deck) {
        deck.addClass('enemy units cemitery').hide().appendTo(game.states.table.enemy);
        $.each(deck.data('cards'), function (i, card) {
          card.addClass('enemy unit').data('side', 'enemy');
        });
      }
    });
  },
  clone: function (card) {
    return card.clone().data(card.data());
  },
  buy: function (side) {
    var ranged = game.units.clone(game[side].unitsDeck.children('.ranged'));
    ranged.appendTo(game[side].skills.sidehand);
    var melee1 = game.units.clone(game[side].unitsDeck.children('.melee'));
    melee1.appendTo(game[side].skills.sidehand);
    var melee2 = game.units.clone(game[side].unitsDeck.children('.melee'));
    melee2.appendTo(game[side].skills.sidehand);
    ranged.on('mousedown touchstart', game.card.select);
    melee1.on('mousedown touchstart', game.card.select);
    melee2.on('mousedown touchstart', game.card.select);
    var summon = game.units.clone(game[side].unitsDeck.children('[class*="summon"]'));
    if (summon) {
      summon.appendTo(game[side].skills.sidehand);
      summon.on('mousedown touchstart', game.card.select);
    }
    if (side != 'player') {
      ranged.addClass('flipped');
      melee1.addClass('flipped');
      melee2.addClass('flipped');
      if (summon) summon.addClass('flipped');
    }
  },
  buyCatapult: function (side) {
    var ranged = game.units.clone(game[side].unitsDeck.children('.ranged'));
    ranged.appendTo(game[side].skills.sidehand);
    var melee = game.units.clone(game[side].unitsDeck.children('.melee'));
    melee.appendTo(game[side].skills.sidehand);
    var catapult = game.units.clone(game[side].unitsDeck.children('.catapult'));
    catapult.appendTo(game[side].skills.sidehand);
    var summon = game.units.clone(game[side].unitsDeck.children('[class*="summon"]'));
    if (summon) summon.appendTo(game[side].skills.sidehand);
    ranged.on('mousedown touchstart', game.card.select);
    melee.on('mousedown touchstart', game.card.select);
    catapult.on('mousedown touchstart', game.card.select);
    if (summon) summon.on('mousedown touchstart', game.card.select);
    if (side == 'enemy') {
      ranged.addClass('flipped');
      melee.addClass('flipped');
      catapult.addClass('flipped');
      if (summon) summon.addClass('flipped');
    }
  },
  forestSpot: function () {
    var j = 'A2';
    $('#' + j).addClass('jungle').attr({title: 'Jungle'});
    $('#' + game.map.mirrorPosition(j)).addClass('jungle').attr({title: 'Jungle'});
  },
  forestCreep: function (side, target) {
    var r = Math.floor(game.random() * game.neutrals.unitsDeck.children().length);
    var randomUnit = $(game.neutrals.unitsDeck.children()[r]);
    var creep = game.units.clone(randomUnit);
    creep.removeClass('neutral').addClass(side);
    creep.appendTo(target);
    if (side == 'player') {
      creep.on('mousedown touchstart', game.card.select);
    }
    else {
      crep.addClass('flipped');
    }
  }
};