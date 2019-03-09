game.heroesAI.am = {
  move: {
    default: 'flank'
  },
  play: function (card, cardData) {
    var blinks = $('.enemydecks .hand .skills.am-blink');
    var mirrors = $('.enemydecks .hand .skills.am-mirror');
    var ult = $('.enemydecks .hand .skills.am-ult');
    if (!$('.map .enemy.am').length) {
      blinks.each(function (i, el) {
        var skill = $(el);
        var d = skill.data('ai discard') + 1;
        skill.data('ai discard', d);
      });
    }
    if (card.canCast(blinks.first())) {
      cardData['can-cast'] = true;
      // use blink to attack
      if (card.hasClass('can-move') && 
          cardData['can-attack'] && 
          card.data('current hp') > 25) {
        card.around(blinks.first().data('cast range'), function (spot) {
          if (spot.hasClass('free')) {
            var targets = 0, p = spot.data('priority');
            spot.around(card.data('range'), function (nspot) {
              var cardInRange = $('.card.player:not(.invisible, .ghost, .dead)', nspot);
              if (cardInRange.length) {
                targets++;
                p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
                if (cardInRange.hasClass('towers')) p += 70;
                if (cardInRange.hasClass('units')) p += 10;
                if (nspot.hasClass('enemyarea')) p -= 30;
              }
            });
            if (targets) {
              cardData['cast-strats'].push({
                priority: p,
                skill: 'blink',
                card: blinks.first().attr('id'),
                target: spot.attr('id')
              });
            }
          }
        });
      }
      //use mirror counter
      if ( mirrors.length && 
          (cardData['can-be-attacked'] || card.parent().data('can-be-casted')) ) {
        cardData['cast-strats'].push({
          priority: 150 - (cardData['current hp']*3),
          skill: 'mirror',
          card: mirrors.first().attr('id'),
          target: card.attr('id')
        });
      }
      //use blink to escape
      if (cardData['can-be-attacked'] && 
          card.data('current hp') < 25 &&
          (!card.hasClass('can-move') || !cardData['can-make-action']) ) {
        card.around(blinks.first().data('cast range'), function (spot) {
          if (spot.hasClass('free') && !spot.hasClass('playerarea')) {
            cardData['cast-strats'].push({
              priority: 50 + spot.data('priority'),
              skill: 'blink',
              card: blinks.first().attr('id'),
              target: spot.attr('id')
            });
          }
        });
      }
    }
    if (card.canCast(ult)) {
        /*opponent missing cards < N ||*/
        /*N ememies in target range ||*/
        /*after N turns*/
      card.inRange(ult.data('cast range'), function (spot) {
        var cardInRange = $('.card.player:not(.invisible, .ghost, .dead, .towers)', spot);
        var p = 20;
        if (cardInRange.length) {
          cardData['can-cast'] = true;
          var targets = 0;
          if (!cardInRange.hasClass('towers') && cardInRange.data('mana')) {
            if (cardInRange.hasClass('channeling')) p += 20;
            if (cardInRange.hasClass('units')) p -= 5;
            cardInRange.around(card.data('range'), function (nspot) {
              var sectarget = $('.card.player:not(.invisible, .ghost, .dead)', nspot);
              if (sectarget.length) {
                targets++;
                if (sectarget.hasClasses('channeling towers')) p += 20;
              }
            });
            var mana = (cardInRange.data('mana') || 0) * 3;
            cardData['cast-strats'].push({
              priority: p + (targets * 8) + mana,
              skill: 'ult',
              card: ult.attr('id'),
              target: cardInRange.attr('id')
            });
          }
        }
      });
    }
    //console.log(cardData['cast-strats'])
    card.data('ai', JSON.stringify(cardData));
  },
  defend: function (card, cardData) {
    //console.log('defend-from-am');
    //todo: not cast at mirror
    var blink = game.data.skills.am.blink;
    var side = card.side();
    var canBlinkTower = false;
    card.around(blink['cast range'], function (blinkSpot) {
      if (blinkSpot.hasClass('free')) {
        blinkSpot.around(card.data('range'), function (spot) {
          var cardInRange = $('.card.'+side, spot);
          if (cardInRange.hasClass('towers')) {
            canBlinkTower = true;
          }
        });
      }
    });
    // make ai units near the tower block am path
    if (canBlinkTower) {
      game.enemy.tower.atRange(2, function (spot) {
        var spotData = spot.data('ai');
        spotData.priority += 10;
        spot.data('ai', spotData);
      });
      game.enemy.tower.atRange(4, function (spot) {
        var defenderCard = spot.find('.card.'+side);
        if (defenderCard.length) {
          var defenderData = JSON.parse(defenderCard.data('ai'));
          defenderData.strats.retreat += 10;
          defenderCard.data('ai', JSON.stringify(defenderData));
        }
      });
    }
    if (game[side].turn >= game.ultTurn) {
      var ult = game.data.skills.am.ult;
      card.inRange(ult['cast range'], function (spot) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= 15;
        spotData['can-be-casted'] = true;
        spot.data('ai', JSON.stringify(spotData));
      });
    }
    card.data('ai', JSON.stringify(cardData));
  }
};

