game.heroesAI.nyx = {
  move: {
    default: 'defensive'
  },
  play: function (card, cardData) {
    var spike = $('.enemydecks .hand .skills.nyx-spike');
    var stun = $('.enemydecks .hand .skills.nyx-stun');
    var burn = $('.enemydecks .hand .skills.nyx-burn');
    var ult = $('.enemydecks .hand .skills.nyx-ult');
    if (!$('.map .enemy.nyx').length) {
     burn.data('ai discard', burn.data('ai discard') + 1);
     stun.data('ai discard', stun.data('ai discard') + 1);
     spike.data('ai discard', spike.data('ai discard') + 1);
    }
    // siege if has spike
    if (card.canCast(spike)) {
      cardData.strats.siege += 15;
      cardData['can-cast'] = true;
      cardData['cast-strats'].push({
        priority: 20,
        skill: 'spike',
        target: card
      });
    }
    // stun if 1 or more enemies are aligned
    if (card.canCast(stun)) {
      cardData['can-cast'] = true;
      var range = stun.data('aoe range');
      var width = stun.data('aoe width');
      card.around(1, function (spot) {
        var targets = 0, p = 10;
        card.opponentsInLine(spot, range, width, function (cardInRange) {
          if (!cardInRange.hasClasses('invisible ghost dead')) {
            targets++;
            p += parseInt((cardInRange.data('hp')-cardInRange.data('current hp'))/4);
            if (cardInRange.hasClasses('channeling towers')) p += 20;
          }
        });
        if (targets > 1) {
          cardData['cast-strats'].push({
            priority: p,
            skill: 'stun',
            target: spot
          });
        }
      });
    }
    //mana burn
    if (card.canCast(burn)) {
      card.opponentsInRange(burn.data('cast range'), function (cardInRange) {
        if (!cardInRange.hasClasses('invisible ghost dead towers')) {
          cardData['can-cast'] = true;
          cardData['cast-strats'].push({
            priority: cardInRange.data('mana'),
            skill: 'burn',
            target: cardInRange
          });
        }
      });
    }
    //ult
    if (card.canCast(ult)) {
      cardData.strats.siege += 15;
      cardData['can-cast'] = true;
      cardData['cast-strats'].push({
        priority: 60,
        skill: 'ult',
        target: card
      });
    }
    card.data('ai', cardData);
  },
  defend: function (nyx) {
    //console.log('defend-from-nyx');
    //aviod align
  }
};