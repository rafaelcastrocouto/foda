game.heroesAI.pud = {
  move: {
    default: 'alert'
  },
  play: function (card, cardData) {
    var hook = $('.'+game.ai.side+'decks .hand .skills.pud-hook');
    var rot = $('.'+game.ai.side+'decks .sidehand .skills.pud-rot');
    var ult = $('.'+game.ai.side+'decks .hand .skills.pud-ult');
    var p;
    if (!$('.map .'+game.ai.side+'.pud').length) {
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
            card: hook.attr('id'),
            target: spot.attr('id')
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
            card: rot.attr('id'),
            target: card.attr('id')
          });
        } else if (card.data('current hp') < 5) {
          // deny
          cardData['cast-strats'].push({
            priority: 30,
            skill: 'rot',
            card: rot.attr('id'),
            target: card.attr('id')
          });
        }
      } else { // turn off
        if (targets <= 1) {
          cardData['cast-strats'].push({
            priority: 50 - (p/2),
            skill: 'rot',
            card: rot.attr('id'),
            target: card.attr('id')
          });
        }
      }
    }
    if (card.canCast(ult)) {
      p = cardData['can-attack'] ? -20 : 40;
      card.opponentsInRange(rot.data('aoe range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          if (cardInRange.hasClass('units')) p -= 25;
          p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          game.aia.castUlt(card, cardInRange, cardData, ult, p);
        }
      });
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var hook = game.data.skills.pud.hook;
    game.aia.lineDodge(card, hook, 25);
    var rot = game.data.skills.pud.rot;
    card.inRange(rot['aoe range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 5;
      spot.data('ai', JSON.stringify(spotData));
    });
    var ult = game.data.skills.pud.ult;
    if (game[card.side()].turn >= game.ultTurn) {
      card.inRange(ult['cast range'], function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 5;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
      });
    }
    card.data('ai', JSON.stringify(cardData));
  }
};