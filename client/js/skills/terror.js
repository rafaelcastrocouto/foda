game.skills.terror = {
  summon: {
    cast: function (skill, source, target) {
      var image = $('#'+source.data('mirror image'));
      var side = source.side();
      if(!image.length) {
        image = source.summon(source);
        image.addClass('illusion');
        source.data('mirror image', image.attr('id'));
        source.data('summon', image.attr('id'));
      } else {
        source.resummon(image);
      }
      var hp = Math.floor(source.data('hp')/2);
      var damage = Math.floor(source.data('damage')/2);
      image.setHp(hp).setCurrentHp(hp);
      image.setDamage(damage).data('damage', damage);
      game.fx.add('ld-return-target', target);
      game.timeout(400, function () {
        image.place(target);
      });
    }
  },
  mirror: {
    cast: function (skill, source) {
      var range = skill.data('aoe range');
      if (source.data('skill range bonus')) range += source.data('skill range bonus');
      source.opponentsInRange(range, function (target) {
        game.timeout(400, source.damage.bind(source, target.data('current damage'), target, skill.data('damage type')));
      });
    }
  },
  morph: {
    cast: function (skill, source) {
      source.selfBuff(skill);
      if (source.data('mirror image')) {
        var image = $('#'+source.data('mirror image'));
        source.addBuff(image, skill);
      }
    }
  },
  ult: {
    cast: function (skill, source, target) {
      var sourcehp = source.data('current hp');
      source.setCurrentHp(target.data('current hp'));
      target.setCurrentHp(sourcehp);
      if (source.data('current hp') < source.data('current resistance'))
        source.setCurrentHp(source.data('current resistance'));
      if (target.data('current hp') < target.data('current resistance'))
        target.setCurrentHp(target.data('current resistance'));
    }
  }
};
