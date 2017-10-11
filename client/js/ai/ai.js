game.ai = {
  start: function () {
    game.currentData.moves = [];
    if (game.ai.mode == 'very-easy') game.ai.level = 4;
    if (game.ai.mode == 'easy')      game.ai.level = 5;
    if (game.ai.mode == 'normal')    game.ai.level = 7;
    if (game.ai.mode == 'hard')      game.ai.level = 8;
    if (game.ai.mode == 'very-hard') game.ai.level = 9;
  },
  turnStart: function () {
    // remember ai is playing the enemy cards
    game.message.text(game.data.ui.enemymove);
    game.ai.currentmovesLoop = game.ai.level*2;
    game.currentData.moves = [];
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
    if (game.ai.currentmovesLoop > 0 && game.turn.counter > 1) {
      game.ai.currentmovesLoop -= 1;
      game.ai.moveRandomCard();
    } else {
      game.ai.endTurn();
    }
  },
  endTurn: function () {
    //console.log('ai end turn')
    game.ai.resetData();
    $('.enemyMoveHighlight').removeClass('enemyMoveHighlight');
    $('.enemyMoveHighlightTarget').removeClass('enemyMoveHighlightTarget');
    $('.card').data('ai count', 0);
    $('.source').removeClass('source');
    $('.ai-max').removeClass('ai-max');
    //check attack
    $('.map .card:not(.towers, .dead, .stunned, .disabled, .channeling, .ghost)').each(function (i, el) {
      var card = $(el);
      if (card.side() == 'enemy' && !card.hasClass('channeling')) game.ai.checkAttack(card);
      card.data('ai done', false);//.removeClass('ai');
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
    game.ai.autoMove(game.single.endEnemyTurn);
  },
  autoMove: function (cb) {
    if (game.currentData.moves.length) {
      game.enemy.moveEndCallback = cb;
      game.currentMoves = game.currentData.moves;
      //console.log(game.currentMoves);
      game.enemy.autoMoveCount = 0;
      game.enemy.autoMove();
    } else cb();
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
      $(el).data('ai', game.ai.newData());
    });
    $('.map .spot').each(function (i, el) {
      $(el).data('ai', game.ai.newSpotData());
    });
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
    };
    $(game.ai.strats).each(function (i, strat) {
      d.strats[strat] = 1;
    });
    return d;
  },
  newSpotData: function () {
    var d = {
      'priority': 0,
      'can-be-attacked': false,
      'can-be-casted': false
    };
    return d;
  },
  buildData: function (card) {
    // console.log('buildData', card[0], card.data('ai'));
    var side = card.side();
    var opponent = card.opponent();
    var cardData = card.data('ai');
    var range = card.data('range');
    // retreat when hp is low
    if (card.data('current hp') < card.data('hp')/3) {
      cardData.strats.retreat += 20;
    }
    card.inRange(range, function (spot) {
      if (card.canAttack()) { 
        if (side == 'player') {
          var spotData = spot.data('ai');
          spotData.priority -= (card.data('current damage')) * 5;
          spotData['can-be-attacked'] = true;
          spot.data('ai', spotData);
        }
        var opponentCard = $('.card.'+opponent+':not(.invisible, .dead, .ghost)', spot);
        if (opponentCard.length) {
          //there is one opponent in range 
          cardData['can-attack'] = true;
          cardData['can-make-action'] = true;
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
        cardData = game.ai.spotData(cardData, bot, side, 'advance', 6);
      }
      if (left && left.hasClass('free')) {
        cardData = game.ai.spotData(cardData, left, side, 'advance', 2);
      }
      if (bl && bl.hasClass('free') && (bot.hasClass('free') || left.hasClass('free'))) {
        cardData = game.ai.spotData(cardData, bl, side, 'advance', 8);
      }
      if (br && br.hasClass('free') && (bot.hasClass('free') || right.hasClass('free'))) {
        cardData = game.ai.spotData(cardData, br, side, 'advance', 4);
      }
      // retreat
      if (top && top.hasClass('free')) {
        cardData = game.ai.spotData(cardData, top, side, 'retreat', 6);
      }
      if (right && right.hasClass('free') && cardData['can-retreat']) {
        cardData = game.ai.spotData(cardData, right, side, 'retreat', 2);
      }
      if (tr && tr.hasClass('free') && (top.hasClass('free') || right.hasClass('free'))) {
        cardData = game.ai.spotData(cardData, tr, side, 'retreat', 8);
      }
      if (tl && tl.hasClass('free') && (top.hasClass('free') || left.hasClass('free'))) {
        cardData = game.ai.spotData(cardData, tl, side, 'retreat', 4);
      }
    }
    card.data('ai', cardData);
    //console.log(cardData);
  },
  spotData: function (cardData, spot, side, destiny, priority) {
    var spotData = spot.data('ai');
    priority += spotData.priority;
    cardData['can-move'] = true;
    cardData.strats.move += 2;
    if (spot.hasClass(side+'area')) priority += 10;
    var opponent = game.opponent(side);
    if (spot.hasClass(opponent+'area')) {
      if (game.player.tower.data('current hp') > 3) priority -= 15;
      else priority += 10;
    }
    if (destiny == 'advance') cardData.strats.offensive += (priority/2);
    if (destiny == 'retreat') cardData.strats.defensive += (priority/2);
    cardData['can-'+destiny] = true;
    var o = {
      target: spot,
      priority: priority
    };
    cardData.destinys.push(o);
    if (!cardData[destiny]) cardData[destiny] = [];
    cardData[destiny].push(o);
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
    if (game.player.tower.data('current hp') == 1) {
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
      if (cast && cast.skill && cast.target) {
        game.ai.parseMove(card, cardData, 'cast', cast.target, cast.skill);
        cardData['cast-strats'].erase(cast);
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
    // decide final action
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
      if (action && target && target.target) {
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
      return game.ai.choose(destinys);
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
    if (chosen[parameter] > game.ai.level) return chosen;
  },
  parseMove: function (card, cardData, action, target, skillId) {
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
      move[0] = 'C';
      move[1] = game.map.mirrorPosition(card.getSpot().attr('id'));
      move[2] = game.map.mirrorPosition(target.attr('id') || target.getSpot().attr('id'));
      move[3] = skillId; //
      move[4] = card.data('hero');
    }
    //console.log(move);
    game.currentData.moves.push(move.join(':'));
    card.data('ai', cardData);
  },
  checkAttack: function (card) { 
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
    var creep = card.data('type');
    var enemyarea = $('.spot.free.enemyarea');
    var spots = [];
    enemyarea.each(function () {
      var spot =  $(this);
      var spotData = spot.data('ai');
      if (!spotData.blocked) spots.push({
        target: spot,
        priority: spotData.priority + 10,
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

