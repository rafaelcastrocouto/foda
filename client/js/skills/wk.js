game.skills.wk = {
  stun: {
    cast: function (skill, source, target) {
      source.addStun(target, skill);
      target.data('wk-dot-count', 3);
      target.on('turnend.wk-stun', this.turnend.bind(this, source, target, skill));
      game.fx.projectile(source, target, skill);
      game.timeout(400, function(source, target, skill) {
        game.fx.add('wk-stun-hit', source, target);
        source.damage(skill.data('damage'), target, skill.data('damage type'));
      }.bind(this, source, target, skill));
    },
    turnend: function (source, target, skill) {
      var buff = skill.data('buff');
      var count = target.data('wk-dot-count');
      target.data('wk-dot-count', count - 1);
      if (count === 2) {
        buff = source.addBuff(target, skill);
        game.fx.add('wk-stun', source, buff);
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
      var buff = source.getBuff('wk-aura');
      if (buff) {
        var lifesteal = buff.data('lifesteal') / 100;
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
      var side = source.side();
      var buff = source.getBuff('wk-crit');
      var chance = buff.data('chance') / 100;
      var bonus = buff.data('multiplier');
      if (game.random() < chance && target.side() == source.opponent() && !source.data('miss-attack')) {
        source.data('critical-attack', bonus);
        var skeleton = game.units.clone( $('.table .'+side+' .temp.skills .wk-skeleton') );
        skeleton.appendTo('.table .'+side+' .sidehand.skills').on('mousedown touchstart', game.card.select);
      }
    }
  },
  skeleton: {
    cast: function (skill, source, target) {
      var skeleton = source.summon(skill);
      game.fx.add('ld-return-target', target);
      game.timeout(400, function () {
        skeleton.place(target);
      });
    }
  },
  ult: {
    passive: function (skill, source) {
      source.selfBuff(skill, 'ult-source');
      source.on('death.wk-ult', this.death);
      source.data('wk-ult', skill);
    },
    death: function (event, eventdata) {
      var wk = eventdata.target;
      var spot = eventdata.spot;
      var side = wk.side();
      spot.addClass('cript block').removeClass('free');
      wk.on(side + 'turnstart.wk-ult', game.skills.wk.ult.turnstart);
      wk.data('wk-ult-spot', spot);
    },
    turnstart: function (event, eventdata) {
      var wk = eventdata.target;
      var spot = wk.data('wk-ult-spot');
      var skill = wk.data('wk-ult');
      game.audio.play('wk/ult');
      game.fx.ult(skill, game.skills.wk.ult.reborn.bind(this, wk, spot, skill));
    },
    reborn: function (wk, spot, skill) { //console.log(wk, spot)
      var side = wk.side();
      var buff = game.data.skills.wk.ult.buffs.ult.source;
      var range = buff.range;
      if (wk.data('skill range bonus')) range += wk.data('skill range bonus');
      game.fx.shake();
      wk.reborn(spot);
      wk.addClass('can-attack');
      spot.removeClass('cript block');
      wk.opponentsInRange(range, function (target) { //console.log(target)
        if (!target.hasClass('bkb')) wk.addBuff(target, skill, 'ult-targets');
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
