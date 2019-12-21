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
      cardData['can-cast'] = true;
      card.inRange(aoe.data('cast range'), function (spot) {
        var targets = 0, p = 10;
        spot.inRange(aoe.data('aoe range'), function (castSpot) {
          var cardInRange = $('.card.'+game.opponent(game.ai.side), castSpot);
          if (cardInRange.length) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
            if (cardInRange.hasClass('towers')) p += 20;
            if (cardInRange.hasClass('units')) p -= 5;
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'aoe',
            card: aoe.attr('id'),
            target: spot.attr('id')
          });
        }
      });
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
      card.inRange(ult['cast range'], function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 15;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
      });
    }
    card.data('ai', JSON.stringify(cardData));
  }
};