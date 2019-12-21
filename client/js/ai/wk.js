game.heroesAI.wk = {
  move: {
    default: 'attack'
  },
  play: function (card, cardData) {
    var stun = $('.'+game.ai.side+'decks .hand .skills.wk-stun');
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
            card: stun.attr('id'),
            target: cardInRange.attr('id')
          });
        }
      });
    }
    if (card.hasBuff('wk-ult')) {
      cardData.strats.siege += 25;
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var stun = game.data.skills.wk.stun;
    card.inRange(stun['cast range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 20;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    if (card.hasBuff('wk-ult')) {
      card.data('ai priority bonus', -40);
    }
    card.data('ai', JSON.stringify(cardData));
  }
};