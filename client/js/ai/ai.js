game.ai = {
  timeToPlay: 40,
  side: 'enemy',
  start: function () {
    if (!game.currentData) game.currentData = {};
    game.ai.moves = [];
    if (game.ai.mode == 'very-easy') game.ai.level = 5;
    if (game.ai.mode == 'easy')      game.ai.level = 6;
    if (game.ai.mode == 'normal')    game.ai.level = 7;
    if (game.ai.mode == 'hard')      game.ai.level = 8;
    if (game.ai.mode == 'very-hard') game.ai.level = 9;
    if (game.debug) game.ai.level = 9;
    game.ai.timeToPlay = (5 * game.ai.level);
  },
  turnStart: function () { //console.log('ai start turn')
    game.ai.currentmovesLoop = game.ai.level*4;
    $('.ai-max').removeClass('ai-max');
    game.ai.resetData();
    // add combo data and strats
    //game.ai.comboData();
    // activate all passives, other sidehand skills strats per hero
    $('.'+game.ai.side+'decks .sidehand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.passives(card);
    });
    game.ai.autoMove(game.ai.moveRandomCard);
  },
  moveRandomCard: function () {
    game.ai.resetData();
    // choose random card
    var availableCards = $('.map .'+game.ai.side+'.card:not(.towers, .dead, .ai-max, .stunned, .disabled, .channeling, .ghost)');
    var chosenCard = availableCards.randomCard();
    if (chosenCard.length) {
      var count = chosenCard.data('ai count');
      var chosenCardData = JSON.parse(chosenCard.data('ai'));
      if ((!count || count < game.ai.level/2)) {
        chosenCard.data('ai count', (chosenCard.data('ai count') + 1 || 0));
        if (chosenCard.data('ai count') >= game.ai.level/2) chosenCard.addClass('ai-max');
        // add defensive data and strats
        $('.map .'+game.opponent(game.ai.side)+'.card:not(.towers, .dead, .stunned, .disabled, .channeling, .ghost)').each(function (i, el) {
          var card = $(el);
          game.ai.buildData(card);
          if (card.hasClass('heroes')) {
            var hero = card.data('hero');
            if (game.heroesAI[hero] && game.heroesAI[hero].defend) {
              var cardData = JSON.parse(card.data('ai'));
              // add per hero defend data
              game.heroesAI[hero].defend(card, cardData);
            }
          }
        });
        // add attack and move data
        $('.map .'+game.ai.side+'.card:not(.towers, .dead, .ghost)').each(function (i, el) {
          var card = $(el);
          game.ai.buildData(card);
          if (card.hasClass('heroes')) {
            var hero = card.data('hero');
            var cardData = JSON.parse(card.data('ai'));
            if (game.heroesAI[hero] && cardData.strats[game.heroesAI[hero].move.default]) {
              cardData.strats[game.heroesAI[hero].move.default] += 10;
              card.data('ai', JSON.stringify(cardData));
            }
            if (game.heroesAI[hero] && game.heroesAI[hero].play) {
              // add per hero cast data
              game.heroesAI[hero].play(card, cardData);
            }
          }
        });
        if (game.debug) {
          $('.map .spot').each(function (i, el) {
            var spot = $(el);
            if (spot.data('ai')) $('.debug', spot).text(JSON.parse(spot.data('ai')).priority);
          });
        }
        // cast strats
        chosenCardData = JSON.parse(chosenCard.data('ai'));
        if (!chosenCard.data('ai done')) {
          var choosen = game.ai.chooseStrat(chosenCard, chosenCardData);
          // action strats
          if (choosen) game.ai.decideAction(choosen.strat, chosenCard, chosenCardData);
        }
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
    $('.'+game.ai.side+'decks .sidehand .units').each(function (i, el) {
      var card = $(el);
      if (Math.random()*20 > game.ai.level) game.ai.summon(card);
    });
    // discard after N turns
    $('.'+game.ai.side+'decks .hand .skills').each(function (i, el) {
      var card = $(el);
      game.ai.skillsDiscard(card);
    });
    //console.log(game.ai.moves)
    game.ai.autoMove(game.ai.endTurn);
  },
  endTurn: function () {
    $('.enemyMoveHighlight').removeClass('enemyMoveHighlight');
    $('.enemyMoveHighlightTarget').removeClass('enemyMoveHighlightTarget');
    $('.card').data('ai count', 0);
    $('.source').removeClass('source');
    if (game.ai.end) game.ai.end();
    else if (game.mode && game[game.mode] && game[game.mode]['end'+game.ai.side.capitalize()]) {
      game[game.mode]['end'+game.ai.side.capitalize()]();
    }
  },
  autoMove: function (cb) {
    if (game.turn.counter > 1) {
      if (game.ai.moves.length) {
        game.enemy.autoMove(game.ai.moves, cb);
      } else cb();
    } else game.ai.endTurn();
  },
  passives: function (card) {
    // activate all pasives
    if (card.data('type') == game.data.ui.passive) {
      var label = card.data('label');
      var hero = card.data('hero');
      var source = $('.map .card.'+game.ai.side+'.heroes.'+hero+':not(.dead, .ghost)');
      if (source.length) {
        var spot = source.getPosition();
        if (spot && label && hero) game.ai.moves.push('P:'+game.map.mirrorPosition(spot)+':'+hero+':'+label);
      }
    }
  },
  resetData: function () { 
    //console.log('reset ai')
    // todo: ai.history
    game.ai.moves = [];
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
    return JSON.stringify(d);
  },
  buildData: function (card) {
    //console.log('buildData', card[0], card.data('ai'));
    var side = card.side();
    var opponent = card.opponent();
    var cardData = JSON.parse(card.data('ai'));
    var range = card.data('range');
    // retreat when hp is low
    if (card.data('current hp') < card.data('hp')/3) {
      cardData.strats.retreat += 20;
    }
    if (card.canMove()) {
      cardData['can-move'] = true;
    }
    card.around(range, function (spot) {
      if (side != game.ai.side) {
        var spotData = JSON.parse(spot.data('ai'));
        spotData.priority -= (card.data('current damage'));
        spotData['can-be-attacked'] = true;
        spot.data('ai', JSON.stringify(spotData));
      }
      var opponentCard = $('.card.'+opponent+':not(.invisible, .dead, .ghost)', spot);
      if (opponentCard.length) {
        //there is one opponent in range 
        if (card.canAttack()) {
          cardData['can-attack'] = true;
          cardData.strats.attack += 10;
          // attack target
          cardData['attack-targets'].push({
            priority: 50 - (opponentCard.data('current armor')*2) - (opponentCard.data('current hp')/2) + (opponentCard.data('ai priority bonus') || 0),
            target: opponentCard.attr('id')
          });
          // attack towers
          if ( opponentCard.hasClass('towers')) {
            cardData.strats.attack += 30;
            cardData['can-attack-tower'] = true;
          }
        }
        // retreat if in opponents range
        var opponentData = JSON.parse(opponentCard.data('ai'));
        opponentData['can-be-attacked'] = true;
        opponentData.strats.retreat += 15;
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
        opponentCard.data('ai', JSON.stringify(opponentData));
      }
    });
    // tower limit
    card.around(game.data.ui.melee, function (spot) {
      if (spot.hasClass(opponent+'area')) {
        cardData['at-tower-limit'] = true;
        if (cardData.strats) cardData.strats.alert += 10;
      }
    });
    // tower area
    var spot = card.getSpot();
    if (spot.hasClass(opponent+'area')) {
      cardData['in-tower-attack-range'] = true;
      if (game[game.opponent(game.ai.side)].tower.data('current hp') > 3) {
        if (cardData.strats) cardData.strats.retreat += 10;
      }
    }
    // move strats
    if (side == game.ai.side) {
      card.inMovementRange(card.data('current speed'), function (spot) {
        var dir = card.getDirectionObj(spot);
        var destiny = 'retreat';
        if (game.ai.side == 'enemy') {
         if ((dir.x ===  0 && dir.y === 1) || //bot
             (dir.x === -1 && dir.y === 0) || //left
             (dir.x === -1 && dir.y === 1) || //botleft
             (dir.x ===  1 && dir.y === 1) ) {//botright
            destiny = 'advance';
          }
        }
        if (game.ai.side == 'player') {
         if ((dir.x ===  0 && dir.y === -1) || //top
             (dir.x ===  1 && dir.y ===  0) || //right
             (dir.x === -1 && dir.y === -1) || //topleft
             (dir.x ===  1 && dir.y === -1) ) {//topright
            destiny = 'advance';
          }
        }
        var dodge = false;
        if (dir.x !== 0) dodge = true;
        game.ai.spotData(spot, card, cardData, side, destiny, dodge);
      });
    }
    card.data('ai', JSON.stringify(cardData));
    //console.log(cardData);
  },
  newSpotData: function (spot) {
    var priority = 40;
    var opponent = game.opponent(game.ai.side);
    var x = spot.getX(), y = spot.getY();
    if (game.ai.side == 'enemy') {
      priority += (game.width - x) * 4;
      priority += y * 6;
    }
    if (game.ai.side == 'player') {
      priority += x * 4;
      priority += (game.height - y) * 6;
    }
    if (spot.hasClass('jungle')) priority += 30;
    if (spot.hasClass('fountain')) priority += 10;
    if (spot.hasClass(game.ai.side+'area')) priority += 10;
    if (spot.hasClass(opponent+'area')) {
      var hp = game[opponent].tower.data('current hp');
      if (hp > 8) priority -= 40;
      if (hp < 6) priority += 30;
    }
    if ( (x == 0) || game.width == (x+1) ||
         (y == 0) || game.height == (y+1)) { 
      priority -= 40;
    }
    var data = {
      'blocked': !spot.hasClass('free'),
      'priority': priority,
      'can-be-attacked': false,
      'can-be-casted': false
    };
    return JSON.stringify(data);
  },
  spotData: function (spot, card, cardData, side, destiny, dodge) {
    if (spot && card && cardData) {
      var spotData = JSON.parse(spot.data('ai'));
      var priority = spotData.priority;
      var o = {
        target: spot.attr('id'),
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
      card.data('ai', JSON.stringify(cardData));
    }
  },
  /*comboData: function () {
    var combos = [];
    $('.map .'+game.ai.side+'.card:not(.towers)').each(function (i, el) {
      var card = $(el);
      var cardData = JSON.parse(card.data('ai'));
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
    if (game[game.opponent(game.ai.side)].tower.data('current hp') < 3) {
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
        return cast;
      }
    }
  },
  strats: [
    'siege',
    'attack',
    'cast',
    'flank',
    'dodge',
    'alert',
    'stand',
    'retreat'
  ],
  decideAction: function (strat, card, cardData) {
    var action,
        target,
        cast;
    //console.log('strat', strat, card, cardData);
    if (strat == 'siege') {
      if (cardData['can-attack-tower']) {
        action = 'attack'; 
        target = {
          target: $('.map .towers.'+game.ai.side).attr('id'),
          priority: 100
        };
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
    if (strat == 'alert') {
      if (cardData['can-attack']) {
        action = 'attack';
      } else if (cardData['can-be-attacked'] && cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'dodge') {
      if (cardData['can-dodge']) {
        action =  'dodge';
      }
    }
    if (strat == 'retreat') {
      if (cardData['can-retreat']) {
        action = 'retreat';
      }
    }
    if (strat == 'cast') {
      if (cardData['can-cast']) {
        action = 'cast';
      } else action = 'stand';
    }
    if (strat == 'stand') {
      if (cardData['can-attack']) {
        action = 'attack';
      } else action = 'stand';
    }
    // decide final action
    if (!action) {
      if (cardData['can-cast'] && cardData['cast-strats'].length > 0) {
        action = 'cast';
      } else if (cardData['can-attack'] && cardData['attack-targets'].length > 0) {
        action = 'attack';
      } else if (cardData['can-move']) {
        action = 'move';
      } else action = false;
    }
    //console.log('action:', action, card[0]); 
    if (action) {
      if (action == 'move' || action == 'advance' || action == 'retreat' || action == 'dodge') {
        target = game.ai.chooseDestiny(card, cardData, action);
        //if (target) console.log(card[0], target.target[0], target.priority);
        action = 'move';
      }
      if (action == 'attack'){
        if (!target) target = game.ai.chooseTarget(cardData['attack-targets']);
      }
      if (action == 'cast'){
        cast = game.ai.decideCast(card, cardData);
        target = cast;
      }
      //console.log('target', target);
      if (action && target && target.target) {
        game.ai.parseMove(card, cardData, action, target.target, cast);
      }
      if (action == 'cast' && cast) {
        game.ai.eraseSkill(cardData, cast);
      }
      card.data('ai', JSON.stringify(cardData));
    }
  },
  eraseSkill: function (cardData, cast) {
    var strats = cardData['cast-strats'];
    //cardData['cast-strats'].erase(cast);
    //console.log(strats)
    for (var i=0; i<strats.length; i++) {
      var strat = strats[i];
      if (strat.skill == cast.skill) strats.erase(strat);
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
        if ($('#'+t.target).hasClass('towers')) towers = t;
      });
      if (towers) return towers;
      else {
        var choosen = game.ai.choose(targets);
        if (choosen && choosen.target && $('#'+choosen.target).data('current hp') > 0) 
          return choosen;
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
    //console.log(action, target)
    var move = [];
    var position = $(card).getPosition();
    if (action == 'move' || action == 'advance' || action == 'retreat') {
      move[0] = 'M';
      move[1] = game.map.mirrorPosition(position);
      move[2] = game.map.mirrorPosition(target);
      card.data('ai done', true);
      cardData['can-move'] = false;
    }
    if (action == 'attack') {
      target = $('#'+target);
      move[0] = 'A';
      move[1] = game.map.mirrorPosition(position);
      move[2] = game.map.mirrorPosition(target);
      card.data('ai done', true);
      cardData['can-attack'] = false;
    }
    if (action == 'cast') {
      target = $('#'+target);
      if ($('#'+cast.card).data('type') == game.data.ui.toggle) {
        move[0] = 'T';
        move[1] = game.map.mirrorPosition(position);
        move[2] = card.data('hero');
        move[3] = cast.skill;
      } else {
        move[0] = 'C';
        move[1] = game.map.mirrorPosition(position);
        move[2] = game.map.mirrorPosition(target);
        move[3] = card.data('hero');
        move[4] = cast.skill;
      }
    }
    //console.log(move);
    game.ai.moves.push(move.join(':'));
    card.data('ai', JSON.stringify(cardData));
  },
  checkAttack: function (card) { 
    //check instant attack buffs
    game.ai.buildData(card);
    var cardData = JSON.parse(card.data('ai'));
    if (cardData['can-attack']) {
      var target = game.ai.chooseTarget(cardData['attack-targets']);
      if (target && target.target) {
        //console.log(card,target.target)
        game.ai.moves.push('A:'+
          game.map.mirrorPosition(card.getPosition())+':'+
          game.map.mirrorPosition($('#'+target.target).getPosition()));
      }
    }
  },
  summon: function (card) {
    var creep = card.data('label');
    var area = $('.spot.free.'+game.ai.side+'area');
    var spots = [];
    area.each(function () {
      var spot =  $(this);
      var spotData = JSON.parse(spot.data('ai'));
      if (!spotData.blocked) spots.push({
        target: spot,
        priority: spotData.priority,
        data: spotData
      });
    });
    //console.log(spots)
    if (spots.length) {
      var spot = game.ai.choose(spots); 
      if (spot) {
        var to = spot.target.attr('id');
        game.ai.moves.push('S:'+ game.map.mirrorPosition(to) +':' + creep);
        //console.log(spot)
        spot.data.blocked = true;
        spot.target.data('ai', JSON.stringify(spot.data));
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
      var skill = card.data('label');
      var hero = card.data('hero');
      game.ai.moves.push('D:'+skill+':'+hero);
      n = undefined;
    }
    card.data('ai discard', n);
  }
};

