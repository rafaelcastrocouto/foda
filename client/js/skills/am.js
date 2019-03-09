game.skills.am = {
  burn: {
    passive: function (skill, source) {
      source.selfBuff(skill);
      source.on('pre-attack.am-burn', this.attack);
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var hero = target.data('hero');
      var opponent = target.side();
      var mana = target.data('mana') || 0;
      if (opponent == source.opponent() && !source.data('miss-attack') && !target.hasClass('bkb')) {
        eventdata.bonus += mana;
        $('.'+opponent+' .hand .'+hero).randomCard().discard();
        game.audio.play('am/burn');
      }
    }
  },
  mirror: {
    cast: function (skill, source) {
      if (!source.hasBuff('mirror-passive')) {
        source.selfBuff(skill, 'mirror-passive');
      }
      source.selfBuff(skill, 'mirror-counter');
      source.on('casted', this.counter);
    },
    counter: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var skill = eventdata.skill;
      if (skill.side() == target.opponent()) target.cast(skill, source);
    }
  },
  blink: {
    cast: function (skill, source, target) {
      if (target.hasClass('free')) source.place(target);
    }
  },
  ult: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      var opponent = source.opponent();
      var damage = skill.data('damage');
      var mana = target.data('mana');
      target.alliesInRange(range, function (targets) {
        source.damage(damage + mana, targets, skill.data('damage type'));
      });
      target.stopChanneling();
      game.fx.shake();
    }
  }
};
