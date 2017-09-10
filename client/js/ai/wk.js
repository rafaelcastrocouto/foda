game.heroesAI.wk = {
  move: {
    default: 'offensive'
  },
  play: function (card, cardData) {
    var stun = $('.enemydecks .hand .skills.wk-stun');
    if (stun.length) {
      cardData['can-cast'] = true;
      card.opponentsInRange(stun.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClass('towers')) {
          cardData['cast-strats'].push({
            priority: 50 - (cardInRange.data('current hp')/2),
            skill: 'stun',
            target: cardInRange
          });
        }
      });
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {
    var stun = game.data.skills.wk.stun;
    card.inRange(stun['cast range'], function (spot) {
      var spotData = spot.data('ai');
      spot.priority -= 10;
      spot['can-be-casted'] = true;
      spot.data('ai', spotData);
    });
    card.data('ai', cardData);
    //dont focus if ult buff
  }
};