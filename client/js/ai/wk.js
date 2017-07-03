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
  defend: function (wk) {
    //console.log('defend-from-wk');
    //dont focus if ult buff
  }
};