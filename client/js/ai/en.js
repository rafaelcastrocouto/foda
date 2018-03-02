game.heroesAI.en = {
  move: {
    default: 'flank'
  },
  play: function (card, cardData) {
    var curse = $('.enemydecks .hand .skills.en-curse');
    var heal = $('.enemydecks .hand .skills.en-heal');
    var ult = $('.enemydecks .hand .skills.en-ult');
    if (!$('.map .enemy.en').length) {
      curse.data('ai discard', curse.data('ai discard') + 1);
      heal.data('ai discard', heal.data('ai discard') + 1);
    }
    if (card.canCast(curse)) {
      card.inRange(curse.data('cast range'), function (spot) {
        if (spot.hasAllClasses('spot jungle free')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: 40,
            skill: 'curse',
            card: curse,
            target: spot
          });
        }
        var cardInRange = $('.card.player:not(.invisible, .ghost, .dead, .towers)', spot);
        if (cardInRange.length) {
          cardData['can-cast'] = true;
          if (cardInRange.hasClasses('heroes ld-bear')) {
            cardData['cast-strats'].push({
              priority: 12,
              skill: 'curse',
              card: curse,
              target: cardInRange
            });
          } else if (cardInRange.hasClass('units')) {
            cardData['cast-strats'].push({
              priority: 40,
              skill: 'curse',
              card: curse,
              target: cardInRange
            });
          }
        }
      });
    }
    if (card.canCast(heal)) {
      cardData['can-cast'] = true;
      var p = 0, n = 0;
      card.alliesInRange(heal.data('cast range'), function (ally) {
        if (!ally.hasClasses('ghost dead towers') && ally.data('current hp') < ally.data('hp')) {
          p += ally.data('current hp')/4;
          if (ally.hasClass('units')) p -= 10;
          n++;
        }
      });
      cardData['cast-strats'].push({
        priority: (n * 100)/p,
        skill: 'heal',
        card: heal,
        target: card
      });
    }
    if (card.canCast(ult)) {
      card.opponentsInRange(ult.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead')) {
          cardData['can-cast'] = true;
          var p = 40;
          if (cardInRange.hasClass('towers')) p += 20;
          if (cardInRange.hasClass('units')) p -= 15;
          cardData['cast-strats'].push({
            priority: p - (cardInRange.data('current hp')/2),
            skill: 'stun',
            card: ult,
            target: cardInRange
          });
        }
      });
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {
    var curse = game.data.skills.en.curse;
    card.inRange(curse['cast range'], function (spot) {
      var spotData = spot.data('ai');
      spotData.unitPriority -= 15;
      spotData['can-be-casted'] = true;
      spot.data('ai', spotData);
    });
    if (card.hasBuff('en-passive')) {
      card.data('ai priority bonus', -10);
    }
    if (game[card.side()].turn >= game.ultTurn) {
      var ult = game.data.skills.en.ult;
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