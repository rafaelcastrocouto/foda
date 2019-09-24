game.overlay = {
  build: function() {
    game.overlay.el = $('<div>').addClass('game-overlay hidden').appendTo(game.container);
    game.overlay.el.on('click tap', function (event) {
      if (event.target == game.overlay.el[0]) {
        if (game.overlay.cb) {
          game.overlay.cb();
          game.overlay.cb = false;
        }
        game.overlay.clear();
      }
    }); 
  },
  alert: function(txt, cb) {
    var box = $('<div>').addClass('box');
    game.overlay.cb = cb;
    game.overlay.el.removeClass('hidden').append(box);
    box.append($('<h1>').text(game.data.ui.warning));
    box.append($('<p>').text(txt));
    box.append($('<div>').addClass('button').text(game.data.ui.ok).on('mouseup touchend', function () {
      $(this).parent().remove();
      if (!game.overlay.el.children().length) {
        game.overlay.clear();
      }
      if (cb) cb(true);
      return false;
    }));
  },
  confirm: function(cb, text, cl) {
    var box = $('<div>').addClass('box '+(cl || ''));
    game.overlay.cb = cb;
    game.overlay.el.removeClass('hidden').append(box);
    box.append($('<h1>').text(text || game.data.ui.sure));
    var end = function () {// console.log(game.overlay.children().length)
      $(this).parent().remove();
      if (!game.overlay.el.children().length) {
        game.overlay.clear();
      }
      cb($(this).hasClass('alert'));
      return false;
    };
    box.append($('<div>').addClass('button alert').text(game.data.ui.yes).on('mouseup touchend', end));
    box.append($('<div>').addClass('button').text(game.data.ui.no).on('mouseup touchend', end));
  },
  error: function(details) {
    var box = $('<div>').addClass('box error');
    game.overlay.el.removeClass('hidden').append(box);
    var ti = 'Error';
    var re = 'Reload';
    var ok = 'Ok';
    if (game.data.ui) {
      ti = game.data.ui.error;
      re = game.data.ui.reload;
      ok = game.data.ui.ok;
    }
    box.append($('<h1>').text(ti));
    box.append($('<p>').html(details+'<br>'+re));
    box.append($('<div>').addClass('button alert').text(ok).on('mouseup touchend', function () {
      open('https://github.com/rafaelcastrocouto/foda/issues/new','_blank');
      location.reload();
    }));
    game.overlay.logError(details);
  },
  logError: function(details) {
    if (!game.debug) {
      if (typeof(details) !== 'string') details = JSON.stringify(details);
      var date = new Date();
      details += ' ' + date.toDateString();
      game.db({
        'set': 'errors',
        'data': details
      });
    }
  },
  clear: function () {
    game.overlay.el.empty();
    game.overlay.el.addClass('hidden');
    game.overlay.cb = false;
  }
};