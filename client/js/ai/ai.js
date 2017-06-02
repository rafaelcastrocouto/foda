game.ai = {
  start: function () {
    // remember ai is playing the enemy cards
    if (game.ai.mode == 'easy') {
      game.ai.movesLoop = 5; // number of units per turn
      game.ai.noMovesLoop = 2; // if no action retry N times
      game.ai.lowChance = 0.3; // eg: if (r > low) choose random target
      game.ai.highChance = 0.6; // eg: if (r > high)
    }
    if (game.ai.mode == 'normal') {
      game.ai.movesLoop = 8;
      game.ai.noMovesLoop = 4;
      game.ai.lowChance = 0.1;
      game.ai.highChance = 0.5;
    }
    if (game.ai.mode == 'hard') {
      game.ai.movesLoop = 16;
      game.ai.noMovesLoop = 6;
      game.ai.lowChance = 0.05;
      game.ai.highChance = 0.25;
    }
  },
  turnStart: function () {
    //game.message.text(game.data.ui.enemymove);
    $('.map .ai').removeClass('ai');
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
    // move and end turn
    // choose strat and decide moves
    
    //console.log(game.currentData.moves); debugger
    game.enemy.startMoving(game.ai.moveRandomCard);
  },
  moveRandomCard: function () {
    game.ai.resetData();
    // choose random card
    var availableCards = $('.map .enemy.card:not(.towers, .done, .ai)');
    var card = availableCards.randomCard();
    if (card.length) {
      // console.log(card[0]);
      card.addClass('ai');
      // add attack and move data
      $('.map .enemy.card:not(.towers)').each(function (i, el) {
        var card = $(el);
        game.ai.buildData(card, 'enemy');
      });
      // add defensive data and strats
      $('.map .player.card').each(function (i, el) {
        var card = $(el);
        game.ai.buildData(card, 'player');
        //per hero defend
        if (card.hasClass('heroes')) {
          var hero = card.data('hero');
          if (game.heroesAI[hero]) game.heroesAI[hero].defend(card);
        }
      });
      // add per hero data and strats
      game.ai.heroPlay();

      var cardData = card.data('ai');
      //console.log(cardData); 
      //debugger
      game.ai.chooseStrat(card, cardData);
      //todo: make a list of possible actions and after data
      game.ai.decideAction(card, cardData);
    }
    if (game.currentData.moves.length) {
      //console.log(game.currentData.moves)
      game.enemy.autoMove(game.ai.nextMove);
    } else {
      game.ai.nextMove();
    }
  },
  nextMove: function () {
    if (game.ai.currentmovesLoop > 0 && game.turn.counter > 1) {
      if (game.currentData.moves.length) {
        game.ai.currentmovesLoop -= 1;
      } else {
        game.ai.currentmovesLoop -= (1/game.ai.noMovesLoop);
      }
      game.ai.moveRandomCard();
    } else {
      game.ai.endTurn();
    }
  },
  endTurn: function () {
    //debugger
    // discard after N turns
    $('.enemydecks .hand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.skillsDiscard(card);
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
    if (Math.random() > game.ai.highChance) {
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
      var spotId = hero.getSpot().attr('id');
      game.currentData.moves.push('P:'+game.map.mirrorPosition(spotId)+':'+skillId+':'+heroId);
    }
  },
  newData: function () {
    var d = {
      'strat': '',
      'strats': {},
      'destiny': '',
      'destinys': [],
      'attack-targets': [],
      'can-move': false,
      'can-attack': false,
      'can-attack-tower': false,
      'attack-can-kill': false,
      'can-be-attacked': false,
      'can-be-killed': false,
      'at-tower-limit': false,
      'at-tower-attack-range': false,
      'at-fountain': false,
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
        cardData['attack-targets'].push(opponentCard);
        var opponentData = opponentCard.data('ai');
        if (card.data('side')=='enemy') //console.log(card[0], opponentCard[0]);
        opponentData['can-be-attacked'] = true;
        opponentData.strats.retreat += 6;
        if ( opponentCard.hasClass('towers') ) {
          cardData.strats.attack += 18;
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
      cardData['at-tower-attack-range'] = true;
      cardData.strats.retreat += 2;
    }
    if (spot.hasClass('fountain'+side)) {
      cardData['at-fountain'] = true;
      cardData.strats.advance += 5;
    }
    if (card.canMove() && side == 'enemy') {
      // advance
      var x = spot.getX(), y = spot.getY();
      var bot = game.map.getSpot(x, y + 1);
      var bl = game.map.getSpot(x - 1, y + 1);
      var left = game.map.getSpot(x - 1, y);
      if (bot && bot.hasClass('free')) {
        cardData['can-advance'] = true;
        cardData.strats.offensive += 1;
        cardData = game.ai.spotData(cardData, bot, side);
      }
      if (left && left.hasClass('free')) {
        cardData['can-advance'] = true;
        cardData.strats.offensive += 1;
        cardData = game.ai.spotData(cardData, left, side);
      }
      if (bl && bl.hasClass('free') && cardData['can-advance']) {
        cardData = game.ai.spotData(cardData, bl, side);
      }
      // retreat
      var top = game.map.getSpot(x, y - 1);
      var tr = game.map.getSpot(x + 1, y - 1);
      var right = game.map.getSpot(x + 1, y);
      if (tr && tr.hasClass('free')) {
        cardData['can-retreat'] = true;
        cardData.strats.defensive += 1;
        cardData = game.ai.spotData(cardData, tr, side);
      }
      if (top && top.hasClass('free')) {
        cardData['can-retreat'] = true;
        cardData.strats.defensive += 1;
        cardData = game.ai.spotData(cardData, top, side);
      }
      if (right && right.hasClass('free') && cardData['can-retreat']) {
        cardData = game.ai.spotData(cardData, right, side);
      }
      // top-left and bot-right
      var tl = game.map.getSpot(x - 1, y - 1);
      var br = game.map.getSpot(x + 1, y + 1);
      if (tl && tl.hasClass('free') && (top.hasClass('free') || left.hasClass('free'))) {
        cardData = game.ai.spotData(cardData, tl, side);
      }
      if (br && br.hasClass('free') && (bot.hasClass('free') || right.hasClass('free'))) {
        cardData = game.ai.spotData(cardData, br, side);
      }
    }
    card.data('ai', cardData);
    //console.log(cardData);
  },
  spotData: function (cardData, spot, side) {
    cardData['can-move'] = true;
    cardData.strats.move += 1;
    var p = 3;
    if (spot.hasClass(side+'area')) p += 1;
    var opponent = game.opponent(side);
    if (spot.hasClass(opponent+'area')) p -= 1;
    // todo: check number of possible attaks at the spot
    cardData.destinys.push({
      target: spot,
      priority: p,
    });
    return cardData;
  },
  heroPlay: function () {
    $('.map .enemy.card:not(.towers)').each(function (i, el) {
      var card = $(el);
      var cardData = card.data('ai');
      //per hero play
      if (card.hasClass('heroes')) {
        var hero = card.data('hero');
        if (game.heroesAI[hero] && cardData.strats[game.heroesAI[hero].move.default]) {
          cardData.strats[game.heroesAI[hero].move.default] += 8;
        }
        if (game.heroesAI[hero]) game.heroesAI[hero].play(card, cardData);
      }
      card.data('ai', cardData);
    });
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
    //console.log(cardData.strats);
    var strats = [];
    $(game.ai.strats).each(function (i, strat) {
      strats.push({strat: strat, priority: cardData.strats[strat]});
    });
    // highest priority
    if (Math.random() > game.ai.lowChance) {
      strats.sort(function (a, b) {
        return b.priority - a.priority;
      });
      cardData.strat = strats[0].strat;
    } else {
      // random strat
      var validRandom = ['smart', 'stand', 'alert'];
      if (cardData['can-move']) {
        validRandom.push('move');
        validRandom.push('defensive');
        validRandom.push('retreat');
      }
      if (cardData['can-attack']) {
        if (game.ai.mode == 'easy') validRandom.push('siege');
        validRandom.push('offensive');
        validRandom.push('attack');
      }
      if (cardData['can-cast']) {
        //validRandom.push('combo');
        validRandom.push('cast');
      }
      cardData.strat = validRandom.random();
    }
  },
  strats: [
  // todo: combo
    'siege',
    'attack',
    'cast',
    'offensive',
    'smart',
    'move',
    'stand',
    'alert',
    'defensive',
    'retreat',
    'selfheal'
  ],
  decideAction: function (card, cardData) {
    var strat = cardData.strat,
        action,
        target;

    //console.log('strat:', strat);
    
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
    if (strat == 'cast') {
      if (cardData['can-cast']) {
        action = 'cast';
      } else if (cardData['can-make-action']) {
        action = 'any';
      } else if (cardData['can-advance']) {
        action = 'advance';
      }
    }
    if (strat == 'combo') {
      action = cardData['combo-action'];
      target = cardData['combo-target'];
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
    if (strat == 'selfheal') {
      if (cardData['has-self-heal']) {
        action = 'selfheal';
      } else if (cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (action == 'any') {
      var hero = card.data('hero');
      if (hero &&
          game.heroesAI[hero] &&
          game.heroesAI[hero].action == 'attack' &&
          cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-cast']) {
        action = 'cast';
      } else if (cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-move']) {
        action = 'move';
      }
    }
    //console.log('action:', action);
    if (action) {
      if (action == 'move' || action == 'advance' || action == 'retreat') {
        target = cardData.destiny;
        if (!target) {
          target = game.ai.chooseDestiny(card, cardData);
        }
      }
      if (action == 'attack'){
        if (!target) target = game.ai.chooseTarget(cardData['attack-targets']);
        if (cardData['has-instant-attack-buff']) {
          // todo: activate instant skills (preAttack per hero?)
        }
      }
      if (action == 'cast') {
        var castStrats = cardData['cast-strats'];
        if (castStrats.length) {
          var castStrat = game.ai.chooseCast(castStrats);
          cardData['cast-skill'] = castStrat.skill;
          if (!target) {
            if (Math.random() > game.ai.highChance) target = castStrat.targets[0];
            else target = castStrat.targets.random();
          }
          if (cardData['has-instant-cast-buff']) {
            // todo: activate instant skills (preCast per hero?)
          }
        }
      }
      
      if ((action == 'move' || action == 'advance' || action == 'retreat' || action == 'attack' || action == 'cast') && !target) {
      } else if (action) {
        //console.log('target', target[0]);
        game.ai.parseMove(card, cardData, action, target);
      }
    }
  },
  chooseDestiny: function (card, cardData) {
    var destinys = cardData.destinys;
    // console.log(destinys);
    if (destinys.length) {
      // if selfheal always go to the fountain 
      if (cardData.strat == 'selfheal') {
        var fountain, side = card.data('side');
        $(destinys).each(function (i, destEl) {
          var d = $(destEl);
          if (d.hasClass('fountain'+side)) fountain = d;
        });
        if (fountain) return fountain;
      }
      //console.log(cardData.strat, destinys);
      if (Math.random() > game.ai.highChance) {
        destinys.sort(function (a, b) {
          return b.priority - a.priority;
        });
        return destinys[0].target;
      } else return destinys.random().target;
    }
  },
  chooseTarget: function (targets) {
    if (targets.length) {
      // priority 1: tower
      var towers;
      $(targets).each(function (i, t) {
        if (t.hasClass('towers')) towers = t;
      });
      if (towers) return towers;
      else if (Math.random() > game.ai.lowChance) {
        // priority 2: lowest hp
        targets.sort(function (a, b) {
          return a.data('current hp') - b.data('current hp');
        });
        return targets[0];
      } else return targets.random();
    }
  },
  chooseCast: function (castStrats) {
    if (castStrats.length) {
      if (Math.random() > game.ai.lowChance) {
        castStrats.sort(function (a, b) {
          return b.priority - a.priority;
        });
        return castStrats[0];
      } else castStrats.random();
    }
  },
  parseMove: function (card, cardData, action, target) {
    // console.log(card[0], action, target);
    var move = [];
    if (action == 'move' || action == 'advance' || action == 'retreat') {
      move[0] = 'M';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.attr('id'));
    }
    if (action == 'attack') {
      move[0] = 'A';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.getSpot().attr('id'));
    }
    if (action == 'cast') {
      move[0] = 'C';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.attr('id') || target.getSpot().attr('id'));
      move[3] = cardData['cast-skill']; //skillId
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

