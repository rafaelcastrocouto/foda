game.events = {
  build: function() {
    $.fn.extend({
      clearEvents: game.events.clearEvents,
      getScale: game.events.getScale
    });
    game.deck.extendjQuery();
    game.card.extendjQuery();
    game.buff.extendjQuery();
    game.skill.extendjQuery();
    game.highlight.extendjQuery();
    game.map.extendjQuery();
    game.screen.resize();
    $(window).on('resize', game.screen.resize);
    $(window).on('error', game.events.error);
    //$(document).ajaxError(function(event, xhr, settings) {
    //  if (xhr.status !== 403 && xhr.status!== 404) game.overlay.error(settings.url + ' ' + xhr.status + ': ' + xhr.responseText);
    //});
    $(window).on('keypress', game.events.keyboard);
    $(window).on('beforeunload ', game.events.leave);
    $(window).on('mousemove', game.parallax.move);
    $(window).on('deviceorientation', game.parallax.orientation);
    game.container.on('mousedown touchstart', game.events.hit);
    game.container.on('mousemove', game.events.move);
    game.container.on('touchmove', game.events.touchmove);
    game.container.on('touchend touchleave', game.events.touchend);
    game.container.on('mouseup mouseleave tap', game.events.end);
    game.container.on('contextmenu', game.events.rightclick);
    game.container.on('click tap', '.button, .card', game.events.click);

    window.addEventListener('beforeinstallprompt', function(event) {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      event.preventDefault();
      // Stash the event so it can be triggered later.
      game.events.deferredPrompt = event;
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
    //console.log(target, card);
    if (card && card.hasClass('draggable')) {
      var position = game.events.getCoordinates(event),
          cardOffset = card.offset(), cl = '';
      if (card.closest('.map').length) cl = ' fromMap';
      if (card.closest('.hand').length || card.closest('.sidehand').length) cl += ' fromHand';
      game.offset = game.container.offset();
      game.events.dragTarget = card;
      game.events.draggingPosition = position;
      game.events.dragClone = card.clone().removeClass('dragTarget').addClass('hidden dragTargetClone ' + game.currentState + cl).appendTo(game.container);
      game.events.dragScale = card.getScale();  //console.log(event)
      game.events.dragOffset = {
        'left': (position.left - cardOffset.left) / game.events.dragScale,
        'top': (position.top - cardOffset.top) / game.events.dragScale
      };
    }
  },
  touchmove: function(event) {// console.trace('touchmove');
    game.events.move.call(this, event);
    if (event.preventDefault) event.preventDefault(); //prevent touch scroll
    //return false;
  },
  move: function(event) {
    if (game.events.dragTarget) {
      var position = game.events.getCoordinates(event);
      var tolerance = 2;
      var moveStarted = (position.left < game.events.draggingPosition.left - tolerance || 
                         position.top < game.events.draggingPosition.top - tolerance)  &&
                        (position.left > game.events.draggingPosition.left + tolerance || 
                         position.top > game.events.draggingPosition.top + tolerance);
      if (moveStarted || game.events.dragging) {
        game.events.dragging = true;
        var scale = game.events.dragClone.getScale();
        var scale2 = game.container.getScale();
        if (game.events.dragClone.hasClass('fromMap')) scale = 1;
        game.events.dragTarget.addClass('dragTarget');
        game.events.dragClone.css({
          'left': ((position.left - game.offset.left) - (game.events.dragOffset.left * scale)) / scale2 + 'px',
          'top': ((position.top - game.offset.top) - (game.events.dragOffset.top * scale)) / scale2 + 'px'
        });
        setTimeout(function () {game.events.dragClone.removeClass('hidden');}, 80);
        var target = $(document.elementFromPoint(position.left, position.top));
        $('.drop').removeClass('drop');
        if (target.hasClasses('slot picked targetarea casttarget movearea attacktarget')) {
          game.events.dragClone.addClass('drop');
          target.addClass('drop');
        }
      }
    }
  },
  touchend: function(event) {
    var position = game.events.getCoordinates(event), 
        target = $(document.elementFromPoint(position.left, position.top));
    if (!target.is('input, label *, select, form *, .options *')) {
      // fix touchend target
      target.mouseup();
      //if (event.preventDefault) event.preventDefault();
      //return false;
    }
  },
  end: function(event) { //console.log(event)
        target = $(event.target);
    if (!target.closest('.chat').length) $('.chat').removeClass('hover');
    if (game.events.dragging) {
      $('.dragTarget').removeClass('dragTarget');
      $('.drop').removeClass('drop');
    }
    $('.dragTargetClone').remove();
    game.events.dragging = false;
    game.events.dragTarget = null;
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
  keyboard: function (event) {//console.log(event.keyCode)
    // space: skip turn
    if (event.keyCode == 32) game.states.table.skipClick();
    // + options
    if (event.keyCode == 43) game.options.keyboard();
    // enter: chat
    if (event.keyCode == 13) $('.chat').toggleClass('hover');
  },
  click: function () {
    var target = $(this);
    if (!target.attr('disabled')) {
      target.attr('disabled', true);
      setTimeout(function (target) {
        target.attr('disabled', false);
      }.bind(this, target), 300);
    }
  },
  rightclick: function (event) {
    game.card.unselect();
    game.events.cancel(event);
    return false;
  },
  error: function(event) {
    var err = event.originalEvent;
    var details = err.message +' '+ err.filename +' '+ err.lineno +':'+err.colno;
    game.overlay.error(details, function () {
      game.clear();
      game.setData('state', 'menu');
      location.reload(true);
    });
  }
};
