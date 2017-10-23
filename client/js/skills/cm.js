game.skills.cm = {
  slow: {
    cast: function (skill, source, target) {
      var opponent = source.opponent();
      var range = skill.data('aoe range');
      game.fx.add('slow', source, target);
      target.inRange(range, function (spot) {
        var card = spot.find('.card');
        if (card.hasClass(opponent)) {
          game.timeout(900, source.damage.bind(source, skill.data('damage'), card, skill.data('damage type')));
          source.addBuff(card, skill);
        }
      });
    }
  },
  passive: {
    passive: function (skill, source) {
      var side = source.side();
      game[side].cardsPerTurn += 1;
      source.on('death.cm-aura');
      source.on('reborn.cm-aura');
      source.selfBuff(skill);
    },
    death: function (event, eventdata) {
      var target = eventdata.target;
      var side = target.side();
      game[side].cardsPerTurn -= 1;
    },
    reborn: function (event, eventdata) {
      var target = eventdata.target;
      var side = target.side();
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
      buff.on('expire', this.expire);
    },
    buffcount: function (event, eventdata) {
      var target = eventdata.target;
      var buff = eventdata.buff;
      var source = buff.data('source');
      if (buff.data('duration') !== 2) 
        source.damage(buff.data('dot'), target, buff.data('damage type'));
    },
    expire: function (event, eventdata) {
      var target = eventdata.target;
      target.removeClass('rooted disarmed');
    }
  },
  ult: {
    cast: function (skill, source) {
      source.addClass('cm-ult');
      source.selfBuff(skill, 'ult-source');
      game.skills.cm.ult.damage(source, skill);
      source.on('channel', this.channel);
      source.on('channelend', this.channelend);
    },
    channel: function (event, eventdata) {
      var source = eventdata.source;
      if ( source.data('channeling') === 0) {
        game.audio.play('cm/ult');
        game.skills.cm.ult.damage(source, eventdata.skill);
      }
    },
    damage: function (source, skill) {
      game.shake();
      var range = skill.data('aoe range');
      source.opponentsInRange(range, function (target) {
        game.timeout(900, source.damage.bind(source, skill.data('damage'), target, skill.data('damage type')));
        source.addBuff(target, skill, 'ult-targets');
        game.fx.add('ult', source, target, 'random');
      });
    },
    channelend: function (event, eventdata) {
      var source = eventdata.source;
      source.data('cm-ult', null);
      source.removeClass('cm-ult');
      source.removeBuff('cm-ult');
    }
  }
};
