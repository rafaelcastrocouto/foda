game.skills.am = {
  burn: {
    passive: function (skill, source) {
      source.selfBuff(skill);
      source.data('am-burn', skill);
      source.on('attack', this.attack);
    },
    attack: function (event, eventdata) { 
      var source = eventdata.source;
      var target = eventdata.target;
      var hero = target.data('hero');
      var opponent = target.side();
      var mana = target.data('mana');
      game.audio.play('am/burn');
      if (mana) source.damage(target.data('mana'), target, game.data.ui.pure);
      $('.'+opponent+' .hand .'+hero).randomCard().discard();
    }
  },
  shield: {
    passive: function (skill, source) {
      source.selfBuff(skill);
    }
  },
  blink: {
    cast: function (skill, source, target) {
      source.place(target);
    }
  },
  ult: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      var opponent = source.opponent();
      var damage = skill.data('damage');
      var mana = target.data('mana');
      target.alliesInRange(range, function (targets) {
        source.damage(damage + mana, targets, skill.data('damage type'));
      });
      target.stopChanneling();
      game.shake();
    }
  }
};
