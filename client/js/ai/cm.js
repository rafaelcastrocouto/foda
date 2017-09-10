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
    if (slow.length && card.canCast(slow)) {
      cardData['can-cast'] = true;
      card.inRange(slow.data('cast range'), function (spot) {
        var targets = 0, p = 10;
        spot.inRange(slow.data('aoe range'), function (castSpot) {
          var cardInRange = $('.card.player', castSpot);
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
    if (freeze.length && card.canCast(freeze)) {
      cardData['can-cast'] = true;
      card.inRange(freeze.data('cast range'), function (spot) {
        var cardInRange = $('.card.player', spot);
        if (cardInRange.length) {
          cardData['cast-strats'].push({
            priority: parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
            skill: 'freeze',
            target: cardInRange
          });
        }
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
  defend: function (card, cardData) {
    // prevent clustering 
    var slow = game.data.skills.cm.slow;
    card.inRange(slow['cast range'], function (spot) {
      spot.inRange(slow['aoe range'], function (castSpot) {
        var spotData = castSpot.data('ai');
        castSpot.priority -= 10;
        castSpot['can-be-casted'] = true;
        castSpot.data('ai', spotData);
      });
    });
    var freeze = game.data.skills.cm.freeze;
    card.inRange(freeze['cast range'], function (spot) {
      var spotData = spot.data('ai');
      spot.priority -= 10;
      spot['can-be-casted'] = true;
      spot.data('ai', spotData);
    });
    if (game.player.turns > game.ultTurn) {
      var ult = game.data.skills.cm.ult;
      card.inRange(ult['aoe range'], function (spot) {
        var spotData = spot.data('ai');
        spotData.priority -= 5;
        spotData['can-be-casted'] = true;
        spot.data('ai', spotData);
      });
    }
    card.data('ai', cardData);
  }
};