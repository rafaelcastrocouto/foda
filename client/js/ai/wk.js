game.heroesAI.wk = {
  move: {
    default: 'attack'
  },
  play: function (card, cardData) {
    var stun = $('.'+game.ai.side+'decks .hand .skills.wk-stun');
    if (card.canCast(stun)) {
      game.aia.castSingle(card, stun);
    }
    if (card.hasBuff('wk-ult')) {
      cardData.strats.siege += 25;
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var stundata = game.data.skills.wk.stun;
    card.inRange(stundata['cast range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 20;
      spotData['can-be-casted'] = true;
      spotData['can-be-stuned'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    if (card.hasBuff('wk-ult')) {
      card.data('ai priority bonus', -40);
    }
    card.data('ai', JSON.stringify(cardData));
  }
};