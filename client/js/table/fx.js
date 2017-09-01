game.fx = {
  addGif: function (name, target, time) {
    var fx = game.fx[name];
    if (fx) {
      game.fx.reset(fx);
      fx.appendTo(target);
      game.fx.play(fx);
      setTimeout(game.fx.hide.bind(this, fx), 1400);
    }
  },
  play: function (fx) {
    fx[0].style.animationPlayState = 'running';
  },
  pause: function (fx) {
    fx[0].style.animationPlayState = 'paused';
  },
  reset: function (fx) {
    fx[0].style.animation = 'none';
    fx[0].offsetHeight = 0;
    fx[0].style.animation = null;
  },
  stop: function (fx) {
    game.fx.reset(fx);
    game.fx.pause(fx);
  },
  hide: function (fx) {
    game.fx.stop(fx);
    fx.appendTo(game.hidden);
  }
};