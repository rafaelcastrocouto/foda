game.skills.nyx = {
  stun: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      var width = skill.data('aoe width');
      var damage = skill.data('damage');
      var dmgType = skill.data('damage type');
      game.shake();
      source.opponentsInLine(target, range, width, function (card) {
        source.damage(damage, card, dmgType);
        source.addStun(card, skill);
      });
    }
  },
  burn: {
    cast: function (skill, source, target) {
      var hero = target.data('hero');
      var opponent = target.side();
      $('.'+opponent+' .hand .'+hero).randomCard().discard();
      var damage = (target.data('mana') || 1) * skill.data('multiplier');
      var dmgType = skill.data('damage type');
      source.damage(damage, target, dmgType);
    }
  },
  spike: {
    cast: function (skill, source) {
      var buff = source.selfBuff(skill);
      source.addClass('nyx-spike');
      source.on('damage.nyx-spike', this.damage);
      source.data('nyx-spike', skill);
      buff.on('expire', this.expire);
    },
    damage: function (event, eventdata) {
      var nyx = eventdata.target;
      var skill = nyx.data('nyx-spike');
      var dmgType = skill.data('damage type');
      var attacker = eventdata.source;
      if (!attacker.hasClass('towers')) {
        nyx.damage(eventdata.originalDamage, attacker, dmgType);
        nyx.addStun(attacker, skill);
      }
    },
    expire: function (event, eventdata) {
      var target = eventdata.target;
      target.data('nyx-spike', null);
      target.off('damage.nyx-spike');
      target.removeClass('nyx-spike');
    }
  },
  ult: {
    cast: function (skill, source) {
      var buff = source.selfBuff(skill);
      buff.on('expire', this.expire);
      source.on('invisibilityLoss', this.invisibilityLoss);
      source.on('attack.nyx-ult', this.attack);
      source.addInvisibility();
      source.addClass('nyx-ult');
    },
    attack: function (event, eventdata) {
      game.audio.play('nyx/ultattack');
    },
    invisibilityLoss: function (event, eventdata) {
      var source = eventdata.target;
      source.removeBuff('nyx-ult');
      source.removeClass('nyx-ult');
      source.off('attack.nyx-ult');
    },
    expire: function (event, eventdata) {
      var source = eventdata.target;
      source.removeInvisibility();
      source.removeClass('nyx-ult');
      source.off('attack.nyx-ult');
    }
  }
};
