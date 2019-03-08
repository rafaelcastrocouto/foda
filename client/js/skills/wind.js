game.skills.wind = {
  stun: {
    cast: function (skill, source, target) {
      source.shake();
      var secTarget = source.behindTarget(target);
      if (secTarget && !secTarget.hasClasses('ghost dead towers bkb')) {
        secTarget.shake();
        game.audio.play('wind/stunhit');
        if (secTarget.side() == source.opponent()) {
          source.addStun(target, skill);
          source.addStun(secTarget, skill);
        } else if (secTarget.hasClass('trees')) {
          source.addStun(target, skill);
        }
      } else {
        var stunNerf = -skill.data('stun')/2;
        source.addStun(target, skill, stunNerf);
      }
    }
  },
  arrow: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      var width = skill.data('aoe width');
      var targets = [];
      source.inLine(target, range, width, function (spot) {
        var card = spot.children('.card');
        if (card.side() == source.opponent()) {
          targets.push(card);
        } else if (card.hasClass('trees')) {
          game.tree.destroy(card);
        }
      });
      var damage = skill.data('damage');
      var damageNerf = skill.data('damage reduction');
      var finalDmg = damage - (damageNerf * (targets.length - 1));
      $(targets).each(function () {
        game.timeout(900, source.damage.bind(source, finalDmg, this, skill.data('damage type')));
      });
      game.timeout(900, game.fx.add.bind(this, 'wind-arrow', source, source.lastSpotInLine(target, range), 'rotate'));
    }
  },
  run: {
    cast: function (skill, source) {
      var buff = source.selfBuff(skill);
      source.on('attacked.wind-run', this.attacked).addClass('windrun');
      buff.on('expire', this.expire);
    },
    attacked: function (event, eventdata) {
      var source = eventdata.source;
      source.data('miss-attack', true);
    },
    expire: function (event, eventdata) {
      var target = eventdata.target;
      target.off('attacked.wind-run').removeClass('windrun');
    }
  },
  ult: {
    cast: function (skill, source, target) {
      var damage = source.data('current damage');
      var nerf = skill.data('damage reduction');
      source.setDamage(damage - nerf).addClass('nohighlight');
      game.lockSelection = true;
      for (var i=0; i < skill.data('attacks'); i++) {
        game.timeout(900 * i, source.attack.bind(source, target, 'force'));
      }
      game.timeout(3600, function (source, damage) {
        source.removeClass('nohighlight').setDamage(damage);
        game.lockSelection = false;
      }.bind(this, source, damage));
    }
  }
};
