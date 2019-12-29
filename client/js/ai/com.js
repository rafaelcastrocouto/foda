game.heroesAI.com = {
  move: {
    default: 'attack'
  },
  play: function (card, cardData) {
    var aoe = $('.'+game.ai.side+'decks .hand .skills.com-aoe');
    var heal = $('.'+game.ai.side+'decks .hand .skills.com-heal');
    var ult = $('.'+game.ai.side+'decks .hand .skills.com-ult');
    if (!$('.map .'+game.ai.side+'.com').length) {
      aoe.data('ai discard', aoe.data('ai discard') + 1);
    }
    if (card.canCast(aoe)) {
      game.aia.castArea(card, aoe);
    }
    if (card.canCast(heal)) {
      card.inRange(heal.data('cast range'), function (spot) {
        var cardInRange = $('.card.'+game.ai.side+':not(.ghost, .dead, .towers, .units)', spot);
        var p = 10;
        if (cardInRange.length) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: p + parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
            skill: 'heal',
            card: heal.attr('id'),
            target: cardInRange.attr('id')
          });
        }
      });
    }
    if (card.canCast(ult)) {
      card.inRange(ult.data('cast range'), function (spot) {
        var cardInRange = $('.card.'+game.opponent(game.ai.side)+':not(.invisible, .ghost, .dead, .towers, .units)', spot);
        if (cardInRange.length) {
          var p = parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          game.aia.castUlt(card, cardInRange, cardData, ult, p);
        }
      });
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var aoe = game.data.skills.com.aoe;
    var aoeSpots = [];
    card.inRange(aoe['cast range'], function (spot) {
      spot.inRange(aoe['aoe range'], function (castSpot) {
        if (aoeSpots.indexOf(castSpot) < 0) aoeSpots.push(castSpot);
      });
    });
    $.each(aoeSpots, function (i, spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 5;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    if (game[card.side()].turn >= game.ultTurn) {
      var ult = game.data.skills.com.ult;
      game.aia.defendUlt(card, ult);
    }
    card.data('ai', JSON.stringify(cardData));
  }
};