game.skills.lina = {
  fire: {
    cast: function (skill, source, target) {
      game.fx.add('lina-fire', source, target, 'linear');
      var range = skill.data('aoe range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      var width = skill.data('aoe width');
      var damage = skill.data('damage');
      source.opponentsInLine(target, range, width, function (card) {
        game.timeout(900, source.damage.bind(source, damage, card, skill.data('damage type')));
      });
    }
  },
  stun: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      var opponent = source.opponent();
      var damage = skill.data('damage');
      game.fx.add('lina-stun', source, target);
      target.cardsInRange(range, function (card) {
        if (card.hasClass(opponent)) {
          game.timeout(900, source.damage.bind(source, damage, card, skill.data('damage type')));
          if (!target.hasClass('bkb')) source.addStun(card, skill);
        }
        if (card.hasClass('trees')) {
          game.tree.destroy(card);
        }
      });
    }
  },
  passive: {
    passive: function (skill, source) {
      source.addBuff(source, skill);
      source.on('cast', game.skills.lina.passive.cast);
    },
    cast: function (event, eventdata) {
      var source = eventdata.source;
      var buff = source.getBuff('lina-passive');
      var bonus = buff.data('cast damage bonus') || 0;
      if (!$('span', buff).length) buff.append($('<span>').text(bonus));
      else $('span', buff).text(bonus + Number($('span', buff).text()));
      game.fx.add('lina-passive', source, buff);
      source.setDamage(source.data('current damage') + bonus);
      source.on('turnend.passive', game.skills.lina.passive.turnend);
    },
    turnend: function () {
      var source = $(this);
      var buff = source.getBuff('lina-passive');
      var bonus = buff.data('cast damage bonus') || 0;
      source.setDamage(source.data('current damage') - bonus);
      source.off('turnend.passive');
      $('span', buff).remove();
      game.fx.stop('lina-passive', source);
    }
  },
  ult: {
    cast: function (skill, source, target) {
      game.fx.add('lina-ult', source, target, 'rotate');
      game.timeout(900, source.damage.bind(source, skill.data('damage'), target, skill.data('damage type')));
    }
  }
};
