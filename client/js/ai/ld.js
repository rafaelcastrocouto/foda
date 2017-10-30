game.heroesAI.ld = {
  move: {
    default: 'offensive'
  },
  play: function (card, cardData) {
    // bear strats (siege)
    // use return if bear is low hp
    // cardData['has-instant-attack-buff'] = true;
    card.data('ai', cardData);
    var bear = $('.enemydecks .sidehand .skills.ld-bear');
    var rabid = $('.enemydecks .hand .skills.ld-rabid');
    var roar = $('.enemydecks .hand .skills.ld-roar');
    var ult = $('.enemydecks .sidehand .skills.ld-ult');
    //return
    if (!$('.map .enemy.ld').length) {
      rabid.data('ai discard', rabid.data('ai discard') + 1);
      roar.data('ai discard', roar.data('ai discard') + 1);
    }
    if (game.enemy.turn > 2 && card.canCast(bear)) {
      if (cardData.advance.length) {
        $.each(cardData.advance, function (i, destiny) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: destiny.priority * 4,
            skill: 'bear',
            target: destiny.target
          });
        });
      }
    }
    if (card.canCast(rabid)) {
      cardData['can-cast'] = true;
      p = 10;
      if (cardData['can-attack']) p = 40;
      cardData['cast-strats'].push({
        priority: p,
        skill: 'bear',
        target: card
      });
    }
    var p;
    if (card.canCast(roar)) {
      cardData['can-cast'] = true;
      p = 0;
      card.opponentsInRange(roar.data('aoe range'), function (cardInRange) {
        p += 10;
        if (cardInRange.hasClass('channeling')) p += 20;
      });
      if (p) cardData['cast-strats'].push({
        priority: p,
        skill: 'bear',
        target: card
      });
    }
    if (card.canCast(ult)) {
      cardData['can-cast'] = true;
      var inMelee = 0, inRange = 0;
      card.opponentsInRange(2, function (cardInRange) {
        inMelee++;
      });
      if (!rot.hasClass('on')) { // turn on
        if (!cardData['can-attack'] || inMelee) cardData['cast-strats'].push({
          priority: 30 + (10 * inMelee),
          skill: 'ult',
          target: card
        });
      } else if (cardData['can-attack'] && !inMelee) { // turn off
        cardData['cast-strats'].push({
          priority: 30,
          skill: 'ult',
          target: card
        });
      }
    }
    card.data('ai', cardData);
  },
  defend: function (ld) {
    //console.log('defend-from-ld');
    //if bear in player area path block tower
  }
};