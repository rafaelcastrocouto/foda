game.ai = {
  timeToPlay: 30,
  side: 'enemy',
  start: function () {
    game.currentData.moves = [];
    if (game.ai.mode == 'very-easy') game.ai.level = 3;
    if (game.ai.mode == 'easy')      game.ai.level = 4;
    if (game.ai.mode == 'normal')    game.ai.level = 5;
    if (game.ai.mode == 'hard')      game.ai.level = 6;
    if (game.ai.mode == 'very-hard') game.ai.level = 8;
    game.ai.timeToPlay = 10 * game.ai.level;
    if (game.debug) game.ai.level = 9;
  },
  turnStart: function () { //console.log('ai start turn')
    // remember ai is playing the enemy cards
    game.ai.currentmovesLoop = game.ai.level*2;
    game.ai.resetData();
    // add combo data and strats
    //game.ai.comboData();
    // activate all passives, other sidehand skills strats per hero
    $('.enemydecks .sidehand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.passives(card);
    });
    game.ai.autoMove(game.ai.moveRandomCard);
  },
  moveRandomCard: function () {
    game.ai.resetData();
    // choose random card
    var availableCards = $('.map .enemy.card:not(.towers, .dead, .ai-max, .stunned, .disabled, .channeling, .ghost)');
    var chosenCard = availableCards.randomCard();
    var chosenCardData = chosenCard.data('ai');
    var count = chosenCard.data('ai count');
    if ((!count || count < game.ai.level) && chosenCard.length) {
      chosenCard.data('ai count', (chosenCard.data('ai count') + 1 || 0));
      if (chosenCard.data('ai count') >= game.ai.level) chosenCard.addClass('ai-max');
      // add defensive data and strats
      $('.map .player.card:not(.towers, .dead, .stunned, .disabled, .channeling, .ghost)').each(function (i, el) {
        var card = $(el);
        game.ai.buildData(card);
        if (card.hasClass('heroes')) {
          var hero = card.data('hero');
          if (game.heroesAI[hero] && game.heroesAI[hero].defend) {
            var cardData = card.data('ai');
            // add per hero defend data
            game.heroesAI[hero].defend(card, cardData);
          }
        }
      });
      if (game.debug) {
        $('.map .spot').each(function (i, el) {
          var spot = $(el);
          $('.debug', spot).text(spot.data('ai').priority);
        });
      }
      // add attack and move data
      $('.map .enemy.card:not(.towers, .dead, .ghost)').each(function (i, el) {
        var card = $(el);
        game.ai.buildData(card);
        if (card.hasClass('heroes')) {
          var hero = card.data('hero');
          var cardData = card.data('ai');
          if (game.heroesAI[hero] && cardData.strats[game.heroesAI[hero].move.default]) {
            cardData.strats[game.heroesAI[hero].move.default] += 10;
            card.data('ai', cardData);
          }
          if (game.heroesAI[hero] && game.heroesAI[hero].play) {
            // add per hero cast data
            game.heroesAI[hero].play(card, cardData);
          }
        }
      });
      // cast strats
      var cast = game.ai.decideCast(chosenCard, chosenCardData);
      if (!chosenCard.data('ai done') && !cast) {
        var choosen = game.ai.chooseStrat(chosenCard, chosenCardData);
        // action strats
        if (choosen) game.ai.decideAction(choosen.strat, chosenCard, chosenCardData);
      }
    }
    game.ai.autoMove(game.ai.nextMove);
  },
  nextMove: function () {
    if (game.turn.counter > 1) {
      if (game.ai.currentmovesLoop > 0) {
        game.ai.currentmovesLoop -= 1;
        game.ai.moveRandomCard();
      } else {
        game.ai.lastMoves();
      }
    } else {
      game.ai.endTurn();
    }
  },
  lastMoves: function () {
    //console.log('ai end turn')
    //check attack
    $('.map .card:not(.towers, .dead, .stunned, .disabled, .channeling, .ghost)').each(function (i, el) {
      var card = $(el);
      if (card.side() == game.ai.side && !card.hasClass('channeling')) game.ai.checkAttack(card);
    });
    // creep summon
    $('.enemydecks .sidehand .units').each(function (i, el) {
      var card = $(el);
      if (Math.random()*20 > game.ai.level) game.ai.summon(card);
    });
    // discard after N turns
    $('.enemydecks .hand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.skillsDiscard(card);
    });
    //console.log(game.currentData.moves)
    game.ai.autoMove(game.ai.endTurn);
  },
  endTurn: function () {
    $('.enemyMoveHighlight').removeClass('enemyMoveHighlight');
    $('.enemyMoveHighlightTarget').removeClass('enemyMoveHighlightTarget');
    $('.card').data('ai count', 0);
    $('.source').removeClass('source');
    $('.ai-max').removeClass('ai-max');
    game.single.endEnemyTurn();
  },
  autoMove: function (cb) {
    if (game.turn.counter > 1) {
      if (game.currentData.moves.length) {
        game.enemy.moveEndCallback = cb;
        game.currentMoves = game.currentData.moves;
        game.enemy.autoMoveCount = 0;
        game.enemy.autoMove();
      } else cb();
    } else game.ai.endTurn();
  },
  passives: function (card) {
    // activate all pasives
    if (card.data('type') == game.data.ui.passive) {
      var skillId = card.data('skill');
      var heroId = card.data('hero');
      var hero = $('.map .card.enemy.heroes.'+heroId+':not(.dead, .ghost)');
      if (hero.length) {
        var spotId = hero.getSpot().attr('id');
        if (spotId) game.currentData.moves.push('P:'+game.map.mirrorPosition(spotId)+':'+skillId+':'+heroId);
      }
    }
  },
  resetData: function () { 
    //console.log('reset ai')
    // todo: ai.history
    game.currentData.moves = [];
    $('.map .card:not(.dead, .ghost)').each(function (i, el) {
      var card = $(el);
      card.data('ai', game.ai.newData(card));
      card.data('ai done', false);
    });
    $('.map .spot').each(function (i, el) {
      var spot = $(el);
      spot.data('ai', game.ai.newSpotData(spot));
    });
  },
  newData: function (card) {
    var d = {
      'strat': '',
      'strats': {},
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
      'can-dodge': false,
      'can-cast': false,
      'cast-strats': [],
      'cast-targets': [],
      'can-make-action': false,
      'attack-targets': [],
      'move': [],
      'advance': [],
      'dodge': [],
      'retreat': []
    };
    $(game.ai.strats).each(function (i, strat) {
      d.strats[strat] = 1;
    });
    return d;
  },
  newSpotData: function (spot) {
    var d = {
      'blocked': !spot.hasClass('free'),
      'priority': 40,
      'can-be-attacked': false,
      'can-be-casted': false
    };
    return d;
  },
  buildData: function (card) {
    //console.log('buildData', card[0], card.data('ai'));
    var side = card.side();
    var opponent = card.opponent();
    var cardData = card.data('ai');
    var range = card.data('range');
    // retreat when hp is low
    if (card.data('current hp') < card.data('hp')/3) {
      cardData.strats.retreat += 20;
    }
    if (card.canMove()) {
      cardData['can-move'] = true;
    }
    card.around(range, function (spot) {
      // if can attack next turn
      if (side != game.ai.side) {
        var spotData = spot.data('ai');
        spotData.priority -= (card.data('current damage'));
        spotData['can-be-attacked'] = true;
        spot.data('ai', spotData);
      }
      var opponentCard = $('.card.'+opponent+':not(.invisible, .dead, .ghost)', spot);
      if (opponentCard.length) {
        //there is one opponent in range 
        if (card.canAttack()) {
          cardData['can-attack'] = true;
        }
        // attack target
        cardData.strats.attack += 10;
        cardData['attack-targets'].push({
          priority: 50 - (opponentCard.data('current hp')/2),
          target: opponentCard
        });
        // retreat if in enemy range
        var opponentData = opponentCard.data('ai');
        opponentData['can-be-attacked'] = true;
        opponentData.strats.retreat += 15;
        // attack towers
        if ( opponentCard.hasClass('towers') ) {
          cardData.strats.attack += 30;
          cardData['can-attack-tower'] = true;
        }
        //check death
        var hp = opponentCard.data('current hp');
        var damage = card.data('current damage');
        var armor = opponentCard.data('current armor');
        if ( hp <= (damage - armor) ) {
          // attack if able to kill
          cardData['attack-can-kill'] = true;
          cardData.strats.attack += 20;
          // retreat if can be killed
          opponentData['can-be-killed'] = true;
          opponentData.strats.retreat += 25;
        }
        opponentCard.data('ai', opponentData);
      }
    });
    // tower limit
    card.around(game.data.ui.melee, function (neighbor) {
      if (neighbor.hasClass(opponent+'area')) {
        cardData['at-tower-limit'] = true;
        cardData.strats.alert += 10;
      }
    });
    // tower area
    var spot = card.getSpot();
    if (spot.hasClass(opponent+'area')) {
      cardData['in-tower-attack-range'] = true;
      if (game.player.tower.data('current hp') > 3) cardData.strats.retreat += 10;
    }
    // move strats
    if (side == game.ai.side) {
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
      // todo: speed bonus
      // advance
      if (bot && bot.hasClass('free')) {
        cardData = game.ai.spotData(bot, card, cardData, side, 'advance', 6);
      }
      if (left && left.hasClass('free')) {
        cardData['can-dodge'] = true;
        cardData = game.ai.spotData(left, card, cardData, side, 'advance', 2, true);
      }
      if (bl && bl.hasClass('free') && (bot.hasClass('free') || left.hasClass('free'))) {
        cardData['can-dodge'] = true;
        cardData = game.ai.spotData(bl, card, cardData, side, 'advance', 8, true);
      }
      if (br && br.hasClass('free') && (bot.hasClass('free') || right.hasClass('free'))) {
        cardData['can-dodge'] = true;
        cardData = game.ai.spotData(br, card, cardData, side, 'advance', 4, true);
      }
      // retreat
      if (top && top.hasClass('free')) {
        cardData = game.ai.spotData(top, card, cardData, side, 'retreat', 6);
      }
      if (right && right.hasClass('free') && cardData['can-retreat']) {
        cardData['can-dodge'] = true;
        cardData = game.ai.spotData(right, card, cardData, side, 'retreat', 4, true);
      }
      if (tr && tr.hasClass('free') && (top.hasClass('free') || right.hasClass('free'))) {
        cardData['can-dodge'] = true;
        cardData = game.ai.spotData(tr, card, cardData, side, 'retreat', 8, true);
      }
      if (tl && tl.hasClass('free') && (top.hasClass('free') || left.hasClass('free'))) {
        cardData['can-dodge'] = true;
        cardData = game.ai.spotData(tl, card, cardData, side, 'retreat', 2, true);
      }
    }
    card.data('ai', cardData);
    //console.log(cardData);
  },
  spotData: function (spot, card, cardData, side, destiny, priority, dodge) {
    var spotData = spot.data('ai');
    priority += spotData.priority;
    spot.data('ai', spotData);
    if (spot.hasClass(side+'area')) priority += 10;
    var opponent = game.opponent(side);
    if (spot.hasClass(opponent+'area')) {
      if (game.player.tower.data('current hp') > 3) priority -= 15;
      else priority += 10;
    }
    var o = {
      target: spot,
      priority: priority
    };
    if (card.canMove()) {
      if (destiny == 'advance') cardData.strats.siege += (priority/2);
      if (destiny == 'retreat') cardData.strats.alert += (priority/2);
      if (dodge) cardData.strats.dodge += (priority/2);
      cardData['can-'+destiny] = true;
    }
    cardData.move.push(o);
    cardData[destiny].push(o);
    if (dodge) cardData.dodge.push(o);
    return cardData;
  },
  /*comboData: function () {
    var combos = [];
    $('.map .enemy.card:not(.towers)').each(function (i, el) {
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
    });
  },*/
  chooseStrat: function (card, cardData) {
    // console.log(card);
    if (game.player.tower.data('current hp') < 3) {
      return {strat: 'siege'};
    }
    var strats = [];
    $(game.ai.strats).each(function (i, strat) {
      strats.push({strat: strat, priority: cardData.strats[strat]});
    });
    return game.ai.choose(strats);
  },
  decideCast: function (card, cardData) {
    //console.log(cardData['cast-strats'])
    if (cardData['cast-strats'].length) {
      var cast = game.ai.choose(cardData['cast-strats']);
      //console.log('cast-skill', cast);
      if (cast && cast.skill && cast.target && cast.card) {
        game.ai.parseMove(card, cardData, 'cast', cast.target, cast);
        cardData['cast-strats'].erase(cast);
        return true;
      }
    }
  },
  strats: [
    'siege',
    'attack',
    'flank',
    'dodge',
    'alert',
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
      }
    }
    if (strat == 'attack') {
      if (cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-advance']) {
        action = 'advance';
      }
    }
    if (strat == 'flank') {
      if (cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-advance'] && !cardData['at-tower-limit']) {
        action = 'advance';
      } else if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'dodge') {
      if (cardData['can-dodge']) {
        action =  'dodge';
      }
    }
    if (strat == 'alert') {
      if (cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'retreat') {
      if (cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    // decide final action
    if (!action) {
      if (cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-move']) {
        action = 'move';
      } else action = false;
    }
    //console.log('action:', action); 
    if (action) {
      if (action == 'move' || action == 'advance' || action == 'retreat' || action == 'dodge') {
        target = game.ai.chooseDestiny(card, cardData, action);
        //if (target) console.log(card[0], target.target[0], target.priority);
        action = 'move';
      }
      if (action == 'attack'){
        if (!target) target = game.ai.chooseTarget(cardData['attack-targets']);
      }
      //console.log('target', target);
      if (action && target && target.target) {
        game.ai.parseMove(card, cardData, action, target.target);
      }
    }
  },
  chooseDestiny: function (card, cardData, action) {
    if (card.canMove()) {
      // filter move, dodge, advance and retreat spots
      if (action && cardData[action]) destinys = cardData[action];
      //console.log(action, destinys);
      if (destinys.length) {
        return game.ai.choose(destinys);
      }
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
        var choosen = game.ai.choose(targets);
        if (choosen && choosen.target && choosen.target.data('current hp') > 0) return choosen;
      }
    }
  },
  choose: function (itens, invert) {
    var chosen, parameter = 'priority';
    if (itens.length) {
      if (itens.length == 1) chosen = itens[0];
      else {
        itens.sort(function (a, b) {
          if (invert) return a[parameter] - b[parameter];
          else return b[parameter] - a[parameter];
        });
        chosen = itens.smartRandom(game.ai.level*Math.PI);
      }
    }
    //console.log(itens, chosen)
    if (chosen[parameter] > 0) return chosen;
    //else console.log(chosen)
  },
  parseMove: function (card, cardData, action, target, cast) {
    //console.log(action, target);
    var move = [];
    if (action == 'move' || action == 'advance' || action == 'retreat') {
      move[0] = 'M';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.attr('id'));
      card.data('ai done', true);
      cardData['can-move'] = false;
    }
    if (action == 'attack') {
      move[0] = 'A';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.getSpot().attr('id'));
      card.data('ai done', true);
      cardData['can-attack'] = false;
    }
    if (action == 'cast') {
      if (cast.card.data('type') == game.data.ui.toggle) {
        move[0] = 'T';
        move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
        move[2] = cast.skill;
        move[3] = card.data('hero');
      } else {
        move[0] = 'C';
        move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
        move[2] = game.map.mirrorPosition(target.attr('id') || target.getSpot().attr('id'));
        move[3] = cast.skill;
        move[4] = card.data('hero');
      }
    }
    //console.log(move);
    game.currentData.moves.push(move.join(':'));
    card.data('ai', cardData);
  },
  checkAttack: function (card) { 
    //check instant attack buffs
    game.ai.buildData(card);
    var cardData = card.data('ai');
    if (cardData['can-attack']) {
      var target = game.ai.chooseTarget(cardData['attack-targets']);
      if (target && target.target) {
        //console.log(card,target.target)
        game.currentData.moves.push('A:'+
          game.map.mirrorPosition(card.getSpot().attr('id'))+':'+
          game.map.mirrorPosition(target.target.getSpot().attr('id')));
      }
    }
  },
  summon: function (card) {
    var creep = card.data('unit');
    var enemyarea = $('.spot.free.enemyarea');
    var spots = [];
    enemyarea.each(function () {
      var spot =  $(this);
      var spotData = spot.data('ai');
      var y = spot.getY();
      if (!spotData.blocked) spots.push({
        target: spot,
        priority: spotData.priority + spotData.unitPriority + (15 * y),
        data: spotData
      });
    });
    //console.log(spots)
    if (spots.length) {
      var spot = game.ai.choose(spots);
      if (spot) {
        var to = spot.target.getPosition();
        game.currentData.moves.push('S:'+ game.map.mirrorPosition(to) +':' + creep);
        spot.data.blocked = true;
        spot.target.data('ai', spot.data);
      }
    }
  },
  skillsDiscard: function (card) {
    // discard counter
    var n = card.data('ai discard');
    if (n === undefined) {
      n = 5;
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

