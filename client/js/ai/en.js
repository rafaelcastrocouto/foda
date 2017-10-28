game.heroesAI.en = {
  move: {
    default: 'defensive'
  },
  play: function (card, cardData) {
    var curse = $('.enemydecks .hand .skills.cm-curse');
    var heal = $('.enemydecks .hand .skills.cm-heal');
    var ult = $('.enemydecks .hand .skills.cm-ult');
    if (!$('.map .enemy.cm').length) {
      curse.data('ai discard', curse.data('ai discard') + 1);
      heal.data('ai discard', heal.data('ai discard') + 1);
    }
    if (card.canCast(curse)) {
      card.inRange(curse.data('cast range'), function (spot) {
        if (spot.hasAllClasses('spot jungle free')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: 40,
            skill: 'curse',
            target: spot
          });
        }
        var cardInRange = $('.card.player:not(.invisible, .ghost, .dead, .towers)', spot);
        if (cardInRange.length) {
          cardData['can-cast'] = true;
          if (cardInRange.hasClasses('heroes ld-summon')) {
            cardData['cast-strats'].push({
              priority: 12,
              skill: 'curse',
              target: cardInRange
            });
          } else if (cardInRange.hasClass('units')) {
            cardData['cast-strats'].push({
              priority: 40,
              skill: 'curse',
              target: cardInRange
            });
          }
        }
      });
    }
    if (card.canCast(heal)) {
      cardData['can-cast'] = true;
      var p = 0, n = 0;
      card.alliesInRange(heal.data('cast range'), function (ally) {
        p += ally.data('current hp')/4;
        n++;
      });
      cardData['cast-strats'].push({
        priority: (n * 100)/p,
        skill: 'heal',
        target: card
      });
    }
    if (card.canCast(ult)) {
      card.opponentsInRange(ult.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClass('invisible ghost dead towers')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: 60 - (cardInRange.data('current hp')/2),
            skill: 'stun',
            target: cardInRange
          });
        }
      });
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {

    //card.data('ai', cardData);
  }
};