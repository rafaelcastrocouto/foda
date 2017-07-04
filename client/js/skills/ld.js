game.skills.ld = {
  summon: {
    cast: function (skill, source, target) {
      var bear = source.data('bear');
      var side = source.side();
      if(!bear) {
        bear = source.summon(skill);
        source.data('bear', bear);
        source.data('summon', bear);
        source.addBuff(bear, skill, 'demolish-source');
        source.addBuff(bear, skill, 'entangle-source');
        bear.on('attack', this.attack);
        bear.on('death', this.death);
        bear.data('skill-summon', skill);
        bear.data('return', $('.table .'+side+' .temp.skills .ld-bearreturn'));
      }
      bear.data('return').appendTo(game[side].skills.sidehand);
      bear.setCurrentHp(bear.data('hp'));
      bear.addClass('done');
      bear.place(target);
    },
    attack: function (event, eventdata) {
      var target = eventdata.target;
      var source = eventdata.source;
      var skill = source.data('skill-summon');
      if (target.hasClass('towers')) {
        var demolish = source.getBuff('demolish-source');
        source.data('attack bonus', demolish.data('tower bonus'));
      } else {
        var entangle = source.getBuff('entangle-source');
        var chance = entangle.data('chance') / 100;
        if (game.random() < chance) {
          target.addClass('rooted');
          target.on('turnend.entangle-target', game.skills.ld.summon.turnend);
          var targetBuff = source.addBuff(target, skill, 'entangle-target');
          targetBuff.data('source', source);
          targetBuff.data('skill', skill);
          target.stopChanneling();
        }
      }
    },
    turnend: function (event, eventdata) {
      var target = eventdata.target;
      if (target.hasBuff('entangle-target')) {
        var targetBuff = target.getBuff('entangle-target');
        var source = targetBuff.data('source');
        source.damage(targetBuff.data('dot'), target, targetBuff.data('damage type'));
      } else {
        target.removeClass('rooted');
        target.off('turnend.entangle-target');
      }
    },
    death: function (event, eventdata) {
      var bear = eventdata.target;
      var killer = eventdata.source;
      var skill = bear.data('summon');
      var ld = bear.data('summoner');
      if (bear.side() != killer.side()) killer.damage(skill.data('death damage'), ld, game.data.ui.pure);
      var returnSkill = bear.data('return');
      returnSkill.discard();
      ld.data('bear', null);
      ld.data('summon', null);
    }
  },
  bearreturn: {
    cast: function (skill, source, target) {
      var bear = source.data('bear');
      bear.place(target);
    }
  },
  rabid: {
    cast: function (skill, source) {
      source.selfBuff(skill);
      source.shake();
      var bear = source.data('bear');
      if (bear) {
        source.addBuff(bear, skill);
        bear.shake();
      }
    }
  },
  roar: {
    cast: function (skill, source, target) {
      target.opponentsInRange(skill.data('range'), function (card) {
        target.damage(skill.data('damage'), card, skill.data('damage type'));
        card.stopChanneling();
      });
      this.opponent = source.opponent();
      var range = skill.data('aoe range');
      var x = game.map.getX(target);
      var y = game.map.getY(target);
      if (this.opponent === 'enemy') { //bottom to top to prevent blocking
        this.scare(game.map.getSpot(x + 1, y + 1));// bottom right
        this.scare(game.map.getSpot(  x  , y + 1));// bottom
        this.scare(game.map.getSpot(x - 1, y + 1));// bottom left
        this.scare(game.map.getSpot(x + 1,   y  ));// right
        this.scare(game.map.getSpot(x - 1,   y  ));// left
        this.scare(game.map.getSpot(x + 1, y - 1));// top right
        this.scare(game.map.getSpot(  x  , y - 1));// top
        this.scare(game.map.getSpot(x - 1, y - 1));// top left
      } else { //top to bottom to prevent blocking
        this.scare(game.map.getSpot(x + 1, y - 1));// top right
        this.scare(game.map.getSpot(  x  , y - 1));// top
        this.scare(game.map.getSpot(x - 1, y - 1));// top left
        this.scare(game.map.getSpot(x + 1,   y  ));// right
        this.scare(game.map.getSpot(x - 1,   y  ));// left
        this.scare(game.map.getSpot(x + 1, y + 1));// bottom right
        this.scare(game.map.getSpot(  x  , y + 1));// bottom
        this.scare(game.map.getSpot(x - 1, y + 1));// bottom left
      }
    },
    scare: function (spot) {
      if (spot) {
        var target = spot.find('.card.' + this.opponent);
        if (target.length) {
          var x = game.map.getX(spot),
              y = game.map.getY(spot);
          var ny = 1;
          if (this.opponent === 'enemy') ny = -1;
          var upSpot = game.map.getSpot(x, y + ny);
          if (upSpot && upSpot.hasClass('free')) {
            target.stopChanneling();
            target.place(upSpot);
            target.shake();
          }
        }
      }
    }
  },
  ult: {
    toggle: function (skill, source) {
      var side = source.side();
      var cry = $('.table .'+side+' .skills .ld-cry');
      if (!source.hasClass('transformed')) {
        source.addClass('transformed');
        skill.addClass('on');
        cry.appendTo(game[side].skills.hand);
        source.selfBuff(skill);
        source.data('range', game.data.ui.melee);
      } else {
        source.removeClass('transformed');
        skill.removeClass('on');
        cry.discard();
        source.removeBuff('ld-ult');
        source.data('range', game.data.ui.short);
      }
    }
  },
  cry: {
    cast: function (skill, source) {
      source.selfBuff(skill);
      source.shake();
      var bear = source.data('bear');
      if (bear) {
        source.addBuff(bear, skill);
        bear.shake();
      }
      skill.discard();
    }
  }
};
