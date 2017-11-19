game.heroesAI.wk = {
  move: {
    default: 'offensive'
  },
  play: function (card, cardData) {
    var stun = $('.enemydecks .hand .skills.wk-stun');
    if (card.canCast(stun)) {
      cardData['can-cast'] = true;
      card.opponentsInRange(stun.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          var p = 50;
          if (cardInRange.hasClass('channeling')) p += 30;
          if (cardInRange.hasClass('units')) p -= 20;
          cardData['cast-strats'].push({
            priority: p - (cardInRange.data('current hp')/4),
            skill: 'stun',
            card: stun,
            target: cardInRange
          });
        }
      });
    }
    if (card.hasBuff('wk-ult')) {
      cardData.strats.siege += 25;
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {
    var stun = game.data.skills.wk.stun;
    card.inRange(stun['cast range'], function (spot) {
      var spotData = spot.data('ai');
      spotData.priority -= 20;
      spotData['can-be-casted'] = true;
      spot.data('ai', spotData);
    });
    card.data('ai', cardData);
    //dont focus if ult buff
  }
};