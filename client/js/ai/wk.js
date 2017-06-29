game.heroesAI.wk = {
  move: {
    default: 'offensive'
  },
  play: function (card, cardData) {
    // dont stun under enemy tower
    var stun = $('.enemydecks .hand .skills.wk-stun');
    if (stun.length) {
        /*opponent missing cards < N ||*/
        /*N ememies in target range ||*/
        /*after N turns*/
      cardData['can-cast'] = true;
      card.opponentsInRange(stun.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClass('towers')) {
          cardData['cast-strats'].push({
            priority: 50,
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