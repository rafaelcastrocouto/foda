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
      cardData['can-cast'] = true;
      var range = fire.data('aoe range');
      var width = fire.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = cardData['can-attack'] ? 20 : 0;
        card.opponentsInLine(spot, range, width, function (cardInRange) {
          if (!cardInRange.hasClasses('invisible ghost dead')) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
            if (cardInRange.hasClass('towers')) p += 20;
            if (cardInRange.hasClass('units')) p -= 5;
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'fire',
            card: fire.attr('id'),
            target: spot.attr('id')
          });
        }
      });
    }
    if (card.canCast(stun)) {
      cardData['can-cast'] = true;
      card.around(stun.data('cast range'), function (spot) {
        var targets = 0, p = cardData['can-attack'] ? 20 : 0;
        spot.around(stun.data('aoe range'), function (nspot) {
          var cardInRange = $('.card.'+game.opponent(game.ai.side)+':not(.invisible, .ghost, .dead)', nspot);
          if (cardInRange.length) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
            if (cardInRange.hasClass('channeling towers')) p += 20;
            if (cardInRange.hasClass('units')) p -= 5;
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'stun',
            card: stun.attr('id'),
            target: spot.attr('id')
          });
        }
      });
    }
    if (card.canCast(ult)) {
      card.opponentsInRange(ult.data('cast range'), function (cardInRange) {
        var p = cardData['can-attack'] ? 40 : 0;
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          cardData['can-cast'] = true;
          p += (50 - cardInRange.data('current hp'))/4;
          if (cardInRange.hasClass('units')) p -= 30;
          cardData['cast-strats'].push({
            priority: p,
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
    var fire = game.data.skills.lina.fire;
    var range = fire['aoe range'];
    var width = fire['aoe width'];
    card.around(1, function (dirSpot) {
      card.inLine(dirSpot, range, width, function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 10;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
        var cardInRange = $('.card.'+card.opponent(), spot);
        if (cardInRange.length && !cardInRange.hasClasses('ghost dead towers')) {
          var cardInRangeData = JSON.parse(cardInRange.data('ai'));
          cardInRangeData.strats.dodge += 20;
          cardInRange.data('ai', JSON.stringify(cardInRangeData));
        }
      });
    });
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
    if (game[card.side()].turn >= game.ultTurn) {
      card.inRange(ult['cast range'], function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 25;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
      });
    }
    card.data('ai', JSON.stringify(cardData));
  }
};