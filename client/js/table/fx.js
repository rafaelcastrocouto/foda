game.fx = {
  add: function (name, target, time) {
    var fx = game.fx[name];
    if (fx) {
      fx.appendTo(target);
      game.fx.play(fx);
    }
  },
  play: function (fx) {
    fx[0].style.animationPlayState = 'running';
  },
  pause: function (fx) {
    fx[0].style.animationPlayState = 'paused';
  },
  hide: function (fx) {
    game.fx.pause(fx);
    fx.appendTo(game.hidden);
  }
};