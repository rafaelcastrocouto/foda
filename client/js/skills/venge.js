game.skills.venge = {
  stun: {
    cast: function (skill, source, target) {
      if (!target.hasClass('bkb')) source.addStun(target, skill);
      source.damage(skill.data('damage'), target, skill.data('damage type'));      
    }
  },
  corruption: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      var width = skill.data('aoe width');
      var damage = skill.data('damage');
      source.opponentsInLine(target, range, width, function (card) {
        source.damage(damage, card, skill.data('damage type'));
        if (!target.hasClass('bkb')) source.addBuff(card, skill);
      });
    }
  },
  aura: {
    passive: function (skill, source) {
      source.on('death.venge-aura', this.death);
      source.on('reborn.venge-aura', this.reborn);
      source.data('venge-aura', skill);
    },
    death: function (event, eventdata) {
      var target = eventdata.target;
      var side = target.side();
      var skill = target.data('venge-aura');
      var buff = skill.data('buff');
      game.timeout(200, function () {
        buff['damage bonus'] *= 2;
        skill.data('buff', buff);
        $('.table .card.'+side+':not(.skills)').each(function () {
          var ally = $(this);
          target.addBuff(ally, skill);
        });
      });
    },
    reborn: function (event, eventdata) {
      var target = eventdata.target;
      var side = target.side();
      var skill = target.data('venge-aura');
      $('.table .card.'+side+':not(.skills)').each(function () {
        var ally = $(this);
        ally.removeBuff('venge-aura');
      });
      var buff = skill.data('buff');
      buff['damage bonus'] /= 2;
      skill.data('buff', buff);
    }
  },
  ult: {
    cast: function (skill, source, target) {
      if (target.side() == source.side()) target.purge();
      target.stopChanneling();
      game.timeout(300, function(source, target) {
        var sourcePosition = source.getPosition();
        var targetPosition = target.getPosition();
        target.place(sourcePosition);
        source.place(targetPosition);
        game.timeout(100, game.skills.venge.ult.after.bind(this, source, target));
      }.bind(this, source, target));
    },
    after: function(source, target) {
      source.parent().removeClass('free');
      target.parent().removeClass('free');
      source.reselect();
    }
  }
};