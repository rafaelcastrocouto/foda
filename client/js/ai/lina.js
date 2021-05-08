game.heroesAI.lina = {
  move: {
    default: 'flank'
  },
  play: function (card, cardData) {
    var fire = $('.'+game.ai.side+'decks .hand .skills.lina-fire');
    var stun = $('.'+game.ai.side+'decks .hand .skills.lina-stun');
    var ult = $('.'+game.ai.side+'decks .hand .skills.lina-ult');
    if (!$('.map '+game.ai.side+'.lina').length) {
     fire.data('ai discard', fire.data('ai discard') + 1);
     stun.data('ai discard', stun.data('ai discard') + 1);
    }
    if (card.canCast(fire)) {
      game.aia.castLine(card, fire);
    }
    if (card.canCast(stun)) {
      game.aia.castArea(card, stun);
    }
    if (card.canCast(ult)) {
      card.opponentsInRange(ult.data('cast range'), function (cardInRange) {
        var p = cardData['can-attack'] ? 40 : 0;
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          p += (50 - cardInRange.data('current hp'))/4;
          if (cardInRange.hasClass('units')) p -= 30;
          game.aia.castUlt(card, cardInRange, cardData, ult, p);
        }
      });
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var fire = game.data.skills.lina.fire;
    game.aia.lineDodge(card, fire, 15);
    var stun  = game.data.skills.lina.stun;
    var stunSpots = [];
    card.inRange(stun['cast range'], function (spot) {
      spot.inRange(stun['aoe range'], function (castSpot) {
        if (stunSpots.indexOf(castSpot) < 0) stunSpots.push(castSpot);
      });
    });
    $.each(stunSpots, function (i, spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 10;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    var ult = game.data.skills.lina.ult;
    game.aia.ultRange(card, ult);
    card.data('ai', JSON.stringify(cardData));
  }
};