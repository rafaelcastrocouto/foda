game.skills.cat = {
  arrow: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      var damageBonus = skill.data('distance damage bonus');
      var stunBonus = skill.data('distance stun bonus');
      var damage = skill.data('damage');
      var arrowTarget = source.firstCardInLine(target, range);
      if (arrowTarget && arrowTarget.side() == source.opponent()) {
        var distance = Math.abs((source.getX() - arrowTarget.getX()) || (source.getY() - arrowTarget.getY())) - 1;
        game.timeout(900, function () {
          game.audio.play('cat/arrowhit');
          arrowTarget.shake();
          source.addStun(arrowTarget, skill, (distance * stunBonus));
          source.damage(damage + (distance * damageBonus), arrowTarget, skill.data('damage type'));
        });
      }
    }
  },
  leap: {
    cast: function (skill, source, target) {
      source.selfBuff(skill);
      source.move(target);
    }
  },
  star: {
    cast: function (skill, source) {
      var range = skill.data('cast range'), targets = [];
      source.opponentsInRange(range, function (target) {
        source.damage(skill.data('damage'), target, skill.data('damage type'));
        target.shake();
        targets.push(target);
      });
      if (targets.length) {
        var target = targets[Math.floor(game.random() * targets.length)];
        game.timeout(900, function (source, target, skill) {
          source.damage(skill.data('damage'), target, skill.data('damage type'));
          target.shake();
        }.bind(this, source, target, skill));
      }
    }
  },
  ult: {
    cast: function (skill, source) {
      var side = source.side();
      $('.map .heroes.'+side).each(function () {
        var ally = $(this);
        var buff = source.addBuff(ally, skill);
        buff.on('expire', game.skills.cat.ult.expire);
        ally.addInvisibility();
        ally.on('invisibilityLoss', game.skills.cat.ult.end);
      });
    },
    end: function (event, eventdata) {
      eventdata.target.removeBuff('cat-ult');
    },
    expire: function (event, eventdata) {
      eventdata.target.removeInvisibility();
    }
  }
};
