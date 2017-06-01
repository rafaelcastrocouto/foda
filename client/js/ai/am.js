game.heroesAI.am = {
  move: {
    default: 'smart'
  },
  action: {
    default: 'attack'
  },
  play: function (card) {
    var cardData = card.data('ai');
    var hasBlink = $('.enemydecks .hand .skills.am-blink');
    //save blinks for escape
    hasBlink.each(function (i, el) {
      var skill = $(el);
      var d = skill.data('ai discard') + 1;
      card.data('ai discard', d);
    });
    if (hasBlink.length) {
      cardData['can-cast'] = true;
      cardData.strats.cast += 7;
      cardData['can-make-action'] = true;
    }
    var towerInBlinkRange = false;
    var blinkSpots = [];
    card.inRange(6, function (spot) {
      var cardInRange = $('.card', spot);
      if (cardInRange.length && cardInRange.hasClasses('player towers')) {
        towerInBlinkRange = true;
      } else {
        blinkSpots.push(spot);
      }
    });
    var towerFreeNeighbors = [];
    if (blinkSpots.length && towerInBlinkRange) {
      game.player.tower.around(2, function (spot) {
        if (spot.hasClass('free')) towerFreeNeighbors.push(spot);
      });
    }
    var towerBlinkSpots = [];
    if (blinkSpots.length && towerInBlinkRange && towerFreeNeighbors.length) {
      for (var i = 0; i < blinkSpots; i++) {
        var bspot = blinkSpots[i];
        for (var j = 0; j < towerFreeNeighbors; j++) {
          var tspot = towerFreeNeighbors[j];
          if (bspot[0] == tspot[0]) towerBlinkSpots.push(bspot);
        }
      }
    }
    if ((hasBlink.length > 2) && towerBlinkSpots.length) {
      //use blink to attack the tower
      cardData.strats.cast += 10;
      cardData['cast-strats'].push({
        priority: 15,
        skill: 'blink',
        targets: towerBlinkSpots
      });
    }
    var cardInUltRange = [];
    var hasUlt = $('.enemydecks .hand .skills.am-ult');
    if (hasUlt.length
        /*opponent missing cards < N ||*/
        /*N ememies in target range ||*/
        /*after N turns*/) {
      card.inRange(2, function (spot) {
        var cardInRange = $('.card', spot);
        if (cardInRange.length && cardInRange.hasClasses('enemy')) {
          cardInUltRange.push(cardInRange);
        }
      });
      if (cardInUltRange.length) {
        cardData['cast-strats'].push({
          priority: 20,
          skill: 'ult',
          targets: cardInUltRange
        });
      } 
    }
    card.data('ai', cardData);
  },
  defend: function (card) {
    //console.log('defend-from-am');
    var cardData = card.data('ai');
    var canBlinkTower = false;
    card.opponentsInRange(6, function () {
      if (card.hasClasses('enemy towers')) {
        canBlinkTower = true;
      }
    });
    // make ai units near the tower block am path
    if (canBlinkTower) {
      game.enemy.tower.atRange(4, function (spot) {
        var card = spot.find('.card.'+side);
        if (card.hasClass('enemy')) {
          cardData.strats.retreat += 5;
        }
      });
    }
    // todo: defend from ult
    card.data('ai', cardData);
  }
};

