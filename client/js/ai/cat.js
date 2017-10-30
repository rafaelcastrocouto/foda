game.heroesAI.cat = {
  move: {
    default: 'offensive'
  },
  play: function (card, cardData) {
    var star = $('.enemydecks .sidehand .skills.cat-star');
    var arrow = $('.enemydecks .hand .skills.cat-arrow');
    var leap = $('.enemydecks .sidehand .skills.cat-leap');
    var ult = $('.enemydecks .hand .skills.cat-ult');
    if (!$('.map .enemy.cat').length) {
      star.data('ai discard', star.data('ai discard') + 1);
      arrow.data('ai discard', arrow.data('ai discard') + 1);
    }
    if (card.canCast(star)) {
      cardData['can-cast'] = true;
      var targets = 0, p = 20;
      card.opponentsInRange(star.data('aoe range'), function (cardInRange) {
        targets++;
        p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
      });
      if (targets > 1) {
        cardData['cast-strats'].push({
          priority: p,
          skill: 'star',
          target: card
        });
      }
    }
    if (card.canCast(arrow)) {
      cardData['can-cast'] = true;
      var range = arrow.data('aoe range');
      card.around(1, function (spot) {
        var cardInRange = card.firstCardInLine(spot, range);
        if (cardInRange && cardInRange.side() == card.opponent()) {
          var p = 25;
          if (cardInRange.hasClass('channeling')) p += 20;
          cardData['cast-strats'].push({
            priority: p + parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
            skill: 'arrow',
            target: spot
          });
        }
      });
    }
    //leap
    
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {

    //card.data('ai', cardData);
  }
};