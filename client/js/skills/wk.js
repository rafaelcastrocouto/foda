game.skills.wk = {
  stun: {
    cast: function (skill, source, target) {
      source.addStun(target, skill);
      source.damage(skill.data('damage'), target, skill.data('damage type'));
      target.data('wk-dot-count', 3);
      target.on('turnend.wk-stun', this.turnend.bind(this, {
        source: source,
        target: target,
        skill: skill
      }));
    },
    turnend: function (skillData) { 
      var target = skillData.target;
      var source = skillData.source;
      var skill = skillData.skill;
      var buff = skill.data('buff');
      var count = target.data('wk-dot-count');
      target.data('wk-dot-count', count - 1);
      if (count === 2) {
        buff = source.addBuff(target, skill);
        game.fx.add('stun', source, buff);
      }
      if (count >= 0 && count <= 2) source.damage(buff.dot, target, buff['damage type']);
      if (count === 0) {
        target.off('turnend.wk-stun').data('wk-dot-count', null).removeBuff('wk-stun');
      }
    }
  },
  aura: {
    passive: function (skill, source) {
      var side = source.side();
      var team = $('.table .card.'+side+':not(.skills)');
      team.on('attack.wk-aura', this.attack);
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var damage = eventdata.damage;
      var buff = source.hasBuff('wk-aura');
      if (buff) {
        var lifesteal = game.data.skills.wk.aura.buff.lifesteal / 100;
        if (target.side() == source.opponent() && !source.data('miss-attack')) 
          source.heal(damage * lifesteal);
      }
    }
  },
  crit: {
    passive: function (skill, source) {
      source.selfBuff(skill);
      source.on('pre-attack.wk-crit', this.attack);
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var damage = eventdata.damage;
      var buff = source.getBuff('wk-crit');
      var chance = buff.data('chance') / 100;
      var bonus = buff.data('multiplier');
      if (game.random() < chance && target.side() == source.opponent() && !source.data('miss-attack')) {
        source.data('critical-attack', bonus);
      }
    }
  },
  ult: {
    passive: function (skill, source) {
      source.selfBuff(skill, 'ult-source');
      source.on('death.wk-ult', this.death);
    },
    death: function (event, eventdata) {
      var wk = eventdata.target;
      var spot = eventdata.spot;
      var side = wk.side();
      spot.addClass('cript block');
      wk.on(side + 'turnstart.wk-ult', game.skills.wk.ult.turnstart);
      wk.data('wk-ult-spot', spot);
    },
    turnstart: function (event, eventdata) {
      var wk = eventdata.target;
      var buff = game.data.skills.wk.ult.buffs.ult.source;
      var range = buff.range;
      var skill = buff.skill;
      var spot = wk.data('wk-ult-spot');
      var side = wk.side();
      game.audio.play('wk/ult');
      game.timeout(900, function (wk, spot) { //console.log(wk, spot)
        game.shake();
        wk.reborn(spot);
        spot.removeClass('cript block');
      }.bind(this, wk, spot));
      wk.opponentsInRange(range, function (target) {
        wk.addBuff(target, skill, 'ult-targets');
      });
      wk.off(side + 'turnstart.wk-ult');
      wk.off('death.wk-ult');
      wk.data('wk-ult-spot', null);
      if (game.mode == 'library') skill.appendTo(game[side].skills.sidehand);
      else skill.appendTo(game[side].skills.cemitery);
      if (side == 'enemy') skill.addClass('flipped');
    }
  }
};
