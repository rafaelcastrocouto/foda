game.events = {
  build: function() {
    game.offset = game.container.offset();
    $.fn.extend({
      clearEvents: game.events.clearEvents,
      getScale: game.events.getScale
    });
    game.deck.extendjQuery();
    game.card.extendjQuery();
    game.skill.extendjQuery();
    game.highlight.extendjQuery();
    game.map.extendjQuery();
    $(window).on('keypress', game.events.keyboard);
    $(window).on('resize', game.screen.resize);
    $(window).on('beforeunload ', game.events.leave);
    game.container.on('mousedown touchstart', game.events.hit);
    game.container.on('mousemove', game.events.move);
    game.container.on('touchmove', game.events.touchmove);
    game.container.on('mouseup touchend', game.events.end);
    game.container.on('contextmenu', function (event) {
      game.card.unselect();
      game.events.cancel(event);
    });
  },
  getCoordinates: function(event) {
    var position = {
      left: event.clientX,
      top: event.clientY
    };
    if (event.originalEvent && event.originalEvent.changedTouches) {
      var last = event.originalEvent.changedTouches.length - 1;
      position.left = event.originalEvent.changedTouches[last].clientX;
      position.top = event.originalEvent.changedTouches[last].clientY;
    }
    return position;
  },
  hit: function(event) { //console.trace('hit');
    var target = $(event.target), 
        card = target.closest('.card');
    if (card && card.hasClass('draggable')) {
      var position = game.events.getCoordinates(event),
          cardOffset = card.offset(), fromMap = '';
      if (card.closest('.map').length) fromMap = ' fromMap';
      game.offset = game.container.offset();
      game.events.dragging = card;
      game.events.draggingPosition = position;
      game.events.dragClone = card.clone().hide().removeClass('dragTarget').addClass('dragTargetClone ' + game.currentState + fromMap).appendTo(game.container);
      game.events.dragScale = card.getScale();
      game.events.dragOffset = {
        'left': (position.left - cardOffset.left) / game.events.dragScale,
        'top': (position.top - cardOffset.top) / game.events.dragScale
      };
    }
  },
  touchmove:  function(event) {
    game.events.move.call(this, event);
    if (event.preventDefault) event.preventDefault(); //prevent touch scroll
    return false;
  },
  move: function(event) {
    var position = game.events.getCoordinates(event);
    if (game.events.dragging && 
        position.left !== game.events.draggingPosition.left &&
        position.top !== game.events.draggingPosition.top) {
      game.events.dragging.addClass('dragTarget');
      var scale = game.events.dragClone.getScale();
      var scale2 = game.container.getScale();
      if (game.events.dragClone.hasClass('fromMap')) scale = 1;
      game.events.dragClone.css({
        'left': ((position.left - game.offset.left) - (game.events.dragOffset.left * scale)) / scale2 + 'px',
        'top': ((position.top - game.offset.top) - (game.events.dragOffset.top * scale)) / scale2 + 'px'
      }).show();
      var target = $(document.elementFromPoint(position.left, position.top));
      $('.drop').removeClass('drop');
      if (target.hasClasses('slot targetarea casttarget movearea attacktarget')) {
        game.events.dragClone.addClass('drop');
        target.addClass('drop');
      }
    }
  },
  end: function(event) {
    var position = game.events.getCoordinates(event), 
        target = $(document.elementFromPoint(position.left, position.top));
    if (!target.closest('.chat').length) $('.chat').removeClass('hover');
    if (event && event.type === 'touchend') {
      // fix touchend target
      target.mouseup();
      if (event.preventDefault) event.preventDefault();
      return false;
    } else if (game.events.dragging) {
      game.events.dragClone.remove();
      game.events.dragging.removeClass('dragTarget');
      game.events.dragging = false;
      target.addClass('dropped');
      setTimeout(function () { this.removeClass('dropped'); }.bind(target), 10);
    }
  },
  clearEvents: function(name) {
    var events = 'mousedown mouseup touchstart touchend mouseover mouseleave';
    if (name) {
      var n = '.'+name+' ',
          events_dot_name = events.split(' ').join(n) + n;
      this.off(events_dot_name);
    }
    else this.off(events);
    return this;
  },
  cancel: function(event) {
    if (event && event.preventDefault) event.preventDefault();
    return false;
  },
  leave: function() {
    if (game.mode == 'online') return game.data.ui.leave;
  },
  getScale: function () {
    var sc = $(this).css('transform').split('(')[1],
        s = 1;
    if (sc && sc.split) s = sc.split(',')[0];
    return Number(s);
  },
  keyboard: function (event) { //console.log(event.keyCode)
    // space: skip turn
    if (event.keyCode == 32) $('.table .skip.button').mouseup();
    // =: options
    if (event.keyCode == 61) {
      if (game.container.hasClass('option-state')) $('.game-overlay .back').mouseup();
      else $('.topbar .opt').mouseup();
    }
    // enter: chat
    if (event.keyCode == 13) $('.chat').toggleClass('hover');
  }
};
