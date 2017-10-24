game.heroesAI.kotl = {
  move: {
    default: 'defensive'
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
    if (illuminate.length) {
      cardData['can-cast'] = true;
      var range = illuminate.data('aoe range');
      var width = illuminate.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = cardData['can-attack'] ? 15 : 0;
        card.opponentsInLine(spot, range, width, function (cardInRange) {
          targets++;
          p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'illuminate',
            target: spot
          });
        }
      });
    }
    if (leak.length) {
      cardData['can-cast'] = true;
      card.opponentsInRange(leak.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          if (cardInRange.hasClass('heroes')) {
            cardData['cast-strats'].push({
              priority: cardInRange.data('mana') * 10,
              skill: 'leak',
              target: cardInRange
            });
          }
        }
      });
    }
    if (mana.length) {
      if (game[card.side()].skills.hand.children().length < 8) {
        cardData['cast-strats'].push({
          priority: 50,
          skill: 'mana',
          target: card
        });
      }
    }
    if (ult.length) {
      cardData['cast-strats'].push({
        priority: 60,
        skill: 'ult',
        target: card
      });
    }
    if (blind.length) {
      cardData['can-cast'] = true;
      card.around(blind.data('cast range'), function (spot) {
        var targets = 0, p = cardData['can-attack'] ? 15 : 0;
        spot.around(blind.data('aoe range'), function (nspot) {
          var cardInRange = $('.card.player', nspot);
          if (cardInRange.length) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'blind',
            target: spot
          });
        }
      });
    }
    if (recall.length) {
      var allies = $('.map .card.'+card.side()+':not(ghost dead towers)');
      if (allies.length) {
        $.each(allies, function (i, el) {
          var ally = $(el);
          var hp = ally.data('current hp') / ally.data('hp');
          if (hp < 0.3) {
            cardData['cast-strats'].push({
              priority: parseInt(10 + ((0.3 / hp) * 10)),
              skill: 'recall',
              target: ally
            });
          }
        });
      }
    }
  },
  defend: function (kotl) {
    //console.log('defend-from-kotl');
    /*
    avoid illuminate
    avoid moving if leak-buff
    avoid attacking if blind-buff
    */
  }
};