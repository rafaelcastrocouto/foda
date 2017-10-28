game.heroesAI.wind = {
  move: {
    default: 'smart'
  },
  play: function (card, cardData) {
    var arrow = $('.enemydecks .hand .skills.lina-arrow');
    var stun = $('.enemydecks .hand .skills.lina-stun');
    var run = $('.enemydecks .hand .skills.lina-run');
    var ult = $('.enemydecks .hand .skills.lina-ult');
    if (!$('.map .enemy.lina').length) {
     arrow.data('ai discard', arrow.data('ai discard') + 1);
     stun.data('ai discard', stun.data('ai discard') + 1);
     run.data('ai discard', run.data('ai discard') + 1);
    }
    if (card.canCast(arrow)) {
      cardData['can-cast'] = true;
      var range = arrow.data('aoe range');
      var width = arrow.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = cardData['can-attack'] ? 15 : 0;
        card.opponentsInLine(spot, range, width, function (cardInRange) {
          targets++;
          p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'arrow',
            target: spot
          });
        }
      });
    }
    if (card.canCast(stun)) {
      card.opponentsInRange(stun.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClass('invisible ghost dead towers')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: 50 - (cardInRange.data('current hp')/2),
            skill: 'stun',
            target: cardInRange
          });
        }
      });
    }
    if (card.canCast(run)) {
      cardData['can-cast'] = true;
      var p = 10;
      if (cardData['can-be-attacked']) p = 40;
      cardData['cast-strats'].push({
        priority: p,
        skill: 'run',
        target: card
      });
    }
    if (card.canCast(ult)) {
      card.opponentsInRange(ult.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClass('invisible ghost dead towers')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: 50 - (cardInRange.data('current hp')/2),
            skill: 'ult',
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