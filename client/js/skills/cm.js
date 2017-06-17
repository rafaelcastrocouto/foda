game.skills.cm = {
  slow: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      target.opponentsInRange(range, function (card) {
        source.damage(skill.data('damage'), card, skill.data('damage type'));
        source.addBuff(card, skill);
      }, source);
    }
  },
  aura: {
    passive: function (skill, source) {
      var side = source.side();
      game[side].cardsPerTurn += 1;
      source.on('death.cm-aura');
      source.on('reborn.cm-aura');
      source.selfBuff(skill);
    },
    death: function (event, eventdata) {
      var cm = eventdata.target;
      var side = cm.side();
      game[side].cardsPerTurn -= 1;
    },
    reborn: function (event, eventdata) {
      var cm = eventdata.target;
      var side = cm.side();
      game[side].cardsPerTurn += 1;
    }
  },
  freeze: {
    cast: function (skill, source, target) {
      target.addClass('rooted disarmed');
      target.stopChanneling();
      var buff = source.addBuff(target, skill);
      source.damage(buff.data('dot'), target, buff.data('damage type'));
      buff.on('buffcount', this.buffcount);
    },
    buffcount: function (event, eventdata) {
      var target = eventdata.target;
      var buff = eventdata.buff;
      var source = buff.data('source');
      if (buff.data('duration') !== 2) source.damage(buff.data('dot'), target, buff.data('damage type'));
      if (buff.data('duration') === 0) {
        target.removeClass('rooted disarmed');
        target.off('turnend.cm-freeze');
      }
    }
  },
  ult: {
    cast: function (skill, source) {
      source.addClass('cm-ult');
      source.selfBuff(skill, 'ult-source');
      game.skills.cm.ult.damage(0, {source:source,skill:skill});
      source.on('channel', this.channel);
      source.on('channelend', this.channelend);
    },
    channel: function (event, eventdata) {
      if ( eventdata.source.data('channeling') === 0) game.skills.cm.ult.damage(event, eventdata);
    },
    damage: function (event, eventdata) {
      game.shake();
      var cm = eventdata.source;
      var skill = eventdata.skill;
      var range = skill.data('aoe range');
      cm.opponentsInRange(range, function (target) {
        cm.damage(skill.data('damage'), target, skill.data('damage type'));
        cm.addBuff(target, skill, 'ult-targets');
      });
    },
    channelend: function (event, eventdata) {
      var cm = eventdata.source;
      cm.data('cm-ult', null);
      cm.removeBuff('ult-source');
      cm.removeClass('cm-ult');
    }
  }
};
