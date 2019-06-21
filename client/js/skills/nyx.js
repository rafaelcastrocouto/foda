game.skills.nyx = {
  stun: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      var width = skill.data('aoe width');
      var damage = skill.data('damage');
      var dmgType = skill.data('damage type');
      game.fx.shake();
      var opponent = source.opponent();
      var x = source.getX(), y = source.getY();
      source.inLine(target, range, width, function (spot, i, j) {
        var t = Math.abs(180 * ((x-i)+(y-j)));
        var card = $('.card', spot);
        if (card.hasClass(opponent) && !card.hasClass('bkb')) {
          game.timeout(t, function () {
            source.damage(damage, card, dmgType);
            source.addStun(card, skill);
            game.fx.add('nyx-stun', spot);
          });
        } else game.timeout(t, game.fx.add.bind(this, 'nyx-stun', spot,0,0,0 ,'miss'));
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
      game.fx.add('nyx-burn', source, target);
    }
  },
  spike: {
    cast: function (skill, source) {
      var buff = source.selfBuff(skill);
      source.addClass('nyx-spike');
      source.on('damage.nyx-spike', this.damage);
      source.data('nyx-spike', skill.attr('id'));
      buff.on('expire', this.expire);
      game.fx.add('nyx-spike', source, 0, 'keep');
    },
    damage: function (event, eventdata) {
      var target = eventdata.target;
      game.timeout(900, function (eventdata, cardId) {
        var nyx = $('#'+cardId);
        var skill = $('#'+nyx.data('nyx-spike'));
        var dmgType = skill.data('damage type');
        var attacker = eventdata.source;
        var damage = eventdata.originalDamage;
        if (!attacker.hasClass('towers')) {
          nyx.damage(damage, attacker, dmgType);
          nyx.addStun(attacker, skill);
        }
      }.bind(this, eventdata, target.attr('id')));
    },
    expire: function (event, eventdata) {
      var target = eventdata.target;
      target.data('nyx-spike', null);
      target.off('damage.nyx-spike');
      target.removeClass('nyx-spike');
      var fx = $('.fx.nyx-spike', target);
      fx.addClass('end');
      fx.on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function () { this.remove(); });
    }
  },
  ult: {
    cast: function (skill, source) {
      var buff = source.selfBuff(skill);
      buff.on('expire', this.expire);
      source.on('pre-attack.nyx-ult', this.attack);
      source.on('invisibilityLoss.nyx-ult', this.invisibilityLoss);
      source.addInvisibility(buff);
      source.addClass('nyx-ult');
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var buff = source.getBuff('nyx-ult');
      //console.log(target)
      if (target.hasClass('towers')) {
        eventdata.bonus += (-1 * buff.data('damage bonus')) + 1;
      } else game.audio.play('nyx/ultattack');
      source.removeClass('nyx-ult');
      source.off('pre-attack.nyx-ult');
      source.removeBuff('nyx-ult');
    },
    invisibilityLoss: function (event, eventdata) {
      var source = eventdata.target;
      source.removeClass('nyx-ult');
    },
    expire: function (event, eventdata) {
      var source = eventdata.target;
      source.removeClass('nyx-ult');
      source.off('pre-attack.nyx-ult');
    }
  }
};
