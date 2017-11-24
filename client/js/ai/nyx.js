game.heroesAI.nyx = {
  move: {
    default: 'attack'
  },
  play: function (card, cardData) {
    var spike = $('.enemydecks .hand .skills.nyx-spike');
    var stun = $('.enemydecks .hand .skills.nyx-stun');
    var burn = $('.enemydecks .hand .skills.nyx-burn');
    var ult = $('.enemydecks .hand .skills.nyx-ult');
    if (!$('.map .enemy.nyx').length) {
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
        card: spike,
        target: card
      });
    }
    // stun if 1 or more enemies are aligned
    if (card.canCast(stun)) {
      cardData['can-cast'] = true;
      var range = stun.data('aoe range');
      var width = stun.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = 10;
        card.opponentsInLine(spot, range, width, function (cardInRange) {
          if (!cardInRange.hasClasses('invisible ghost dead')) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
            if (cardInRange.hasClasses('channeling towers')) p += 20;
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
    //mana burn
    if (card.canCast(burn)) {
      card.opponentsInRange(burn.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers units')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: cardInRange.data('mana'),
            skill: 'burn',
            card: burn,
            target: cardInRange
          });
        }
      });
    }
    //ult
    if (card.canCast(ult)) {
      cardData.strats.siege += 15;
      cardData['can-cast'] = true;
      cardData['cast-strats'].push({
        priority: 60,
        skill: 'ult',
        card: ult,
        target: card
      });
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {
    var stun = game.data.skills.nyx.stun;
    var range = stun['aoe range'];
    var width = stun['aoe width'];
    card.around(1, function (dirSpot) {
      card.inLine(dirSpot, range, width, function (spot) {
        var spotData = spot.data('ai');
        spotData.priority -= 30;
        spotData['can-be-casted'] = true;
        spot.data('ai', spotData);
        var cardInRange = $('.card.'+card.opponent(), spot);
        if (cardInRange && !cardInRange.hasClasses('ghost dead towers')) {
          var cardInRangeData = cardInRange.data('ai');
          cardInRangeData.strats.dodge += 50;
          cardInRange.data('ai', cardInRangeData);
        }
      });
    });
    var burn = game.data.skills.nyx.burn;
    card.inRange(burn['cast range'], function (spot) {
      var spotData = spot.data('ai');
      spotData.priority -= 5;
      spotData['can-be-casted'] = true;
      spot.data('ai', spotData);
    });
    if (card.hasBuff('nyx-spike')) {
      card.data('ai priority bonus', -80);
    }
    if (card.hasBuff('nyx-ult')) {
      $('.map .card.'+game.ai.side).each(function (i, aicardel) {
        var aicard = $(aicardel);
        var aicarddata = aicard.data('ai');
        aicarddata.strats.retreat += 10;
        aicard.data('ai', aicarddata);
      });
    }
    card.data('ai', cardData);
  }
};