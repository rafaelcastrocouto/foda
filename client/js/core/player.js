game.player = {
  points: 0,
  money: 0,
  placeHeroes: function(cb) {
    game.player.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function(deck) {
        deck.addClass('cemitery player').appendTo(game.states.table.player).hide();
        if (game.mode == 'library') {
          var card = deck.data('cards')[0];
          card.addClass('player').on('mousedown touchstart', game.card.select);
          card.place(game.map.toPosition(5, 4));
        } else {
          var x = 4;
          var y = 6;
          $.each(deck.data('cards'), function(i, card) {
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
    var skillid = skill.data('skill');
    var to = target.getPosition();
    if (skill.canPlay() && hero && skillid && !skill.hasClass('casted')) {
      skill.addClass('casted');
      skill.passive(target);
      var move = 'P:' + to + ':' + skillid + ':' + hero;
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
    var skillid = skill.data('skill');
    var to = target.getPosition();
    if (skill.canPlay() && hero && skillid) {
      skill.toggle(target);
      var move = 'T:' + to + ':' + skillid + ':' + hero;
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
    var skillid = skill.data('skill');
    var sec = (skill.data('cast select') && !skill.data('source'));
    if (skill.hasClass('items')) {
      hero = skill.data('itemtype');
      skillid = skill.data('item');
    }
    if (skill.canPlay() && hero && skillid && from && to && !skill.hasClass('casted')) {
      if (!sec) {
        skill.addClass('casted');
        game.lockHighlight = true;
      }
      source.cast(skill, to);
      if (skill.data('type') == game.data.ui.summon) {
        target.removeClass('draggable');
      }
      if (!sec) {
        var move = 'C:' + from + ':' + to + ':' + skillid + ':' + hero;
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
    var creep = card.data('id');
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
    var skillid = skill.data('skill');
    if (skill.hasClass('items')) {
      hero = skill.data('itemtype');
      skillid = skill.data('item');
    }
    var move = 'D:' + skillid + ':' + hero;
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
