game.aia = {
  addCardInRange: function (cardInRange, targets, p) {
    targets++;
    p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
    if (cardInRange.hasClass('channeling towers')) p += 20;
    if (cardInRange.hasClass('units')) p -= 5;
    return {targets: targets, p: p};
  },
  castSingle: function (card, skill) {
    var cardData = JSON.parse(card.data('ai'));
    cardData['can-cast'] = true;
    card.opponentsInRange(skill.data('cast range'), function (cardInRange) {
      if (!cardInRange.hasClasses('invisible ghost dead towers')) {
        var p = 50;
        if (cardInRange.hasClass('channeling')) p += 30;
        if (cardInRange.hasClass('units')) p -= 20;
        cardData['cast-strats'].push({
          priority: p - (cardInRange.data('current hp')/4),
          skill: skill.data('label'),
          card: skill.attr('id'),
          target: cardInRange.attr('id')
        });
      }
    });
    card.data('ai', JSON.stringify(cardData));
  },
  castArea: function (card, skill) {
    var cardData = JSON.parse(card.data('ai'));
    cardData['can-cast'] = true;
    card.inRange(skill.data('cast range'), function (spot) {
      var targets = 0, p = cardData['can-attack'] ? 20 : 0;
      spot.inRange(skill.data('aoe range'), function (nspot) {
        var cardInRange = $('.card.'+game.opponent(game.ai.side)+':not(.invisible, .ghost, .dead)', nspot);
        if (cardInRange.length) {
          var calcp = game.aia.addCardInRange(cardInRange, targets, p);
          targets = calcp.targets;
          p = calcp.p;
        }
      });
      if (targets > 1) {
        cardData['cast-strats'].push({
          priority: p,
          skill: skill.data('label'),
          card: skill.attr('id'),
          target: spot.attr('id')
        });
      }
    });
    card.data('ai', JSON.stringify(cardData));
  },
  castLine: function (card, skill) {
    var cardData = JSON.parse(card.data('ai'));
    cardData['can-cast'] = true;
    var range = skill.data('aoe range');
    var width = skill.data('aoe width');
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
          skill: card.data('label'),
          card: skill.attr('id'),
          target: spot.attr('id')
        });
      }
    });
    card.data('ai', JSON.stringify(cardData));
  },
  selfCastUlt: function (card, cardData, ult, p) {
    game.aia.castUlt(card, card, cardData, ult, p);
  },
  castUlt: function (card, target, cardData, ult, p) {
    cardData['can-cast'] = true;
    cardData['cast-strats'].push({
      priority: p || 60,
      skill: 'ult',
      card: ult.attr('id'),
      target: target.attr('id')
    });
    card.data('ai', JSON.stringify(cardData));
  },
  lineDodge: function (card, skill, p) {
    var range = skill['aoe range'];
    var width = skill['aoe width'];
    card.around(1, function (dirSpot) {
      card.inLine(dirSpot, range, width, function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= p;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
        var cardInRange = $('.card.'+card.opponent(), spot);
        if (cardInRange.length && !cardInRange.hasClasses('ghost dead towers')) {
          var cardInRangeData = JSON.parse(cardInRange.data('ai'));
          cardInRangeData.strats.dodge += 2*p;
          cardInRange.data('ai', JSON.stringify(cardInRangeData));
        }
      });
    });
  },
  ultRange: function (card, ult) {
    if (game[card.side()].turn >= game.ultTurn) {
      card.inRange(ult['cast range'], function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 25;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
      });
    }
  },
  retreat: function (p, aicardel) {
    var aicard = $(aicardel);
    var aicarddata = JSON.parse(aicard.data('ai'));
    aicarddata.strats.retreat += p;
    aicard.data('ai', JSON.stringify(aicarddata));
  },
  defendUlt: function (card, ult) {
    card.inRange(ult['cast range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 15;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
  }
};