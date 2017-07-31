game.ai = {
  start: function () {
    game.currentData.moves = [];
    // remember ai is playing the enemy cards
    if (game.ai.mode == 'very-easy') {
      game.ai.movesLoop = 10; // number of units per turn
      game.ai.maxCount = 2; // max number of plays per card
      game.ai.lowChance = 0.4; // low chance errors eg: if (r > low) choose random target
      game.ai.highChance = 0.5; // high chance errors eg: if (r > high)
      game.ai.minP = 4;
    }
    if (game.ai.mode == 'easy') {
      game.ai.movesLoop = 12;
      game.ai.maxCount = 3;
      game.ai.lowChance = 0.3;
      game.ai.highChance = 0.4;
      game.ai.minP = 5;
    }
    if (game.ai.mode == 'normal') {
      game.ai.movesLoop = 15;
      game.ai.maxCount = 5;
      game.ai.lowChance = 0.1;
      game.ai.highChance = 0.2;
      game.ai.minP = 8;
    }
    if (game.ai.mode == 'hard') {
      game.ai.movesLoop = 20;
      game.ai.maxCount = 7;
      game.ai.lowChance = 0.02;
      game.ai.highChance = 0.1;
      game.ai.minP = 10;
    }
  },
  turnStart: function () {
    //game.message.text(game.data.ui.enemymove);
    //$('.map .ai').removeClass('ai');
    game.ai.currentmovesLoop = game.ai.movesLoop;
    if (!game.currentData.moves) game.currentData.moves = [];
    // activate all passives, other sidehand skills strats per hero
    $('.enemydecks .sidehand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.passives(card);
    });
    //creep summon
    $('.enemydecks .sidehand .units').each(function (i, el) {
      var card = $(el);
      game.ai.summon(card);
    });
    // add combo data and strats
    game.ai.comboData();
    //console.log(game.currentData.moves); debugger
    game.enemy.startMoving(game.ai.moveRandomCard);
  },
  moveRandomCard: function () {
    game.ai.resetData();
    // choose random card
    var availableCards = $('.map .enemy.card:not(.towers, .ai-max)');
    var chosenCard = availableCards.randomCard();
    var count = chosenCard.data('ai count');
    if ((!count || count < game.ai.maxCount) && chosenCard.length) {
      chosenCard.data('ai count', (chosenCard.data('ai count') || 0) + 1);
      if (chosenCard.data('ai count') == game.ai.maxCount) chosenCard.addClass('ai-max');
      //chosenCard.addClass('ai');
      // add attack and move data
      $('.map .enemy.card:not(.towers)').each(function (i, el) {
        var card = $(el);
        game.ai.buildData(card, 'enemy');
        if (card.hasClass('heroes')) {
          var hero = card.data('hero');
          var cardData = card.data('ai');
          if (game.heroesAI[hero] && cardData.strats[game.heroesAI[hero].move.default]) {
            cardData.strats[game.heroesAI[hero].move.default] += 20;
            card.data('ai', cardData);
          }
          if (game.heroesAI[hero] && game.heroesAI[hero].play) {
            game.heroesAI[hero].play(card, cardData);
          }
        }
      });
      // add defensive data and strats
      $('.map .player.card').each(function (i, el) {
        var card = $(el);
        game.ai.buildData(card, 'player');
        //per hero defend
        if (card.hasClass('heroes')) {
          var hero = card.data('hero');
          if (game.heroesAI[hero] && game.heroesAI[hero].defend) {
            var cardData = card.data('ai');
            game.heroesAI[hero].defend(card, cardData);
          }
        }
      });
      var cardData = chosenCard.data('ai');
      // cast strats
      var cast = game.ai.decideCast(chosenCard, cardData);
      // action strats
      if (!chosenCard.data('ai done') && !cast) {
        var choosen = game.ai.chooseStrat(chosenCard, cardData);
        if (choosen.priority > game.ai.minP) 
          game.ai.decideAction(choosen.strat, chosenCard, cardData);
      }
    } else {
      game.ai.nextMove();
      return;
    }
    if (game.currentData.moves.length) {
      //console.log(game.currentData.moves)
      game.enemy.autoMove(game.ai.nextMove);
    } else {
      game.timeout(420, game.ai.nextMove);
    }
  },
  nextMove: function () {
    if (game.ai.currentmovesLoop > 0 && game.turn.counter > 1) {
      game.ai.currentmovesLoop -= 1;
      game.ai.moveRandomCard();
    } else {
      game.ai.endTurn();
    }
  },
  endTurn: function () {
    // discard after N turns
    $('.enemyMoveHighlight').removeClass('enemyMoveHighlight');
    $('.enemyMoveHighlightTarget').removeClass('enemyMoveHighlightTarget');
    $('.source').removeClass('source');
    $('.ai-max').removeClass('ai-max');
    $('.enemydecks .hand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.skillsDiscard(card);
    });
    $('.map .card').each(function (i, el) {
      $(el).data('ai done', false);//.removeClass('ai');
    });
    game.single.endEnemyTurn();
  },
  resetData: function () {
    // todo: ai.history
    game.currentData.moves = [];
    $('.map .card').each(function (i, el) {
      $(el).data('ai', game.ai.newData());
    });
  },
  summon: function (card) {
    if (Math.random() < game.ai.lowChance) {
      var creep = card.data('type');
      var enemyarea = $('.spot.free.enemyarea');
      var r = parseInt(Math.random() * enemyarea.length);
      var to = enemyarea.eq(r).getPosition();
      game.currentData.moves.push('S:'+ game.map.mirrorPosition(to) +':' + creep);
    }
  },
  passives: function (card) {
    // activate all pasives
    if (card.data('type') == game.data.ui.passive) {
      var skillId = card.data('skill');
      var heroId = card.data('hero');
      var hero = $('.map .enemy.heroes.'+heroId);
      if (hero.length) {
        var spotId = hero.getSpot().attr('id');
        game.currentData.moves.push('P:'+game.map.mirrorPosition(spotId)+':'+skillId+':'+heroId);
      }
    }
  },
  newData: function () {
    var d = {
      'strat': '',
      'strats': {},
      'destinys': [],
      'attack-targets': [],
      'can-move': false,
      'can-attack': false,
      'can-attack-tower': false,
      'attack-can-kill': false,
      'can-be-attacked': false,
      'can-be-killed': false,
      'at-tower-limit': false,
      'in-tower-attack-range': false,
      'can-advance': false,
      'can-retreat': false,
      'can-cast': false,
      'cast-strats': [],
      'cast-targets': [],
      'can-make-action': false,
      'has-self-heal': false,
      'has-instant-attack-buff': false
    };
    $(game.ai.strats).each(function (i, strat) {
      d.strats[strat] = 1;
    });
    return d;
  },
  buildData: function (card, side) { 
    // console.log('buildData', card[0], card.data('ai'));
    var cardData = card.data('ai');
    if (card.data('current hp') < card.data('hp')/3) {
      cardData.strats.selfheal += 20;
    }
    var range = card.data('range');
    if (range && card.canAttack()) {
      card.opponentsInRange(range, function (opponentCard) {
        cardData['can-attack'] = true;
        cardData.strats.attack += 7;
        cardData['can-make-action'] = true;
        cardData['attack-targets'].push({
          priority: opponentCard.data('hp') - opponentCard.data('current hp')/4,
          target: opponentCard
        });
        var opponentData = opponentCard.data('ai');
        if (card.data('side')=='enemy') //console.log(card[0], opponentCard[0]);
        opponentData['can-be-attacked'] = true;
        opponentData.strats.retreat += 6;
        if ( opponentCard.hasClass('towers') ) {
          cardData.strats.attack += 20;
          cardData['can-attack-tower'] = true;
        }
        var hp = opponentCard.data('current hp');
        var damage = card.data('current damage');
        var armor = opponentCard.data('current armor');
        if ( hp <= (damage - armor) ) {
          cardData['attack-can-kill'] = true;
          cardData.strats.attack += 18;
          opponentData['can-be-killed'] = true;
          opponentData.strats.retreat += 10;
        }
        opponentCard.data('ai', opponentData);
      });
    }
    var opponent = game.opponent(side);
    card.around(game.data.ui.melee, function (neighbor) {
      if (neighbor.hasClass(opponent+'area')) {
        cardData['at-tower-limit'] = true;
        cardData.strats.alert += 2;
      }
    });
    var spot = card.getSpot();
    if (spot.hasClass(opponent+'area')) {
      cardData['in-tower-attack-range'] = true;
      cardData.strats.retreat += 2;
    }
    if (card.canMove() && side == 'enemy') {
      var x = spot.getX(), y = spot.getY();
      // advance
      var bot = game.map.getSpot(x, y + 1);
      var left = game.map.getSpot(x - 1, y);
      var bl = game.map.getSpot(x - 1, y + 1);
      var br = game.map.getSpot(x + 1, y + 1);
      // retreat
      var top = game.map.getSpot(x, y - 1);
      var right = game.map.getSpot(x + 1, y);
      var tr = game.map.getSpot(x + 1, y - 1);
      var tl = game.map.getSpot(x - 1, y - 1);
      // advance
      if (bot && bot.hasClass('free')) {
        cardData['can-advance'] = true;
        cardData.strats.offensive += 6;
        cardData = game.ai.spotData(cardData, bot, side, 'advance', 6);
      }
      if (left && left.hasClass('free')) {
        cardData['can-advance'] = true;
        cardData.strats.offensive += 2;
        cardData = game.ai.spotData(cardData, left, side, 'advance', 2);
      }
      if (bl && bl.hasClass('free') && (bot.hasClass('free') || left.hasClass('free'))) {
        cardData['can-advance'] = true;
        cardData.strats.offensive += 8;
        cardData = game.ai.spotData(cardData, bl, side, 'advance', 8);
      }
      if (br && br.hasClass('free') && (bot.hasClass('free') || right.hasClass('free'))) {
        cardData['can-advance'] = true;
        cardData.strats.offensive += 4;
        cardData = game.ai.spotData(cardData, br, side, 'advance', 4);
      }
      // retreat
      if (top && top.hasClass('free')) {
        cardData['can-retreat'] = true;
        cardData.strats.defensive += 6;
        cardData = game.ai.spotData(cardData, top, side, 'retreat', 6);
      }
      if (right && right.hasClass('free') && cardData['can-retreat']) {
        cardData['can-retreat'] = true;
        cardData.strats.defensive += 2;
        cardData = game.ai.spotData(cardData, right, side, 'retreat', 2);
      }
      if (tr && tr.hasClass('free') && (top.hasClass('free') || right.hasClass('free'))) {
        cardData['can-retreat'] = true;
        cardData.strats.defensive += 8;
        cardData = game.ai.spotData(cardData, tr, side, 'retreat', 8);
      }
      if (tl && tl.hasClass('free') && (top.hasClass('free') || left.hasClass('free'))) {
        cardData['can-retreat'] = true;
        cardData.strats.defensive += 4;
        cardData = game.ai.spotData(cardData, tl, side, 'retreat', 4);
      }
    }
    card.data('ai', cardData);
    //console.log(cardData);
  },
  spotData: function (cardData, spot, side, destiny, priority) {
    cardData['can-move'] = true;
    cardData.strats.move += 1;
    if (spot.hasClass(side+'area')) priority += 1;
    var opponent = game.opponent(side);
    if (spot.hasClass(opponent+'area')) priority -= 4;
    var o = {
      target: spot,
      priority: priority,
    };
    cardData.destinys.push(o);
    if (!cardData[destiny]) cardData[destiny] = [];
    cardData[destiny].push(o);
    return cardData;
  },
  comboData: function () {
    var combos = [];
    $('.map .enemy.card:not(.towers)').each(function (i, el) {
      /*
      var card = $(el);
      var cardData = card.data('ai');

      todo: add combo strats {
        attack combos
        single unit skill combos
        aoe combos
        stuners/disablers combos
        displacement combos
      }

      cardData.strats.combo += 10;
      */
    });
  },
  chooseStrat: function (card, cardData) {
    // console.log(card);
    var strats = [];
    $(game.ai.strats).each(function (i, strat) {
      strats.push({strat: strat, priority: cardData.strats[strat]});
    });
    return game.ai.choose(strats, 'priority', game.ai.lowChance);
  },
  decideCast: function (card, cardData) {
    //console.log(cardData['cast-strats'])
    if (cardData['cast-strats'].length) {
      var cast = game.ai.choose(cardData['cast-strats'], 'priority', game.ai.lowChance);
      //console.log('cast-skill', cast);
      if (cast.priority > game.ai.minP && cast.skill && cast.target) {
        game.ai.parseMove(card, cardData, 'cast', cast.target, cast.skill);
        return true;
      }
    }
  },
  strats: [
    'siege',
    'attack',
    'offensive',
    'smart',
    'move',
    'stand',
    'alert',
    'defensive',
    'retreat'
  ],
  decideAction: function (strat, card, cardData) {
    var action,
        target;
    //console.log('strat', strat, card, cardData);
    if (strat == 'siege') {
      if (cardData['can-attack-tower']) {
        action = 'attack';
        target = $('.map .towers.enemy');
      } else if (cardData['can-advance']) {
        action = 'advance';
      } else if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (strat == 'attack') {
      if (cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance']) {
        action = 'advance';
      }
    }
    if (strat == 'offensive') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance']) {
        action = 'advance';
      }
    }
    if (strat == 'secure') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (!cardData['can-be-attacked'] && cardData['can-advance']) {
        action = 'advance';
      } else if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'smart') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance'] && !cardData['at-tower-limit'] && !cardData['can-be-attacked']) {
        action = 'advance';
      } else if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'move') {
      if (cardData['can-move']) {
        action =  'move';
      } else if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (strat == 'stand') {
      if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (strat == 'alert') {
      if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'defensive') {
      if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      } else if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (strat == 'retreat') {
      if (cardData['can-retreat']) {
        action = 'retreat';
      } else if (cardData['can-make-action']) {
        action = 'any';
      }
    }
    if (action == 'any') {
      if (cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-move']) {
        action = 'move';
      } else action = false;
    }
    //console.log('action:', action); 
    if (action) {
      if (action == 'move' || action == 'advance' || action == 'retreat') {
        target = game.ai.chooseDestiny(card, cardData, action);
        action = 'move';
      }
      if (action == 'attack'){
        target = game.ai.chooseTarget(cardData['attack-targets']);
      }
      //console.log('target', target);
      if (action && target && target.priority > game.ai.minP) {
        game.ai.parseMove(card, cardData, action, target.target);
      }
    }
  },
  chooseDestiny: function (card, cardData, action) {
    var destinys = cardData.destinys;
    // filter advance and retreat spots
    if (action && cardData[action]) destinys = cardData[action];
    //console.log(action, destinys);
    if (destinys.length) {
      return game.ai.choose(destinys, 'priority', game.ai.highChance);
    }
  },
  chooseTarget: function (targets) {
    if (targets.length) {
      // priority 1: tower
      var towers;
      $(targets).each(function (i, t) {
        if (t.target.hasClass('towers')) towers = t;
      });
      if (towers) return towers;
      else {
        var t = game.ai.choose(targets, 'current hp', game.ai.lowChance, 'low');
        if (t.target.data('current hp') > 1) return t;
      }
    }
  },
  choose: function (itens, parameter, chance, i) {
    if (itens.length) {
      if (itens.length == 1) return itens[0];
      if (game.debug || Math.random() > chance) {
        itens.sort(function (a, b) {
          if (i) return a[parameter] - b[parameter];
          else return b[parameter] - a[parameter];
        });
        // console.log(itens)
        return itens[0];
      } else return itens.random();
    }
  },
  parseMove: function (card, cardData, action, target, skillId) {
    //console.log(action, target);
    var move = [];
    if (action == 'move' || action == 'advance' || action == 'retreat') {
      move[0] = 'M';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.attr('id'));
      card.data('ai done', true);
    }
    if (action == 'attack') {
      move[0] = 'A';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.getSpot().attr('id'));
      card.data('ai done', true);
    }
    if (action == 'cast') {
      move[0] = 'C';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.attr('id') || target.getSpot().attr('id'));
      move[3] = skillId; //
      move[4] = card.data('hero');
    }
    //console.log(move);
    game.currentData.moves.push(move.join(':'));
  },
  skillsDiscard: function (card) {
    // discard counter
    var n = card.data('ai discard');
    if (n === undefined) {
      n = 4;
    } else if (n > 0) {
      n -= 1;
    } else if (n <= 0) {
      var skillId = card.data('skill');
      var heroId = card.data('hero');
      game.currentData.moves.push('D:'+skillId+':'+heroId);
      n = undefined;
    }
    card.data('ai discard', n);
  }
};

