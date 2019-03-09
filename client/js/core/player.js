game.player = {
  startX: 4,
  startY: 6,
  points: 0,
  money: 0,
  placeHeroes: function(cb) {
    game.player.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function(deck) {
        var x, y, spawn;
        var cards = JSON.parse(deck.data('cards'));
        deck.addClass('cemitery player').appendTo(game.states.table.player).hide();
        if (game.mode == 'library') {
          var card = $('#'+cards[0]);
          card.addClass('player').on('mousedown touchstart', game.card.select);
          x = parseInt(game.states.config[game.size].width / 2);
          y = parseInt(game.states.config[game.size].height / 2);
          card.place(game.map.toPosition(x, y));
        } else {
          x = game.player.startX;
          y = game.height - 1;
          $.each(cards, function(i, cardId) {
            var card = $('#'+cardId);
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player').on('mousedown touchstart', game.card.select);
            card.place(game.map.toPosition(x + p, y));
            if (game.mode == 'tutorial')
              card.on('select', game.tutorial.selected);
          });
        }
        if (cb) cb();
      }
    });
  },
  move: function(event) {
    var spot = $(this);
    var card = game.selectedCard;
    var from = card.getPosition();
    var to = spot.getPosition();
    if (card.canPlay() && spot.hasClass('free') && from !== to && card.hasClass('can-move')) {
      card.removeClass('draggable').removeClass('can-move');
      card.move(to);
      var move = 'M:' + from + ':' + to;
      game.history.saveMove(move);
      if (game.mode == 'online')
        game.currentMoves.push(move);
    }
  },
  attack: function(event) {
    var target = $(this);
    var source = game.selectedCard;
    var from = source.getPosition();
    var to = target.getPosition();
    if (source.canPlay() && source.data('damage') && from !== to && (target.data('current hp') || target.hasClass('trees'))) {
      source.attack(target);
      var move = 'A:' + from + ':' + to;
      game.history.saveMove(move);
      if (game.mode == 'online')
        game.currentMoves.push(move);
    }
  },
  passive: function(event) {
    var target = $(this);
    var skill = game.selectedCard;
    var hero = skill.data('hero');
    var label = skill.data('label');
    var to = target.getPosition();
    if (skill.canPlay() && hero && label && !skill.hasClass('casted')) {
      skill.addClass('casted');
      skill.passive(target);
      var move = 'P:' + to + ':' + hero + ':' + label;
      game.history.saveMove(move);
      if (game.mode == 'online')
        game.currentMoves.push(move);
      game.skill.animateCast(skill, target, event);
    }
  },
  toggle: function(event) {
    var target = $(this);
    var skill = game.selectedCard;
    var hero = skill.data('hero');
    var label = skill.data('label');
    var to = target.getPosition();
    if (skill.canPlay() && hero && label) {
      skill.toggle(target);
      var move = 'T:' + to + ':' + hero + ':' + label;
      game.history.saveMove(move);
      if (game.mode == 'online')
        game.currentMoves.push(move);
      game.skill.animateCast(skill, target, event);
    }
  },
  cast: function(event) {
    var target = $(this);
    var skill = game.selectedCard;
    var side = skill.side();
    var source = $('.map .source');
    if (!source.length) source = target;
    if (skill.hasClass('items')) source = game[side].tower;
    var from = source.getPosition();
    var to = target.getPosition();
    var hero = skill.data('hero');
    var label = skill.data('label');
    var sec = skill.data('secondary targets');
    if (skill.hasClass('items')) {
      hero = skill.data('itemtype');
      label = skill.data('item');
    }
    if (skill.canPlay() && hero && label && from && to && !skill.hasClass('casted')) {
      if (!sec) {
        skill.addClass('casted');
        game.lockHighlight = true;
      }
      source.cast(skill, to);
      if (skill.data('type') == game.data.ui.summon) {
        target.removeClass('draggable');
      }
      if (!sec) {
        var move = 'C:' + from + ':' + to + ':' + hero + ':' + label;
        game.history.saveMove(move);
        if (game.mode == 'online')
          game.currentMoves.push(move);
        game.skill.animateCast(skill, to, event);
      }
    }
  },
  stopChanneling: function(card) {
    var to = card.getPosition();
    var move = 'G:' + to;
    game.history.saveMove(move);
    if (game.mode == 'online') {
      game.currentMoves.push(move);
    }
    card.stopChanneling();
  },
  summonCreep: function(event) {
    var target = $(this);
    var to = target.getPosition();
    var card = game.selectedCard;
    var creep = card.data('label');
    var move = 'S:' + to + ':' + creep;
    if (card.canPlay()) {
      game.history.saveMove(move);
      if (game.mode == 'online')
        game.currentMoves.push(move);
      game.units.summonCreep(target, to, creep, event);
    }
  },
  discard: function(skill) {
    var hero = skill.data('hero');
    var label = skill.data('label');
    if (skill.hasClass('items')) {
      hero = skill.data('itemtype');
      label = skill.data('item');
    }
    var move = 'D:' + hero + ':' + label;
    game.history.saveMove(move);
    if (game.mode == 'online') 
      game.currentMoves.push(move);
    game.skill.disableDiscard();
    skill.addClass('slidedown');
    game.timeout(200, function() {
      this.removeClass('slidedown');
      this.discard();
    }.bind(skill));
  },
  cardsInHand: function() {
    return game.player.skills.hand.children().length;
  }
};
