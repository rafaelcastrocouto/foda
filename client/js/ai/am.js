game.heroesAI.am = {
  move: {
    default: 'smart'
  },
  play: function (card, cardData) {
    var blinks = $('.enemydecks .hand .skills.am-blink');
    if (!$('.map .enemy.am').length) {
      blinks.each(function (i, el) {
        var skill = $(el);
        var d = skill.data('ai discard') + 1;
        skill.data('ai discard', d);
      });
    }
    if (blinks.length) {
      cardData['can-cast'] = true;
      // use blink to attack
      if (!card.hasClass('done') && !cardData['can-attack'] && card.data('current hp') > 25) {
        card.around(blinks.first().data('cast range'), function (spot) {
          if (spot.hasClass('free')) {
            var targets = 0, p = 10;
            spot.around(game.data.ui.melee, function (nspot) {
              var cardInRange = $('.card.player', nspot);
              if (cardInRange.length) {
                targets++;
                p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
                if (cardInRange.hasClass('towers')) p += 50;
                if (nspot.hasClass('enemyarea')) p -= 15;
              }
            });
            if (targets) {
              cardData['cast-strats'].push({
                priority: p - ((targets - 1) * 4),
                skill: 'blink',
                target: spot
              });
            }
          }
        });
      }
      //use blink to escape
      if (cardData['can-be-attacked'] && 
          card.data('current hp') < 25 &&
          (card.hasClass('done') || !cardData['can-make-action']) ) {
        card.around(blinks.first().data('cast range'), function (spot) {
          if (spot.hasClass('free')) {
            var targets = 0;
            if (!spot.hasClass('playerarea')) {
              spot.around(game.data.ui.melee, function (nspot) {
                var cardInRange = $('.card.player', nspot);
                if (cardInRange.length) {
                  targets++;
                }
              });
              cardData['cast-strats'].push({
                priority: 20 - targets,
                skill: 'blink',
                target: spot
              });
            }
          }
        });
      }
    }
    var ult = $('.enemydecks .hand .skills.am-ult');
    if (ult.length) {
        /*opponent missing cards < N ||*/
        /*N ememies in target range ||*/
        /*after N turns*/
      cardData['can-cast'] = true;
      card.opponentsInRange(ult.data('cast range'), function (cardInRange) {
        var targets = 0;
        if (!cardInRange.hasClass('towers') && cardInRange.data('mana')) {
          cardInRange.around(2, function (nspot) {
            var sectarget = $('.card.player', nspot);
            if (sectarget.length) {
              targets++;
            }
          });
          var mana = (cardInRange.data('mana') || 0) * 3;
          cardData['cast-strats'].push({
            priority: 30 + (targets * 4) + mana,
            skill: 'ult',
            target: cardInRange
          });
        }
      });
    }
    //console.log(cardData['cast-strats'])
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {
    //console.log('defend-from-am');
    var canBlinkTower = false;
    card.opponentsInRange(6, function () {
      if (card.hasClasses('enemy towers')) {
        canBlinkTower = true;
      }
    });
    // make ai units near the tower block am path
    if (canBlinkTower) {
      game.enemy.tower.atRange(4, function (spot) {
        var card = spot.find('.card.enemy');
        if (card.length) {
          cardData.strats.retreat += 5;
        }
      });
    }
    // todo: defend from ult
    card.data('ai', cardData);
  }
};

