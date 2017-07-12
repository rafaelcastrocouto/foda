game.skills.cat = {
  arrow: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      var width = skill.data('aoe width');
      var damageBonus = skill.data('distance damage bonus');
      var stunBonus = skill.data('distance stun bonus');
      var damage = skill.data('damage');
      source.opponentsInLine(target, range, width, function (card) {
        var distance = Math.abs((source.getX() - card.getX()) || (source.getY() - card.getY()));
        source.damage(damage + (distance * damageBonus), card, skill.data('damage type'));
        source.addStun(card, skill, (distance * stunBonus));
      }, 0 /*offset*/, 'first');
    }
  },
  leap: {
    cast: function (skill, source, target) {
      source.place(target);
      source.selfBuff(skill);
    }
  },
  star: {
    cast: function (skill, source) {
      var range = skill.data('aoe range'), targets = [];
      source.opponentsInRange(range, function (target) {
        source.damage(skill.data('damage'), target, skill.data('damage type'));
        targets.push(target);
      });
      if (targets.length) {
        var twiceTarget = targets[Math.floor(game.random() * targets.length)];
        source.damage(skill.data('damage'), twiceTarget, skill.data('damage type'));
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
