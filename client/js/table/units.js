game.units = {
  build: function (side) {
    game[side].unitsDeck = game.deck.build({
      name: 'units',
      cb: function (deck) {
        //console.log(deck.data('cards'));
        deck.addClass(side+' units cemitery').hide().appendTo(game.states.table[side]);
        $.each(deck.data('cards'), function (i, card) {
          card.addClass(side+' unit').data('side', side);
        });
      }
    });
  },
  clone: function (cardEl) {
    var card = $(cardEl);
    return card.clone().data(card.data());
  },
  buy: function (side) {
    var ranged = game.units.clone(game[side].unitsDeck.children('.creeps.ranged'));
    ranged.appendTo(game[side].skills.sidehand);
    var melee1 = game.units.clone(game[side].unitsDeck.children('.creeps.melee'));
    melee1.appendTo(game[side].skills.sidehand);
    var melee2 = game.units.clone(game[side].unitsDeck.children('.creeps.melee'));
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
    var ranged = game.units.clone(game[side].unitsDeck.children('.creeps.ranged'));
    ranged.appendTo(game[side].skills.sidehand);
    var melee = game.units.clone(game[side].unitsDeck.children('.creeps.melee'));
    melee.appendTo(game[side].skills.sidehand);
    var catapult = game.units.clone(game[side].unitsDeck.children('.creeps.catapult'));
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
    var spot = 'A2';
    $('#' + spot).addClass('jungle').attr({title: 'Jungle'});
    $('#' + game.map.mirrorPosition(spot)).addClass('jungle').attr({title: 'Jungle'});
  },
  forestCreep: function (side, target) {
    var forestCreeps = game[side].unitsDeck.children('.forest');
    var r = Math.floor(game.random() * forestCreeps.length);
    var creep = game.units.clone(forestCreeps[r]);
    creep.addClass(side);
    creep.appendTo(target);
    if (game.canPlay()) creep.on('mousedown touchstart', game.card.select);
    if (side == 'enemy') crep.addClass('flipped');
  },
  summonCreep: function(target, to, creep) {
    if (target.hasClass('free')) {
      game.audio.play('activate');
      game.highlight.clearMap();
      var end = function() {
        this.creep.addClass('done');
        this.creep.place(this.target);
        this.creep.trigger('summon');
      }.bind({
        creep: game.selectedCard,
        target: target
      });
      if (!game.selectedCard.hasClass('dragTarget')) {
        game.skill.animateCast(game.selectedCard, target, event, end);
      } else end();
    }
  }
};