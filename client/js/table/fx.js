game.fx = {
  build: function() {
    //todo: each hero load if (hero has fx)
    var fx = ['fireball','fire'];
    $.each(fx, game.fx.load);
  },
  load: function () {
    var name = this;
    var img = $('<img>').appendTo(game.hidden);
    img.on('load', game.fx.loaded.bind(this, name));
    img.attr({src: '/img/fx/'+name+'.png'});
  },
  loaded: function (name) {
    game.fx[name] = $('<div>').addClass(name + ' fx');
    game.fx[name].on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function () {
      game.fx.hide(game.fx[name]);
    });
  },
  add: function (name, target, source) {
    var fx = game.fx[name];
    if (fx) {
      if (source) {
        var dir = source.getDirectionStr(target);
        fx.addClass(dir);
      }
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
    fx.removeClass('top bottom right left').appendTo(game.hidden);
  }
};