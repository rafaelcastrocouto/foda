game.player = {
  points: 0,
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
          card.on('action', game.library.action).on('death', game.library.action);
        } else {
          var x = 4;
          var y = 6;
          $.each(deck.data('cards'), function(i, card) {
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player').on('mousedown touchstart', game.card.select);
            card.place(game.map.toPosition(x + p, y));
            if (game.mode == 'online')
              card.on('action', game.online.action);
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
    if (card.canPlay() && spot.hasClass('free') && from !== to && !card.hasClass('done')) {
      card.removeClass('draggable').addClass('done');
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
    if (source.canPlay() && source.data('damage') && from !== to && target.data('current hp')) {
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
    if (skill.canPlay() && hero && skillid) {
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
    var source = $('.map .source');
    if (!source.length) source = target;
    var from = source.getPosition();
    var to = target.getPosition();
    var hero = skill.data('hero');
    var skillid = skill.data('skill');
    if (skill.canPlay() && hero && skillid && from && to && !skill.data('casted')) {
      source.cast(skill, to);
      skill.data('casted', true);
      if (skill.data('type') == game.data.ui.summon) {
        target.addClass('done').removeClass('draggable');
      }
      var move = 'C:' + from + ':' + to + ':' + skillid + ':' + hero;
      game.history.saveMove(move);
      if (game.mode == 'online')
        game.currentMoves.push(move);
      game.skill.animateCast(skill, to, event);
    }
  },
  stopChanneling: function(card) {
    var to = card.getPosition();
    var move = 'G:' + to;
    game.history.saveMove(move);
    if (game.mode == 'online') {
      game.currentMoves.push(move);
    }
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
    var move = 'D:' + skillid + ':' + hero;
    game.history.saveMove(move);
    if (game.mode == 'online') 
      game.currentMoves.push(move);
    game.states.table.discard.attr('disabled', true);
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
