game.heroesAI.kotl = {
  move: {
    default: 'alert'
  },
  play: function (card, cardData) {
    var illuminate = $('.enemydecks .hand .skills.kotl-illuminate');
    var mana = $('.enemydecks .hand .skills.kotl-mana');
    var leak = $('.enemydecks .hand .skills.kotl-leak');
    var ult = $('.enemydecks .hand .skills.kotl-ult');
    var blind = $('.enemydecks .hand .skills.kotl-blind');
    var recall = $('.enemydecks .hand .skills.kotl-recall');
    if (!$('.map .enemy.kotl').length) {
     illuminate.data('ai discard', illuminate.data('ai discard') + 1);
     leak.data('ai discard', leak.data('ai discard') + 1);
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
            card: illuminate,
            target: spot
          });
        }
      });
    }
    if (card.canCast(leak)) {
      card.opponentsInRange(leak.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers units') && cardInRange.hasClass('heroes')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: cardInRange.data('mana') * 10,
            skill: 'leak',
            card: leak,
            target: cardInRange
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
      cardData['cast-strats'].push({
        priority: 60,
        skill: 'ult',
        card: ult,
        target: card
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
    if (card.canCast(recall)) {
      var allies = $('.map .card.'+card.side()+':not(.ghost, .dead, .towers)');
      if (allies.length) {
        cardData['can-cast'] = true;
        $.each(allies, function (i, el) {
          if (card[0] != el) {
            var ally = $(el);
            var hp = ally.data('current hp') / ally.data('hp');
            if (hp < 0.3) {
              cardData['cast-strats'].push({
                priority: parseInt(10 + ((0.3 / hp) * 10)),
                skill: 'recall',
                card: recall,
                target: ally
              });
            }
          }
        });
      }
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
      //var leak =   game.data.skills.kotl.leak;
      var opponent = $(el);
      var opponentData = opponent.data('ai');
      if (opponent.hasBuff('kotl-leak')) {
        opponentData.strats.stand += 40;
      }
      //var blind =  game.data.skills.kotl.blind;
      if (opponent.hasBuff('kotl-blind')) {
        opponentData.strats.siege += 30;
      }
      opponent.data('ai', opponentData);
    });
    card.data('ai', cardData);
  }
};