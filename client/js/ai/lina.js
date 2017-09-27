game.heroesAI.lina = {
  move: {
    default: 'defensive'
  },
  play: function (card, cardData) {
    var fire = $('.enemydecks .hand .skills.lina-fire');
    var stun = $('.enemydecks .hand .skills.lina-stun');
    if (!$('.map .enemy.lina').length) {
     fire.data('ai discard', fire.data('ai discard') + 1);
     stun.data('ai discard', stun.data('ai discard') + 1);
    }
    if (fire.length) {
      cardData['can-cast'] = true;
      var range = fire.data('aoe range');
      var width = fire.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = cardData['can-attack'] ? 15 : 0;
        card.opponentsInLine(spot, range, width, function (cardInRange) {
          targets++;
          p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'fire',
            target: spot
          });
        }
      });
    }
    if (stun.length) {
      cardData['can-cast'] = true;
      card.around(stun.data('cast range'), function (spot) {
        var targets = 0, p = cardData['can-attack'] ? 15 : 0;
        spot.around(stun.data('aoe range'), function (nspot) {
          var cardInRange = $('.card.player', nspot);
          if (cardInRange.length) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'stun',
            target: spot
          });
        }
      });
    }
    var ult = $('.enemydecks .hand .skills.lina-ult');
    if (ult.length) {
      cardData['can-cast'] = true;
      card.opponentsInRange(ult.data('cast range'), function (cardInRange) {
        if (cardInRange.length) {
          var p = (50 - cardInRange.data('current hp'))/4;
          if (cardInRange.hasClass('units')) p -= 25;
          cardData['cast-strats'].push({
            priority: p,
            skill: 'ult',
            target: cardInRange
          });
        }
      });
    }
    card.data('ai', cardData);
  },
  defend: function (cm) {
    //console.log('defend-from-cm');
    /*
    prevent clustering
    */
  }
};