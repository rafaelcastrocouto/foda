game.fx = {
  addGif: function (name, target, time) {
    var fx = game.fx[name];
    if (fx) {
      fx.move_to(0);
      fx.el.appendTo(target);
      fx.play();
    }
  },
  hide: function (name) {
    var fx = game.fx[name];
    fx.pause();
    fx.move_to(0);
    fx.el.appendTo(game.hidden);
  }
};