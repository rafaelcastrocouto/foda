game.heroesAI.wind = {
  move: {
    default: 'flank'
  },
  play: function (card, cardData) {
    var arrow = $('.'+game.ai.side+'decks .hand .skills.wind-arrow');
    var stun = $('.'+game.ai.side+'decks .hand .skills.wind-stun');
    var run = $('.'+game.ai.side+'decks .hand .skills.wind-run');
    var ult = $('.'+game.ai.side+'decks .hand .skills.wind-ult');
    if (!$('.map .'+game.ai.side+'.wind').length) {
      arrow.data('ai discard', arrow.data('ai discard') + 1);
      stun.data('ai discard', stun.data('ai discard') + 1);
      run.data('ai discard', run.data('ai discard') + 1);
    }
    if (card.canCast(arrow)) {
      game.aia.castLine(card, cardData, arrow);
    }
    if (card.canCast(stun)) {
      card.opponentsInRange(stun.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          cardData['can-cast'] = true;
          var p = 20, secTarget = card.behindTarget(cardInRange);
          if (cardInRange.hasClass('units')) p -= 10;
          if (secTarget && !secTarget.hasClasses('invisible ghost dead towers')) {
            p += 30;
            if (secTarget.hasClass('units')) p -= 5;
          }
          cardData['cast-strats'].push({
            priority: p - (cardInRange.data('current hp')/4),
            skill: 'stun',
            card: stun.attr('id'),
            target: cardInRange.attr('id')
          });
        }
      });
    }
    if (card.canCast(run)) {
      cardData['can-cast'] = true;
      var p = 10;
      if (cardData['can-be-attacked']) p = 40;
      cardData['cast-strats'].push({
        priority: p,
        skill: 'run',
        card: run.attr('id'),
        target: card.attr('id')
      });
    }
    if (card.canCast(ult)) {
      card.opponentsInRange(ult.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead')) {
          var p = 40;
          cardData['can-cast'] = true;
          if (cardInRange.hasClass('towers')) p += 40;
          if (cardInRange.hasClass('units')) p -= 30;
          cardData['cast-strats'].push({
            priority: p - (cardInRange.data('current hp')/2),
            skill: 'ult',
            card: ult.attr('id'),
            target: cardInRange.attr('id')
          });
        }
      });
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var arrow = game.data.skills.wind.arrow;
    game.aia.lineDodge(card, arrow, 20);
    var stun = game.data.skills.wind.stun;
    card.inRange(stun['cast range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 5;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    if (card.hasBuff('wind-run')) {
      card.data('ai priority bonus', -80);
    }
    var ult = game.data.skills.wind.ult;
    game.aia.ultRange(card, ult);
    card.data('ai', JSON.stringify(cardData));
  }
};