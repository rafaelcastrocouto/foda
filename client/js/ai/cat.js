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
      leap.data('ai discard', leap.data('ai discard') + 1);
    }
    if (card.canCast(star)) {
      cardData['can-cast'] = true;
      var targets = 0, p = 20;
      card.opponentsInRange(star.data('aoe range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead')) {
          targets++;
          p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          if (cardInRange.hasClass('towers')) p += 20;
        }
      });
      if (targets > 1) {
        cardData['cast-strats'].push({
          priority: p,
          skill: 'star',
          card: star,
          target: card
        });
      }
    }
    if (card.canCast(arrow)) {
      cardData['can-cast'] = true;
      var range = arrow.data('aoe range');
      card.around(1, function (spot) {
        var cardInRange = card.firstCardInLine(spot, range);
        if (cardInRange && cardInRange.side() == card.opponent() && !cardInRange.hasClasses('invisible ghost dead')) {
          var p = 25;
          if (cardInRange.hasClass('channeling')) p += 20;
          cardData['cast-strats'].push({
            priority: p + parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
            skill: 'arrow',
            card: arrow,
            target: spot
          });
        }
      });
    }
    //leap
    if (card.canCast(leap)) {
      cardData['can-cast'] = true;
      // use leap to attack
      if (!card.hasClass('done') && 
          cardData['can-attack'] && 
          card.data('current hp') > 25) {
        card.atRange(leap.data('cast range'), function (spot) {
          if (spot.hasClass('free')) {
            var targets = 0, p = spot.data('priority');
            spot.around(card.data('range'), function (nspot) {
              var cardInRange = $('.card.player:not(.invisible, .ghost, .dead, .towers)', nspot);
              if (cardInRange.length) {
                targets++;
                p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
                if (cardInRange.hasClass('towers')) p += 70;
                if (nspot.hasClass('enemyarea')) p -= 30;
              }
            });
            if (targets) {
              cardData['cast-strats'].push({
                priority: p,
                skill: 'leap',
                card: lead,
                target: spot
              });
            }
          }
        });
      }
      //use leap to escape
      if (cardData['can-be-attacked'] && 
          card.data('current hp') < 25 &&
          (card.hasClass('done') || !cardData['can-make-action']) ) {
        card.atRange(leap.data('cast range'), function (spot) {
          if (spot.hasClass('free') && !spot.hasClass('playerarea')) {
            cardData['cast-strats'].push({
              priority: 50 + spot.data('priority'),
              skill: 'leap',
              card: lead,
              target: spot
            });
          }
        });
      }
    }
    //ult
    if (card.canCast(star)) {
      cardData['can-cast'] = true;
      cardData['cast-strats'].push({
        priority: 60,
        skill: 'ult',
        card: ult,
        target: card
      });
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {
    //card.data('ai', cardData);
  }
};