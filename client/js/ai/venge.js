game.heroesAI.venge = {
  move: {
    default: 'offensive'
  },
  play: function (card, cardData) {
    var stun = $('.enemydecks .hand .skills.venge-stun');
    var corruption = $('.enemydecks .hand .skills.venge-corruption');
    var ult = $('.enemydecks .hand .skills.venge-ult');
    if (!$('.map .enemy.venge').length) {
      stun.data('ai discard', stun.data('ai discard') + 1);
      corruption.data('ai discard', corruption.data('ai discard') + 1);
    }
    if (card.canCast(stun)) {
      cardData['can-cast'] = true;
      card.opponentsInRange(stun.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          var p = 50;
          if (cardInRange.hasClass('channeling')) p += 30;
          cardData['cast-strats'].push({
            priority: p - (cardInRange.data('current hp')/4),
            skill: 'stun',
            card: stun,
            target: cardInRange
          });
        }
      });
    }
    if (card.canCast(corruption)) {
      cardData['can-cast'] = true;
      var range = corruption.data('aoe range');
      var width = corruption.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = 0;
        card.opponentsInLine(spot, range, width, function (cardInRange) {
          if (!cardInRange.hasClasses('invisible ghost dead towers')) {
            targets++;
            if (cardInRange.hasClass('towers')) p += 20;
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p + (targets * 10),
            skill: 'corruption',
            card: corruption,
            target: spot
          });
        }
      });
    }
    //ult
    if (card.canCast(ult)) {
      cardData['can-cast'] = true;
      // use ult to attack
      if (!card.hasClass('done') && 
          cardData['can-attack'] && 
          card.data('current hp') > 25) {
        card.around(ult.data('cast range'), function (spot) {
          var cardInRange = $('.card:not(.invisible, .ghost, .dead, .towers)', spot);
          if (cardInRange) {
            var targets = 0, p = 0;
            cardInRange.around(card.data('range'), function (nspot) {
              var cardInUltRange = $('.card.player:not(.invisible, .ghost, .dead, .towers)', nspot);
              if (cardInUltRange.length) {
                targets++;
                p += parseInt((cardInUltRange.data('hp')-cardInUltRange.data('current hp'))/4);
                if (cardInUltRange.hasClass('towers')) p += 70;
                if (nspot.hasClass('enemyarea')) p -= 30;
              }
            });
            if (targets) {
              cardData['cast-strats'].push({
                priority: p,
                skill: 'ult',
                card: ult,
                target: spot
              });
            }
          }
        });
      }
      //use ult to escape
      if (cardData['can-be-attacked'] && 
          card.data('current hp') < 25 &&
          (card.hasClass('done') || !cardData['can-make-action']) ) {
        card.around(ult.data('cast range'), function (spot) {
          if (spot.hasClass('free') && !spot.hasClass('playerarea')) {
            cardData['cast-strats'].push({
              priority: 50 + spot.data('priority'),
              skill: 'ult',
              card: ult,
              target: spot
            });
          }
        });
      }
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {

    //card.data('ai', cardData);
  }
};