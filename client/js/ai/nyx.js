game.heroesAI.nyx = {
  move: {
    default: 'attack'
  },
  play: function (card, cardData) {
    var spike = $('.'+game.ai.side+'decks .hand .skills.nyx-spike');
    var stun = $('.'+game.ai.side+'decks .hand .skills.nyx-stun');
    var burn = $('.'+game.ai.side+'decks .hand .skills.nyx-burn');
    var ult = $('.'+game.ai.side+'decks .hand .skills.nyx-ult');
    if (!$('.map .'+game.ai.side+'.nyx').length) {
     burn.data('ai discard', burn.data('ai discard') + 1);
     stun.data('ai discard', stun.data('ai discard') + 1);
     spike.data('ai discard', spike.data('ai discard') + 1);
    }
    // siege if has spike
    if (card.canCast(spike)) {
      cardData.strats.siege += 15;
      cardData['can-cast'] = true;
      cardData['cast-strats'].push({
        priority: 20,
        skill: 'spike',
        card: spike.attr('id'),
        target: card.attr('id')
      });
    }
    // stun if 1 or more enemies are aligned
    if (card.canCast(stun)) {
      game.aia.castLine(card, cardData, stun);
    }
    //mana burn
    if (card.canCast(burn)) {
      card.opponentsInRange(burn.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers units')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: cardInRange.data('mana'),
            skill: 'burn',
            card: burn.attr('id'),
            target: cardInRange.attr('id')
          });
        }
      });
    }
    //ult
    if (card.canCast(ult)) {
      cardData.strats.attack += 30;
      game.aia.selfCastUlt(card, cardData, ult);
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var stun = game.data.skills.nyx.stun;
    game.aia.lineDodge(card, stun, 20);
    var burn = game.data.skills.nyx.burn;
    card.inRange(burn['cast range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 5;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    if (card.hasBuff('nyx-spike')) {
      card.data('ai priority bonus', -80);
    }
    if (card.hasBuff('nyx-ult')) {
      $('.map .card.'+game.ai.side).each(function (i, aicardel) {
        game.aia.retreat(20, aicardel);
      });
    }
    card.data('ai', JSON.stringify(cardData));
  }
};