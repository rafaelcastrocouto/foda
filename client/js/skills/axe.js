game.skills.axe = {
  taunt: {
    cast: function (skill, source) {
      var buff = source.selfBuff(skill, 'taunt-self');
      buff.on('expire', this.expire);
      var range = skill.data('aoe range');
      var targetsList = [];
      source.opponentsInRange(range, function (targets) {
        game.timeout(400, targets.attack.bind(targets, source, 'force'));
        targets.addClass('taunted');
        source.addBuff(targets, skill, 'taunt-targets');
        targetsList.push(targets.attr('id'));
      });
      skill.data('taunted', JSON.stringify(targetsList));
    },
    expire: function (event, eventdata) {
      var buff = eventdata.buff;
      var source = $('#'+buff.data('source'));
      var skill = $('#'+buff.data('skill'));
      var targets = JSON.parse(skill.data('taunted'));
      for  (var i=0; i < targets.length; i++) {
        var id = targets[i];
        $('#'+id).removeClass('taunted');
      }
      source.data('taunted', false);
    }
  },
  enrage: {
    cast: function (skill, source, target) {
      var buff = source.addBuff(target, skill);
      source.damage(buff.data('dot'), target, buff.data('damage type'));
      buff.on('buffcount', this.buffcount);
      buff.on('expire', this.expire);
      target.on('kill.axe-enrage', this.expire);
    },
    buffcount: function (event, eventdata) {
      var target = eventdata.target;
      var buff = eventdata.buff;
      var source = $('#'+buff.data('source'));
      if (buff.data('duration') !== 1) 
        source.damage(buff.data('dot'), target, buff.data('damage type'));
    },
    expire: function (event, eventdata) {
      var source = eventdata.source;
      var buff = eventdata.buff;
      if (!source) source = $('#'+buff.data('source'));
      source.removeBuff('axe-enrage');
      source.off('kill.axe-enrage');
    }
  },
  counter: {
    passive: function (skill, source, target) {
      source.selfBuff(skill);
      source.on('attacked.axe-counter', this.counter);
    },
    counter: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var buff = target.getBuff('axe-counter');
      var chance = buff.data('chance') / 100;
      var skill = $('#'+buff.data('skill'));
      var range = target.data('range');
      if (game.random() < chance) {
        target.opponentsInRange(range, function (targets) {
          source.damage(skill.data('damage'), targets, skill.data('damage type'));
        }); 
      }
    }
  },
  ult: {
    cast: function (skill, source, target) {
      if (target.data('current hp') < target.data('hp')/3) {
        source.damage(target.data('current hp')+target.data('current armor'), target, skill.data('damage type'));  
      } else {
        source.damage(skill.data('damage'), target, skill.data('damage type'));        
      }
      setTimeout(function () {
        if (target.hasClass('dead')) {
          skill.appendTo(game[skill.side()].skills.hand).removeClass('casted');
        }
      }, 600);
      target.stopChanneling();
      game.fx.shake();
    }
  }
};
