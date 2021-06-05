game.heroesAI.kotl = {
  move: {
    default: 'alert'
  },
  play: function (card, cardData) {
    var illuminate = $('.'+game.ai.side+'decks .hand .skills.kotl-illuminate');
    var mana = $('.'+game.ai.side+'decks .hand .skills.kotl-mana');
    var blind = $('.'+game.ai.side+'decks .hand .skills.kotl-blind');
    var ult = $('.'+game.ai.side+'decks .hand .skills.kotl-ult');
    if (!$('.map .'+game.ai.side+'.kotl').length) {
     illuminate.data('ai discard', illuminate.data('ai discard') + 1);
     blind.data('ai discard', blind.data('ai discard') + 1);
    }
    if (card.canCast(illuminate)) {
      game.aia.castLine(card, illuminate);
    }
    if (card.canCast(blind)) {
      game.aia.castArea(card, blind);
    }
    if (card.canCast(mana)) {
      cardData['can-cast'] = true;
      if (game[card.side()].skills.hand.children().length < 8) {
        cardData['cast-strats'].push({
          priority: 50,
          skill: 'mana',
          card: mana.attr('id'),
          target: card.attr('id')
        });
      }
    }
    if (card.canCast(ult)) {
      cardData['can-cast'] = true;
      card.around(ult.data('cast range'), function (spot) {
        var targets = 0, p = 0;
        spot.around(ult.data('aoe range'), function (nspot) {
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
            skill: 'ult',
            card: ult.attr('id'),
            target: spot.attr('id')
          });
        }
      });
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var illuminate = game.data.skills.kotl.illuminate;
    var range = illuminate['aoe range'];
    var width = illuminate['aoe width'];
    var channeling = card.hasClass('channeling');
    card.around(1, function (dirSpot) {
      card.inLine(dirSpot, range, width, function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 5;
        if (channeling) spotData.priority -= 25;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
        var cardInRange = $('.card.'+card.opponent(), spot);
        if (cardInRange.length && !cardInRange.hasClasses('ghost dead towers')) {
          var cardInRangeData = JSON.parse(cardInRange.data('ai'));
          cardInRangeData.strats.dodge += 10;
          if (channeling) cardInRangeData.strats.dodge += 15;
          cardInRange.data('ai', JSON.stringify(cardInRangeData));
        }
      });
    });
    $('.map .card.'+card.opponent()).each(function (i, el) {
      var opponent = $(el);
      var opponentData = JSON.parse(opponent.data('ai'));
      if (opponent.hasBuff('kotl-blind')) {
        opponentData.strats.siege += 30;
      }
      opponent.data('ai', JSON.stringify(opponentData));
    });
    card.data('ai', JSON.stringify(cardData));
  }
};