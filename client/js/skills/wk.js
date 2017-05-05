game.skills.wk = {
  stun: {
    cast: function (skill, source, target) {
      source.addStun(target, skill);
      source.damage(skill.data('damage'), target, skill.data('damage type'));
      target.data('wk-dot-count', 4);
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
      var count = target.data('wk-dot-count');
      var dotBuff = target.getBuff('wk-stun');
      var stunBuff = target.getBuff('stun');
      var buff = $(stunBuff[0] || dotBuff[0]);
      if (dotBuff.length) source.damage(dotBuff.data('dot'), target, dotBuff.data('damage type'));
      if (count === 3) source.addBuff(target, skill);
      if (count === 0) target.off('turnend.wk-stun').data('wk-dot-count', null);
      target.data('wk-dot-count', count - 1);
    }
  },
  lifesteal: {
    passive: function (skill, source) {
      var side = source.side();
      var team = $('.table .card.heroes.'+side);
      team.on('attack.wk-lifesteal', this.attack);
      source.addBuff(team, skill);
      source.on('death.wk-lifesteal', this.death);
      source.on('reborn.wk-lifesteal', this.reborn);
      source.data('wk-lifesteal', skill);
    },
    attack: function (event, eventdata) { 
      var source = eventdata.source;
      var target = eventdata.target;
      var damage = source.data('current damage');
      var buff = source.getBuff('wk-lifesteal');
      var bonus = buff.data('percentage') / 100;
      source.heal(damage * bonus);
    },
    death: function (event, eventdata) {
      var source = eventdata.target;
      var side = source.side();
      var team = $('.table .card.heroes.'+side);
      team.removeBuff('wk-lifesteal');
      team.off('attack.wk-lifesteal');
    },
    reborn: function (event, eventdata) {
      var source = eventdata.target;
      var skill = source.data('wk-lifesteal');
      var side = source.side();
      var team = $('.table .card.heroes.'+side);
      source.addBuff(team, skill);
      team.on('attack.wk-lifesteal', this.attack);
    }
  },
  crit: {
    passive: function (skill, source) {
      source.selfBuff(skill);
      source.on('attack.wk-crit', this.attack);
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var buff = source.getBuff('wk-crit');
      var damage = source.data('current damage');
      var chance = buff.data('chance') / 100;
      var bonus = (buff.data('percentage') / 100);
      if (game.random() < chance) {
        source.damage(damage * bonus, target, 'critical');
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
      wk.off('death.wk-ult');
    },
    turnstart: function (event, eventdata) {
      var wk = eventdata.target;
      var buff = wk.getBuff('wk-ult');
      var range = buff.data('range');
      var skill = buff.data('skill');
      var spot = wk.data('wk-ult-spot');
      var side = wk.side();
      spot.removeClass('cript');
      wk.reborn(spot, 'notowerpenalty');
      wk.opponentsInRange(range, function (target) {
        wk.addBuff(target, skill, 'ult-targets');
      });
      wk.removeBuff('wk-ult');
      wk.off(side + 'turnstart.wk-ult');
      wk.data('wk-ult-spot', null);
      if (game.mode == 'library') skill.appendTo(game[side].skills.sidehand);
      else skill.appendTo(game[side].skills.sidehand);
      game.shake();
    }
  }
};
