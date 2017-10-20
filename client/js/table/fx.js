game.fx = {
  heroes: {
    lina: {
      fire: ['fire'],
      stun: ['stun'],
      passive: ['passive'],
      ult: ["ult-close", "ult-far"]
    },
    pud: {
      hook: ['hook']
    },
    wk: {
      stun: ['stun']
    },
    cm: {
      ult: ['ult', 'ult1', 'ult2', 'ult3']
    }
  },
  build: function() {
    var loaded = [];
    $.each(game.player.picks, function(i, hero) {
      $.each(game.fx.heroes[hero], function(skillname, fxarray) {
        if (fxarray)
          $.each(fxarray, function(j, fxname) {
            game.fx.preload(hero, fxname, skillname);
          });
      });
      loaded.push(hero);
    });
    $.each(game.enemy.picks, function(i, hero) {
      if (loaded.indexOf(hero) < 0) {
        $.each(game.fx.heroes[hero], function(skillname, fxarray) {
          if (fxarray)
            $.each(fxarray, function(j, fxname) {
              game.fx.preload(hero, fxname, skillname);
            });
        });
      }
    });
  },
  preload: function(hero, name, skill) {
    var img = $('<img>').appendTo(game.hidden);
    img.attr({ src: '/img/fx/' + hero + '/' + name + '.png' });
  },
  imgs: [],
  add: function(name, source, target, tag) {
    if (!target) target = source;
    var hero = source.data('hero');
    //console.log(game.fx.heroes[hero][name])
    if (game.fx.heroes[hero][name]) {
      var fx = $('<div>').addClass(name + ' fx fx-' + hero);
      var dirX = source.getX() - target.getX();
      var dirY = source.getY() - target.getY();
      if (tag == 'linear') {
        var dir = source.getDirectionStr(target);
        fx.addClass(dir + ' d'+ Math.abs(dirX || dirY));
      }
      if (tag == 'rotate') {
        if (Math.abs(dirX) > 1 || Math.abs(dirY) > 1) fx.addClass(name + '-far');
        else fx.addClass(name + '-close');
        fx.addClass('r' + dirX + dirY);
      }
      if (tag == 'random') {
        var n = game.fx.heroes[hero][name].length;
        var r = Math.floor(Math.random() * n);
        if (r) fx.addClass(name+r);
        game.timeout(Math.random() * 600, function (fx, target) {
          fx.appendTo(target);
          game.fx.play(fx);
        }.bind(this, fx, target));
      }
      else {
        fx.appendTo(target);
        game.fx.play(fx);
      }
      fx.on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function () {
          this.remove();
        });
      target.closest('.card').reselect();
      return fx;
    }
  },
  play: function(fx) {
    fx[0].style.animationPlayState = 'running';
  },
  pause: function(fx) {
    fx[0].style.animationPlayState = 'paused';
  },
  hide: function(fx) {
    game.fx.pause(fx);
    fx.removeClass('top bottom right left r-1-1 r-10 r-11 r0-1 r00 r01 r1-1 r10 r11 r-21 r-20 r-2-1 r21 r20 r2-1 r-1-2 r0-2 r1-2 r-12 r02 r12').appendTo(game.hidden);
  },
  stop: function(name, source) {
    var fx = source.find('.fx.'+name);
    fx.remove();
  }
};
