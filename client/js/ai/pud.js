game.heroesAI.pud = {
  move: {
    default: 'alert'
  },
  play: function (card, cardData) {
    var hook = $('.enemydecks .hand .skills.pud-hook');
    var rot = $('.enemydecks .sidehand .skills.pud-rot');
    var ult = $('.enemydecks .hand .skills.pud-ult');
    var p;
    if (!$('.map .enemy.pud').length) {
     hook.data('ai discard', hook.data('ai discard') + 1);
    }
    if (card.canCast(hook)) {
      cardData['can-cast'] = true;
      var range = hook.data('aoe range');
      card.around(1, function (spot) {
        var cardInRange = card.firstCardInLine(spot, range);
        if (cardInRange && cardInRange.side() == card.opponent() && !cardInRange.hasClasses('invisible ghost dead towers')) {
          var p = cardData['can-attack'] ? -20 : 20;
          if (cardInRange.hasClass('channeling')) p += 20;
          if (cardInRange.hasClass('units')) p -= 15;
          cardData['cast-strats'].push({
            priority: p + parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
            skill: 'hook',
            card: hook,
            target: spot
          });
        }
      });
    }
    if (card.canCast(rot)) {
      cardData['can-cast'] = true;
      var targets = 0;
      p = 0;
      card.opponentsInRange(rot.data('aoe range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead')) {
          targets++;
          p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          if (cardInRange.hasClass('towers')) p += 20;
          if (cardInRange.hasClass('units')) p -= 5;
        }
      });
      if (!rot.hasClass('on')) { // turn on
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p + 10,
            skill: 'rot',
            card: rot,
            target: card
          });
        } else if (card.data('current hp') < 5) {
          // deny
          cardData['cast-strats'].push({
            priority: 30,
            skill: 'rot',
            card: rot,
            target: card
          });
        }
      } else { // turn off
        if (targets <= 1) {
          cardData['cast-strats'].push({
            priority: 50 - (p/2),
            skill: 'rot',
            card: rot,
            target: card
          });
        }
      }
    }
    if (card.canCast(ult)) {
      p = cardData['can-attack'] ? -20 : 40;
      card.opponentsInRange(rot.data('aoe range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          cardData['can-cast'] = true;
          if (cardInRange.hasClass('units')) p -= 15;
          cardData['cast-strats'].push({
            priority: p + parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
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
    var hook = game.data.skills.pud.hook;
    var range = hook['aoe range'];
    var width = hook['aoe width'];
    card.around(1, function (dirSpot) {
      card.inLine(dirSpot, range, width, function (spot) {
        var spotData = spot.data('ai');
        spotData.priority -= 30;
        spotData['can-be-casted'] = true;
        spot.data('ai', spotData);
        var cardInRange = $('.card.'+card.opponent(), spot);
        if (cardInRange && !cardInRange.hasClasses('ghost dead towers')) {
          var cardInRangeData = cardInRange.data('ai');
          cardInRangeData.strats.dodge += 60;
          cardInRange.data('ai', cardInRangeData);
        }
      });
    });
    var rot = game.data.skills.pud.rot;
    card.inRange(rot['aoe range'], function (spot) {
      var spotData = spot.data('ai');
      spotData.priority -= 5;
      spot.data('ai', spotData);
    });
    var ult = game.data.skills.pud.ult;
    if (game[card.side()].turn >= game.ultTurn) {
      card.inRange(ult['cast range'], function (spot) {
        var spotData = spot.data('ai');
        spotData.priority -= 5;
        spotData['can-be-casted'] = true;
        spot.data('ai', spotData);
      });
    }
    card.data('ai', cardData);
  }
};