game.heroesAI.cm = {
  move: {
    default: 'defensive'
  },
  play: function (card, cardData) {
    /*
    only use slow if N opponents or after N turns
    combo freeze
    only use ult if N opponents or after N turns
    */
    var slow = $('.enemydecks .hand .skills.cm-slow');
    var freeze = $('.enemydecks .hand .skills.cm-freeze');
    var ult = $('.enemydecks .hand .skills.cm-ult');
    if (!$('.map .enemy.cm').length) {
     slow.data('ai discard', slow.data('ai discard') + 1);
     freeze.data('ai discard', freeze.data('ai discard') + 1);
    }
    if (slow.length) {
      cardData['can-cast'] = true;
      card.around(slow.data('cast range'), function (spot) {
        var targets = 0, p = 10;
        spot.around(slow.data('aoe range'), function (nspot) {
          var cardInRange = $('.card.player', nspot);
          if (cardInRange.length) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'slow',
            target: spot
          });
        }
      });
    }
    if (freeze.length) {
      cardData['can-cast'] = true;
      card.opponentsInRange(freeze.data('cast range'), function (cardInRange) {
        cardData['cast-strats'].push({
          priority: parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
          skill: 'freeze',
          target: cardInRange
        });
      });
    }
    if (ult.length) {
      var targets = 0, p = cardData['can-attack'] ? 50 : -50;
      card.opponentsInRange(ult.data('aoe range'), function (cardInRange) {
        targets++;
        p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
      });
      if (targets > 1) {
        cardData['cast-strats'].push({
          priority: p,
          skill: 'ult',
          target: card
        });
      }
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