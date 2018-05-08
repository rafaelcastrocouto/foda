game.fx = {
  heroes: {
    ld: {
      rabid: ['rabid'],
      roar: ['roar'],
      cry: ['cry'],
      return: ['return','return-target'],
      root: ['root']
    },
    lina: {
      fire: ['fire'],
      stun: ['stun'],
      passive: ['passive'],
      ult: ['ult-close', 'ult-far']
    },
    pud: {
      hook: ['hook'],
      rot: ['rot'],
      ult: ['ult']
    },
    wk: {
      stun: ['stun', 'stun-hit']
    },
    cm: {
      slow: ['slow'],
      freeze: ['freeze'],
      ult: ['ult', 'ult1', 'ult2', 'ult3']
    },
    cat: {
      arrow: ['arrow', 'arrow-impact', 'arrow-source', 'arrow-source-horiz'],
      star: ['star'],
      leap: ['leap', 'leap-path'],
      ult: ['ult']
    },
    meteor: {
      cast: ['ult']
    },
    kotl: {
      mana: ['mana'],
      leak: ['leak'],
      ult: ['ult'],
      blind: ['blind'],
      recall: ['recall','recall-source']
    }
  },
  build: function() {
    var img = $('<img>').appendTo(game.hidden);
    img.attr({ src: '/img/fx/ultfx.png' });
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
    var str = hero+'-'+name;
    if (!game.hidden.children('.'+str).length) {
      var img = $('<img>').addClass(str).appendTo(game.hidden);
      img.attr({ src: '/img/fx/' + hero + '/' + name + '.png' });
    }
  },
  imgs: [],
  add: function(name, source, target, tag, append) {
    if (!target) target = source;
    var a = name.split('-');
    var hero = a[0];
    var skill = a[1];
    //console.log(game.fx.heroes[hero][skill])
    if ( !game.recovering && game.fx.heroes[hero] && game.fx.heroes[hero][skill]) {
      game.fx.stop(name, source);
      var fx = $('<div>').addClass(name + ' fx fx-' + hero);
      var dirX = source.getX() - target.getX();
      var dirY = source.getY() - target.getY();
      if (tag == 'linear') {
        var dir = source.getDirectionStr(target);
        fx.addClass(dir + ' d'+ Math.abs(dirX || dirY));
      }
      if (tag == 'rotate') {
        if (Math.abs(dirX) > 1 || Math.abs(dirY) > 1) fx.addClass('far');
        else fx.addClass('close');
        fx.addClass('r' + dirX + dirY);
      }
      if (tag == 'random') {
        var n = game.fx.heroes[hero][skill].length;
        var r = Math.floor(Math.random() * n);
        if (r) fx.addClass(skill+r);
        game.timeout(Math.random() * 600, function (fx, target) {
          if (append) fx.appendTo(append);
          else fx.appendTo(target);
          game.fx.play(fx);
        }.bind(this, fx, target));
      }
      else {
        if (append) fx.appendTo(append);
        else fx.appendTo(target);
        game.fx.play(fx);
      }
      //console.log(fx)
      if (tag != 'keep') fx.on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function () { this.remove(); });
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
    fx.removeClass('top bottom right left far close r-1-1 r-10 r-11 r0-1 r00 r01 r1-1 r10 r11 r-21 r-20 r-2-1 r21 r20 r2-1 r-1-2 r0-2 r1-2 r-12 r02 r12').appendTo(game.hidden);
  },
  stop: function(name, source) {
    var fx = source.find('.fx.'+name);
    fx.remove();
  },
  projectile: function (source, target, tag) {
    if (!game.recovering) {
      var cl = source.data('hero');
      if (source.hasClass('towers')) cl = 'towers ' + source.side();
      if (source.hasClass('units')) cl = 'units ' + source.data('id') +' '+ source.side();
      if (tag) {
        if (typeof(tag) == 'string') cl += ' '+tag;
        else cl = tag.data('hero');
      }
      var projectile = $('<div>').addClass('projectile ' + cl);
      var angle = 180 * Math.atan2( (source.getX()-target.getX())*210, (target.getY()-source.getY())*310 ) / Math.PI;
      //console.log(angle)
      projectile.data('rotate', angle).appendTo(game.map.el);
      game.fx.projectileMove(projectile, source);
      game.timeout(64, game.fx.projectileMove.bind(this, projectile, target));
      game.timeout(464, projectile.remove.bind(projectile));
      return projectile;
    }
  },
  projectileMove: function(projectile, target) {
    if (projectile && target) {
      var rotate = projectile.data('rotate') || 0;
      var x = target.getX();
      var y = target.getY();
      projectile.css({
        'transform': 'translate(-50%, -50%) translate3d('+(110 + (x * 210))+'px,'+(160 + (y * 310))+'px, 20px) rotate('+rotate+'deg) scale(2.5)'
      });
    }
  },
  textDelay: 600,
  text: function (card, color, val, t) {
    if (val > 0 || typeof(val) == 'string') {
      var textFx = $('<span>').addClass(color).text(val);
      var currentDelay = card.data('textFxDelay');
      if (!currentDelay) {
        textFx.appendTo(card);
        card.data('textFxDelay', game.fx.textDelay);
      } else {
        game.timeout(currentDelay, textFx.appendTo.bind(textFx, card));
        card.data('textFxDelay', currentDelay + game.fx.textDelay);
      }
      game.timeout(game.fx.textDelay, function () {
        this.data('textFxDelay', this.data('textFxDelay') - game.fx.textDelay);
      }.bind(card));
      if (!t) t = 2000;
      game.timeout(t, textFx.remove.bind(textFx));
    }
  },
  ult: function(skill, cb, str) {
    var skillid = skill.data('skill');
    if (skillid == 'ult') {
      $('.ultfx .star').removeClass('hide');
      var fx = $('<div>').addClass(skill.data('hero')+'-ult fx');
      game.states.table.ultfx.append(fx);
      game.timeout(1900, function () {
        $('.ultfx .star').addClass('hide');
      });
      game.timeout(2100, function () {
        game.states.table.ultfx.children('.fx').remove();
        if (str) game.audio.play(str);
        if (cb) cb();
      });
    } else if (cb) cb();
  },
  shake: function() {
    var state = game.states[game.currentState].el;
    state.addClass('shake');
    setTimeout(function() {
      this.removeClass('shake');
    }
    .bind(state), 260);
  },
  clear: function() {
    $('.ultfx .star').addClass('hide');
    game.states.table.ultfx.children('.fx').remove();
    $('.map .fx').remove();
    game.fx.ldult = false;
  }
};
