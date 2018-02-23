game.skills.cat = {
  arrow: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      var damageBonus = skill.data('distance damage bonus');
      var stunBonus = skill.data('distance stun bonus');
      var damage = skill.data('damage');
      var arrowTarget = source.firstCardInLine(target, range);
      game.timeout( 50, game.fx.add.bind(this, 'cat-arrow-source', source, target, 'rotate', source.parent()));
      var fxTarget;
      if (arrowTarget && arrowTarget.side() == source.opponent()) {
        fxTarget = arrowTarget.parent();
        var distance = Math.abs((source.getX() - arrowTarget.getX()) || (source.getY() - arrowTarget.getY())) - 1;
        game.timeout(700, function () {
          game.fx.add('cat-arrow-impact', source, arrowTarget);
          game.audio.play('cat/arrowhit');
          arrowTarget.shake();
          if (!target.hasClass('bkb')) source.addStun(arrowTarget, skill, (distance * stunBonus));
          source.damage(damage + (distance * damageBonus), arrowTarget, skill.data('damage type'));
        });
      } else {
        fxTarget = source.lastSpotInLine(target, range);
      }
      game.timeout(100, game.fx.add.bind(this, 'cat-arrow', source, fxTarget, 'rotate'));
    }
  },
  leap: {
    cast: function (skill, source, target) {
      source.selfBuff(skill);
      source.move(target);
      game.timeout( 50, game.fx.add.bind(this, 'cat-leap', source.parent()));
      game.timeout( 50, game.fx.add.bind(this, 'cat-leap-path', source, target, 'rotate'));
      game.timeout(150, game.fx.add.bind(this, 'cat-leap', target));
    }
  },
  star: {
    cast: function (skill, source) {
      var range = skill.data('cast range'), targets = [];
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      source.opponentsInRange(range, function (target) {
        if (!target.hasClass('cycloned')) {
          game.fx.add('cat-star', source, target, 'random');
          game.timeout(900, source.damage.bind(source, skill.data('damage'), target, skill.data('damage type')));
          targets.push(target);
        }
      });
      if (targets.length) {
        var target = targets[Math.floor(game.random() * targets.length)];
        game.timeout(900, function (source, target, skill) {
          game.fx.add('cat-star', source, target, 'random');
          game.timeout(900, source.damage.bind(source, skill.data('damage'), target, skill.data('damage type')));
        }.bind(this, source, target, skill));
      }
    }
  },
  ult: {
    cast: function (skill, source) {
      var side = source.side();
      $('.map .heroes.'+side+':not(.bkb)').each(function () {
        var ally = $(this);
        var buff = source.addBuff(ally, skill);
        buff.on('expire', game.skills.cat.ult.expire);
        ally.addInvisibility();
        ally.on('invisibilityLoss', game.skills.cat.ult.end);
      });
      game.timeout(400, game.fx.add.bind(this, 'cat-ult', source.parent()));
    },
    end: function (event, eventdata) {
      eventdata.target.removeBuff('cat-ult');
    },
    expire: function (event, eventdata) {
      eventdata.target.removeInvisibility();
    }
  }
};
