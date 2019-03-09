game.heroesAI.venge = {
  move: {
    default: 'attack'
  },
  play: function (card, cardData) {
    var stun = $('.enemydecks .hand .skills.venge-stun');
    var corruption = $('.enemydecks .hand .skills.venge-corruption');
    var ult = $('.enemydecks .hand .skills.venge-ult');
    if (!$('.map .enemy.venge').length) {
      stun.data('ai discard', stun.data('ai discard') + 1);
      corruption.data('ai discard', corruption.data('ai discard') + 1);
    }
    if (card.canCast(stun)) {
      cardData['can-cast'] = true;
      card.opponentsInRange(stun.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          var p = 50;
          if (cardInRange.hasClass('channeling')) p += 30;
          if (cardInRange.hasClass('units')) p -= 25;
          cardData['cast-strats'].push({
            priority: p - (cardInRange.data('current hp')/4),
            skill: 'stun',
            card: stun.attr('id'),
            target: cardInRange.attr('id')
          });
        }
      });
    }
    if (card.canCast(corruption)) {
      cardData['can-cast'] = true;
      var range = corruption.data('aoe range');
      var width = corruption.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = 0;
        card.opponentsInLine(spot, range, width, function (cardInRange) {
          if (!cardInRange.hasClasses('invisible ghost dead towers')) {
            targets++;
            if (cardInRange.hasClass('towers')) p += 20;
            if (cardInRange.hasClass('units')) p -= 5;
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p + (targets * 10),
            skill: 'corruption',
            card: corruption.attr('id'),
            target: spot.attr('id')
          });
        }
      });
    }
    //ult
    if (card.canCast(ult)) {
      cardData['can-cast'] = true;
      // use ult to attack
      if (card.hasClass('can-move') && 
          cardData['can-attack'] && 
          card.data('current hp') > 25) {
        card.around(ult.data('cast range'), function (spot) {
          var cardInRange = $('.card:not(.invisible, .ghost, .dead, .towers)', spot);
          if (cardInRange) {
            var targets = 0, p = 0;
            cardInRange.around(card.data('range'), function (nspot) {
              var cardInUltRange = $('.card.player:not(.invisible, .ghost, .dead, .towers)', nspot);
              if (cardInUltRange.length) {
                targets++;
                p += parseInt((cardInUltRange.data('hp')-cardInUltRange.data('current hp'))/4);
                if (cardInUltRange.hasClass('towers')) p += 70;
                if (cardInUltRange.hasClass('units')) p -= 5;
                if (nspot.hasClass('enemyarea')) p -= 30;
              }
            });
            if (targets) {
              cardData['cast-strats'].push({
                priority: p,
                skill: 'ult',
                card: ult.attr('id'),
                target: spot.attr('id')
              });
            }
          }
        });
      }
      //use ult to escape
      if (cardData['can-be-attacked'] && 
          card.data('current hp') < 25 &&
          (!card.hasClass('can-move') || !cardData['can-make-action']) ) {
        card.alliesInRange(ult.data('cast range'), function (cardInRange) {
          if (cardInRange.hasClass('units')) p += 30;
          cardData['cast-strats'].push({
            priority: 100 - cardInRange.data('current hp'),
            skill: 'ult',
            card: ult.attr('id'),
            target: cardInRange.attr('id')
          });
        });
      }
    }
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    var stun = game.data.skills.venge.stun;
    card.inRange(stun['cast range'], function (spot) {
      var spotData = JSON.parse(spot.data('ai'));
      spotData.priority -= 5;
      spotData['can-be-casted'] = true;
      spot.data('ai', JSON.stringify(spotData));
    });
    var corruption = game.data.skills.venge.corruption;
    var range = corruption['aoe range'];
    var width = corruption['aoe width'];
    card.around(1, function (dirSpot) {
      card.inLine(dirSpot, range, width, function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 10;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
        var cardInRange = $('.card.'+card.opponent(), spot);
        if (cardInRange.length && !cardInRange.hasClasses('ghost dead towers')) {
          var cardInRangeData = cardInRange.data('ai');
          cardInRangeData.strats.dodge += 30;
          cardInRange.data('ai', cardInRangeData);
        }
      });
    });
    var ult = game.data.skills.venge.ult;
    var side = card.side();
    var canSwapTower = false;
    if (game[side].turn >= game.ultTurn) {
      card.around(ult['cast range'], function (swapSpot) {
        if (swapSpot.hasClass('free')) {
          swapSpot.around(card.data('range'), function (spot) {
            var cardInRange = $('.card.'+side, spot);
            if (cardInRange.hasClass('towers')) {
              canSwapTower = true;
            }
          });
        }
      });
      // make ai units near the tower walk away
      if (canSwapTower) {
        game.enemy.tower.atRange(2, function (spot) {
          var spotData = JSON.parse(spot.data('ai'));
          spotData.priority -= 30;
          spot.data('ai', JSON.stringify(spotData));
        });
        game.enemy.tower.atRange(4, function (spot) {
          var defenderCard = spot.find('.card.'+side);
          if (defenderCard.length) {
            var defenderData = defenderCard.data('ai');
            defenderData.strats.siege += 20;
            defenderCard.data('ai', defenderData);
          }
        });
      }
    }
    card.data('ai', JSON.stringify(cardData));
  }
};