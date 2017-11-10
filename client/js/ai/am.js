game.heroesAI.am = {
  move: {
    default: 'smart'
  },
  play: function (card, cardData) {
    var blinks = $('.enemydecks .hand .skills.am-blink');
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
      if (!card.hasClass('done') && 
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
                card: blinks.first(),
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
          if (spot.hasClass('free') && !spot.hasClass('playerarea')) {
            cardData['cast-strats'].push({
              priority: 50 + spot.data('priority'),
              skill: 'blink',
              card: blinks.first(),
              target: spot
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
            cardInRange.around(2, function (nspot) {
              var sectarget = $('.card.player', nspot);
              if (sectarget.length) {
                targets++;
                if (sectarget.hasClasses('channeling towers')) p += 20;
              }
            });
            var mana = (cardInRange.data('mana') || 0) * 3;
            cardData['cast-strats'].push({
              priority: p + (targets * 8) + mana,
              skill: 'ult',
              card: ult,
              target: cardInRange
            });
          }
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
          cardData.strats.retreat += 10;
        }
      });
    }
    // prevent clustering 
    if (game.player.turns > game.ultTurn) {
      var ult = game.data.skills.am.ult;
      card.inRange(ult['cast range'], function (spot) {
        var spotData = spot.data('ai');
        spotData.priority -= 25;
        spotData['can-be-casted'] = true;
        spot.data('ai', spotData);
      });
    }
    card.data('ai', cardData);
  }
};

