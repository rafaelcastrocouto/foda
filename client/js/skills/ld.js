game.skills.ld = {
  bear: {
    cast: function (skill, source, target) {
      var bear = $('#'+source.data('bear'));
      var side = source.side();
      var returnskill = $('.table .'+side+' .temp.skills .ld-bearreturn');
      if(!bear.length) {
        bear = source.summon(skill);
        source.data('bear', bear.attr('id'));
        source.data('summon', bear.attr('id'));
        source.data('return', returnskill.attr('id'));
        source.addBuff(bear, skill, 'demolish-source');
        source.addBuff(bear, skill, 'entangle-source');
        source.on('pre-attacked.defender', this.transfer);
        source.on('death', this.death);
        bear.on('pre-attack', this.attack);
        bear.on('death', this.beardeath);
        bear.data('return', returnskill.attr('id'));
        bear.data('death damage', skill.data('death damage'));
      }
      source.addBuff(bear, skill, 'defender-source');
      returnskill.appendTo(game[side].skills.sidehand).removeClass('casted');
      bear.setCurrentHp(bear.data('hp'));
      game.fx.add('ld-return-target', target);
      game.timeout(400, function () {
        bear.place(target);
      });
    },
    transfer: function (event, eventdata) {
      var target = eventdata.target;
      var bear = $('#'+target.data('bear'));
      if (bear) {
        var source = eventdata.source;
        var damage = eventdata.damage;
        var buff = bear.getBuff('defender-source');
        var transfer = buff.data('damage transfer');
        if (damage > transfer) {
          eventdata.bonus += -1 * transfer;
          source.damage(transfer, bear, game.data.ui.pure);
        }
      }
    },
    attack: function (event, eventdata) { 
      var target = eventdata.target;
      var source = eventdata.source;
      if (!source.data('miss-attack')) {
        if (target.hasClass('towers')) { 
          var demolish = source.getBuff('demolish-source');
          eventdata.bonus += demolish.data('tower bonus');
        } else if (target.side() == source.opponent()) {
          var entangle = source.getBuff('entangle-source');
          var chance = entangle.data('chance') / 100;
          if (game.random() < chance) {
            game.audio.play('bear/entangle');
            target.addStack('rooted');
            game.fx.add('ld-root', source, target, 'keep');
            target.on('turnend.entangle-target', game.skills.ld.bear.turnend);
            var skill = game.data.skills.ld.bear;
            var targetBuff = source.addBuff(target, skill, "entangle-target");
            target.stopChanneling();
          }
        }
      }
    },
    turnend: function (event, eventdata) {
      var target = eventdata.target;
      if (target.hasBuff('entangle-target')) {
        var targetBuff = target.getBuff('entangle-target');
        var source = $('#'+targetBuff.data('source'));
        source.damage(targetBuff.data('dot'), target, targetBuff.data('damage type'));
      } else {
        target.removeStack('rooted');
        $('.fx.ld-root', target).addClass('reverse');
        game.timeout(1400, game.fx.stop.bind(this, 'ld-root', target));
        target.off('turnend.entangle-target');
      }
    },
    beardeath: function (event, eventdata) {
      var bear = eventdata.target;
      var killer = eventdata.source;
      var ld = $('#'+bear.data('summoner'));
      if (bear.side() != killer.side()) killer.damage(bear.data('death damage'), ld, game.data.ui.pure);
      var returnSkill = $('#'+bear.data('return'));
      returnSkill.discard();
      ld.off('pre-attacked.defender');
      ld.data('bear', null);
      ld.data('summon', null);
    },
    death: function (event, eventdata) {
      var ld = eventdata.target;
      var returnSkill = $('#'+ld.data('return'));
      returnSkill.discard();
      var bear = $('#'+ld.data('bear'));
      bear.discard();
    }
  },
  bearreturn: {
    cast: function (skill, source, target) {
      var bear = $('#'+source.data('bear'));
      game.fx.add('ld-return', bear.parent());
      game.timeout(400, function() {
        bear.addClass('hidden');
        game.fx.add('ld-return-target', target);
      });
      game.timeout(800, function() {
        bear.removeClass('hidden').place(target);
      });
    }
  },
  link: {
    cast: function (skill, source) {
      source.selfBuff(skill);
      source.shake();
      game.fx.add('ld-link', source);
      var bear = $('#'+source.data('bear'));
      if (bear && !bear.hasClasses('bkb cycloned')) {
        source.addBuff(bear, skill);
        game.fx.add('ld-link', bear);
        bear.shake();
        source.on('attack', this.attack);
      }
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var damage = eventdata.damage;
      var buff = source.getBuff('ld-link');
      var bear = $('#'+source.data('bear'));
      if (buff && bear) {
        var lifesteal = buff.data('lifesteal') / 100;
        if (target.side() == source.opponent() && !source.data('miss-attack')) 
          bear.heal(damage * lifesteal);
      }
    }
  },
  roar: {
    cast: function (skill, source, target) {
      target.opponentsInRange(skill.data('range'), function (card) {
        target.damage(skill.data('damage'), card, skill.data('damage type'));
        card.stopChanneling();
      });
      game.fx.add('ld-roar', target);
      var range = skill.data('aoe range');
      var x = game.map.getX(target);
      var y = game.map.getY(target);
      if (source.opponent() === 'enemy') { //bottom to top to prevent blocking
        this.scare(source, game.map.getSpot(x + 1, y - 1));// top right
        this.scare(source, game.map.getSpot(  x  , y - 1));// top
        this.scare(source, game.map.getSpot(x - 1, y - 1));// top left
        this.scare(source, game.map.getSpot(x + 1,   y  ));// right
        this.scare(source, game.map.getSpot(x - 1,   y  ));// left
        this.scare(source, game.map.getSpot(x + 1, y + 1));// bottom right
        this.scare(source, game.map.getSpot(  x  , y + 1));// bottom
        this.scare(source, game.map.getSpot(x - 1, y + 1));// bottom left
      } else { //top to bottom to prevent blocking)
        this.scare(source, game.map.getSpot(x + 1, y + 1));// bottom right
        this.scare(source, game.map.getSpot(  x  , y + 1));// bottom
        this.scare(source, game.map.getSpot(x - 1, y + 1));// bottom left
        this.scare(source, game.map.getSpot(x + 1,   y  ));// right
        this.scare(source, game.map.getSpot(x - 1,   y  ));// left
        this.scare(source, game.map.getSpot(x + 1, y - 1));// top right
        this.scare(source, game.map.getSpot(  x  , y - 1));// top
        this.scare(source, game.map.getSpot(x - 1, y - 1));// top left
      }
      target.reselect();
    },
    scare: function (source, spot) {
      var opponent = source.opponent();
      var target = spot.find('.card.' + opponent);
      if (spot && target.length && !target.hasClasses('ghost bkb cycloned rooted stunned disabled')) {
        // console.log(target)
        var x = game.map.getX(spot),
            y = game.map.getY(spot);
        var ny = 1;
        if (opponent === 'enemy') ny = -1;
        var upSpot = game.map.getSpot(x, y + ny);
        if (upSpot && upSpot.hasClass('free')) {
          target.stopChanneling();
          target.removeInvisibility();
          target.move(upSpot);
          target.parent().addClass('free');
          target.shake();
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
        if (!source.data('ld-cry')) {
          cry.appendTo(game[side].skills.hand);
          source.data('ld-cry', true);
          source.on('turnstart', function () {
            $(this).data('ld-cry', false);
          });
        }
        source.selfBuff(skill);
        source.setRange(game.data.ui.melee);
        game.fx.ult(skill);
      } else {
        source.removeClass('transformed');
        skill.removeClass('on');
        cry.discard();
        source.removeBuff('ld-ult');
        source.setRange(game.data.ui.long);
      }
    }
  },
  cry: {
    cast: function (skill, source) {
      source.selfBuff(skill);
      source.shake();
      game.fx.add('ld-cry', source);
      var bear = $('#'+source.data('bear'));
      if (bear && !bear.hasClasses('bkb cycloned')) {
        source.addBuff(bear, skill);
        game.fx.add('ld-cry', bear);
        bear.shake();
      }
      source.select();
    }
  }
};
