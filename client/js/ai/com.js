game.heroesAI.com = {
  move: {
    default: 'offensive'
  },
  play: function (card, cardData) {
    var aoe = $('.enemydecks .hand .skills.com-aoe');
    var heal = $('.enemydecks .hand .skills.com-heal');
    var ult = $('.enemydecks .hand .skills.com-ult');
    if (!$('.map .enemy.com').length) {
      aoe.data('ai discard', aoe.data('ai discard') + 1);
    }
    if (card.canCast(aoe)) {
      cardData['can-cast'] = true;
      card.inRange(aoe.data('cast range'), function (spot) {
        var targets = 0, p = 10;
        spot.inRange(aoe.data('aoe range'), function (castSpot) {
          var cardInRange = $('.card.player', castSpot);
          if (cardInRange.length) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
            if (cardInRange.hasClass('towers')) p += 20;
            if (cardInRange.hasClass('units')) p -= 5;
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'aoe',
            card: aoe,
            target: spot
          });
        }
      });
    }
    if (card.canCast(heal)) {
      card.inRange(heal.data('cast range'), function (spot) {
        var cardInRange = $('.card.enemy:not(.ghost, .dead, .towers, .units)', spot);
        var p = 10;
        if (cardInRange.length) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: p + parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
            skill: 'heal',
            card: heal,
            target: cardInRange
          });
        }
      });
    }
    if (card.canCast(ult)) {
      card.inRange(ult.data('cast range'), function (spot) {
        var cardInRange = $('.card.player:not(.invisible, .ghost, .dead, .towers, .units)', spot);
        if (cardInRange.length) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4),
            skill: 'ult',
            card: ult,
            target: cardInRange
          });
        }
      });
    }
    card.data('ai', cardData);
  },
  defend: function (card, cardData) {

    //card.data('ai', cardData);
  }
};