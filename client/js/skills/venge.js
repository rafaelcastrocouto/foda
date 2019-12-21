game.skills.venge = {
  stun: {
    cast: function (skill, source, target) {
      if (!target.hasClass('bkb')) source.addStun(target, skill);
      source.damage(skill.data('damage'), target, skill.data('damage type'));
      game.timeout(200, game.fx.projectile.bind(this, source, target, 'venge-stun', 1.5));
      game.timeout(600, game.fx.add.bind(this, 'cat-leap', target.parent()));
    }
  },
  corruption: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      var width = skill.data('aoe width');
      var damage = skill.data('damage');
      var x = source.getX(), y = source.getY();
      var opponent = source.opponent();
      source.inLine(target, range, width, function (spot, i, j) {
        var t = Math.abs(180 * ((x-i)+(y-j)));
        var card = $('.card', spot);
        if (card.hasClass(opponent) && !card.hasClass('bkb')) {
          game.timeout(t, function () {
            source.damage(damage, card, skill.data('damage type'));
            source.addBuff(card, skill);
            game.fx.add('venge-corruption', spot, 0, 'random');
          });
        } else game.timeout(t, game.fx.add.bind(this, 'venge-corruption', spot, 0, 'random',0  ,'miss'));
      });
    }
  },
  aura: {
    passive: function (skill, source) {
      source.on('death.venge-aura', this.death);
      source.on('reborn.venge-aura', this.reborn);
      source.data('venge-aura', skill.attr('id'));
      game.fx.add('venge-aura', source);
      game.timeout(200, function () {
        var side = source.side();
        $('.table .map .card.'+side).each(function (i, el) {
          var card = $(el);
          if (card.hasBuff('venge-aura') && card[0] !== source[0]) 
            game.fx.add('venge-aura-target', card);
        });
      });
    },
    death: function (event, eventdata) {
      var target = eventdata.target;
      var side = target.side();
      var skill = $('#'+target.data('venge-aura'));
      var buff = JSON.parse(skill.data('buff'));
      game.timeout(200, function () {
        buff['damage bonus'] *= 2;
        skill.data('buff', JSON.stringify(buff));
        $('.table .card.'+side+':not(.skills)').each(function () {
          var ally = $(this);
          target.addBuff(ally, skill);
        });
      });
    },
    reborn: function (event, eventdata) {
      var target = eventdata.target;
      var side = target.side();
      var skill = $('#'+target.data('venge-aura'));
      $('.table .card.'+side+':not(.skills)').each(function () {
        var ally = $(this);
        ally.removeBuff('venge-aura');
      });
      var buff = JSON.parse(skill.data('buff'));
      buff['damage bonus'] /= 2;
      skill.data('buff', JSON.stringify(buff));
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
        game.fx.add('venge-ult', source, target, 'rotate',0,0,{scale: 2.2, offset:{x:-80}});
        game.fx.add('venge-ult', target, source, 'rotate',0,0,{scale: 2.2, offset:{x:-80}});
      }.bind(this, source, target));
    },
    after: function(source, target) {
      source.parent().removeClass('free');
      target.parent().removeClass('free');
      source.reselect();
    }
  }
};