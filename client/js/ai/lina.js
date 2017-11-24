game.heroesAI.lina = {
  move: {
    default: 'flank'
  },
  play: function (card, cardData) {
    var fire = $('.enemydecks .hand .skills.lina-fire');
    var stun = $('.enemydecks .hand .skills.lina-stun');
    var ult = $('.enemydecks .hand .skills.lina-ult');
    if (!$('.map .enemy.lina').length) {
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
            card: fire,
            target: spot
          });
        }
      });
    }
    if (card.canCast(stun)) {
      cardData['can-cast'] = true;
      card.around(stun.data('cast range'), function (spot) {
        var targets = 0, p = cardData['can-attack'] ? 20 : 0;
        spot.around(stun.data('aoe range'), function (nspot) {
          var cardInRange = $('.card.player:not(.invisible, .ghost, .dead)', nspot);
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
            card: stun,
            target: spot
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
            card: ult,
            target: cardInRange
          });
        }
      });
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {
    var fire = game.data.skills.lina.fire;
    var range = fire['aoe range'];
    var width = fire['aoe width'];
    card.around(1, function (dirSpot) {
      card.inLine(dirSpot, range, width, function (spot) {
        var spotData = spot.data('ai');
        spotData.priority -= 10;
        spotData['can-be-casted'] = true;
        spot.data('ai', spotData);
        var cardInRange = $('.card.'+card.opponent(), spot);
        if (cardInRange.length && !cardInRange.hasClasses('ghost dead towers')) {
          var cardInRangeData = cardInRange.data('ai');
          cardInRangeData.strats.dodge += 20;
          cardInRange.data('ai', cardInRangeData);
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
      var spotData = spot.data('ai');
      spotData.priority -= 10;
      spotData['can-be-casted'] = true;
      spot.data('ai', spotData);
    });
    var ult = game.data.skills.lina.ult;
    if (game[card.side()].turn >= game.ultTurn) {
      card.inRange(ult['cast range'], function (spot) {
        var spotData = spot.data('ai');
        spotData.priority -= 25;
        spotData['can-be-casted'] = true;
        spot.data('ai', spotData);
      });
    }
    card.data('ai', cardData);
  }
};