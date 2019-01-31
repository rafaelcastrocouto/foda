game.heroesAI.kotl = {
  move: {
    default: 'alert'
  },
  play: function (card, cardData) {
    var illuminate = $('.enemydecks .hand .skills.kotl-illuminate');
    var mana = $('.enemydecks .hand .skills.kotl-mana');
    var blind = $('.enemydecks .hand .skills.kotl-blind');
    var ult = $('.enemydecks .hand .skills.kotl-ult');
    if (!$('.map .enemy.kotl').length) {
     illuminate.data('ai discard', illuminate.data('ai discard') + 1);
     blind.data('ai discard', blind.data('ai discard') + 1);
    }
    if (card.canCast(illuminate)) {
      cardData['can-cast'] = true;
      var range = illuminate.data('aoe range');
      var width = illuminate.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = cardData['can-attack'] ? -20 : 20;
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
            skill: 'illuminate',
            card: illuminate.first(),
            target: spot
          });
        }
      });
    }
    if (card.canCast(blind)) {
      cardData['can-cast'] = true;
      card.around(blind.data('cast range'), function (spot) {
        var targets = 0, p = 0;
        spot.around(blind.data('aoe range'), function (nspot) {
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
            skill: 'blind',
            card: blind,
            target: spot
          });
        }
      });
    }
    if (card.canCast(mana)) {
      cardData['can-cast'] = true;
      if (game[card.side()].skills.hand.children().length < 8) {
        cardData['cast-strats'].push({
          priority: 50,
          skill: 'mana',
          card: mana,
          target: card
        });
      }
    }
    if (card.canCast(ult)) {
      cardData['can-cast'] = true;
      card.around(ult.data('cast range'), function (spot) {
        var targets = 0, p = 0;
        spot.around(ult.data('aoe range'), function (nspot) {
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
            skill: 'ult',
            card: ult,
            target: spot
          });
        }
      });
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {
    var illuminate = game.data.skills.kotl.illuminate;
    var range = illuminate['aoe range'];
    var width = illuminate['aoe width'];
    var channeling = card.hasClass('channeling');
    card.around(1, function (dirSpot) {
      card.inLine(dirSpot, range, width, function (spot) {
        var spotData = spot.data('ai');
        spotData.priority -= 5;
        if (channeling) spotData.priority -= 25;
        spotData['can-be-casted'] = true;
        spot.data('ai', spotData);
        var cardInRange = $('.card.'+card.opponent(), spot);
        if (cardInRange.length && !cardInRange.hasClasses('ghost dead towers')) {
          var cardInRangeData = cardInRange.data('ai');
          cardInRangeData.strats.dodge += 10;
          if (channeling) cardInRangeData.strats.dodge += 15;
          cardInRange.data('ai', cardInRangeData);
        }
      });
    });
    $('.map .card.'+card.opponent()).each(function (i, el) {
      var opponent = $(el);
      var opponentData = opponent.data('ai');
      if (opponent.hasBuff('kotl-blind')) {
        opponentData.strats.siege += 30;
      }
      opponent.data('ai', opponentData);
    });
    card.data('ai', cardData);
  }
};