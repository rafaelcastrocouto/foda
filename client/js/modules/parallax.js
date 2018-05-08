game.parallax = {
  move: function (event) {
    clearTimeout(game.iddleTimeout);
    if (game.currentState == 'log'  ||
        game.currentState == 'menu' ||
        game.currentState == 'vs'   ||
        game.currentState == 'result') {
      var s = 0.01;
      var p = { x: event.clientX, y: event.clientY };
      var w = { x: window.innerWidth, y: window.innerHeight };
      var offmiddle = { x: p.x - (w.x/2), y: p.y - (w.y/2) };
      var v = { x: 50 + (offmiddle.x * s), y: 50 + (offmiddle.y * s) };
      var str = ''+ v.x + '% ' + v.y + '%';
      game.states[game.currentState].parallax.removeClass('iddle').css('perspective-origin', str);
      game.iddleTimeout = setTimeout(function () { $('.parallax').addClass('iddle'); }, 8000);
    }
  },
  orientation: function (event) {
    clearTimeout(game.iddleTimeout);
    if (game.currentState == 'log'  ||
        game.currentState == 'menu' ||
        game.currentState == 'vs'   ||
        game.currentState == 'result') {
      var o = {
        x: -event.originalEvent.gamma,
        y: -event.originalEvent.beta
      };
      if (window.innerHeight < window.innerWidth) {
        o.x = event.originalEvent.beta;
        o.y = -event.originalEvent.gamma;
      }
      o.x = Math.min(Math.max(o.x, -50), 50);
      o.y = Math.min(Math.max(o.y, -50), 50);
      o.x = ((o.x + 90)/180)*100;
      o.y = ((o.y + 90)/180)*100;
      var min = 20, max = 80;
      o.x = Math.min(Math.max(o.x, min), max);
      o.y = Math.min(Math.max(o.y, min), max);
      var str = ''+ o.x + '% ' + o.y + '%';
      game.states[game.currentState].parallax.removeClass('iddle').css('perspective-origin', str);
      game.iddleTimeout = setTimeout(function () { $('.parallax').addClass('iddle'); }, 8000);
    }
  }
};