game.heroesAI.cat = {
  move: {
    default: 'flank'
  },
  play: function (card, cardData) {
    var star = $('.'+game.ai.side+'decks .sidehand .skills.cat-star');
    var arrow = $('.'+game.ai.side+'decks .hand .skills.cat-arrow');
    var leap = $('.'+game.ai.side+'decks .sidehand .skills.cat-leap');
    var ult = $('.'+game.ai.side+'decks .hand .skills.cat-ult');
    if (!$('.map .'+game.ai.side+'.cat').length) {
      star.data('ai discard', star.data('ai discard') + 1);
      arrow.data('ai discard', arrow.data('ai discard') + 1);
      leap.data('ai discard', leap.data('ai discard') + 1);
    }
    if (card.canCast(star)) {
      cardData['can-cast'] = true;
      var targets = 0, p = 20;
      card.opponentsInRange(star.data('aoe range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead')) {
          targets++;
          p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
          if (cardInRange.hasClass('towers')) p += 20;
        }
      });
      if (targets > 1) {
        cardData['cast-strats'].push({
          priority: p,
          skill: 'star',
          card: star.attr('id'),
          target: card.attr('id')
        });
      }
    }
    if (card.canCast(arrow)) {
      cardData['can-cast'] = true;
      var range = arrow.data('aoe range');
      card.around(1, function (spot) {
        var cardInRange = card.firstCardInLine(spot, range);
        if (cardInRange && cardInRange.side() == card.opponent() && !cardInRange.hasClasses('invisible ghost dead')) {
          var p = 25;
          if (cardInRange.hasClass('channeling')) p += 20;
          if (cardInRange.hasClass('units')) p -= 15;
          cardData['cast-strats'].push({
            priority: p + parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
            skill: 'arrow',
            card: arrow.attr('id'),
            target: spot.attr('id')
          });
        }
      });
    }
    //leap
    if (card.canCast(leap)) {
      cardData['can-cast'] = true;
      // use leap to attack
      if (card.hasClass('can-move') && 
          cardData['can-attack'] && 
          card.data('current hp') > 25) {
        card.atRange(leap.data('cast range'), function (spot) {
          if (spot.hasClass('free')) {
            var targets = 0, p = spot.data('priority');
            spot.around(card.data('range'), function (nspot) {
              var cardInRange = $('.card.'+game.opponent(game.ai.side)+':not(.invisible, .ghost, .dead, .towers)', nspot);
              if (cardInRange.length) {
                targets++;
                p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
                if (cardInRange.hasClass('towers')) p += 70;
                if (nspot.hasClass(game.ai.side+'area')) p -= 30;
                if (cardInRange.hasClass('units')) p -= 10;
              }
            });
            if (targets) {
              cardData['cast-strats'].push({
                priority: p,
                skill: 'leap',
                card: leap.attr('id'),
                target: spot.attr('id')
              });
            }
          }
        });
      }
      //use leap to escape
      if (cardData['can-be-attacked'] && 
          card.data('current hp') < 25 &&
          (!card.hasClass('can-move') || !cardData['can-make-action']) ) {
        card.atRange(leap.data('cast range'), function (spot) {
          if (spot.hasClass('free') && !spot.hasClass(game.opponent(game.ai.side)+'area')) {
            cardData['cast-strats'].push({
              priority: 50 + spot.data('priority'),
              skill: 'leap',
              card: leap.attr('id'),
              target: spot.attr('id')
            });
          }
        });
      }
    }
    //ult
    if (card.canCast(ult)) {
      cardData.strats.siege += 15;
      game.aia.selfCastUlt(card, cardData, ult);
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var star = game.data.skills.cat.star;
    card.inRange(star['aoe range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 5;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    var arrow = game.data.skills.cat.arrow;
    game.aia.lineDodge(card, arrow, 18);
    var leap = game.data.skills.cat.leap;
    var canBlinkTower = false;
    card.atRange(leap['cast range'], function (spot) {
      if (spot.hasClass('free')) {
        spot.around(card.data('range'), function () {
          var spotData = JSON.parse(spot.data('ai'));
          spotData.priority -= 1;
          spot.data('ai', JSON.stringify(spotData));
          if (card.hasClass('towers')) {
            canBlinkTower = true;
          }
        });
      }
    });
    if (canBlinkTower) {
      game[game.ai.side].tower.atRange(2, function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority += 30;
        spot.data('ai', JSON.stringify(spotData));
      });
      game[game.ai.side].tower.atRange(4, function (spot) {
        var defenderCard = spot.find('.card.'+side);
        if (defenderCard.length) {
          var defenderData = JSON.parse(defenderCard.data('ai'));
          defenderData.strats.retreat += 20;
          defenderCard.data('ai', JSON.stringify(defenderData));
        }
      });
    }
    if (card.hasBuff('cat-ult')) {
      $('.map .card.'+game.ai.side).each(function (i, aicardel) {
        game.aia.retreat(15, aicardel);
      });
    }
    card.data('ai', JSON.stringify(cardData));
  }
};