game.skills.kotl = {
  illuminate: {
    cast: function (skill, source, target) {
      var kotl = source;
      var direction = kotl.getDirectionStr(target);
      var side = kotl.side();
      skill.addClass('channel-on');
      kotl.selfBuff(skill, 'illuminate-channel');/*
      if (kotl.hasBuff('kotl-ult')) {
        var ghost = kotl.clone().removeClass('selected heroes can-attack can-move');
        ghost.addClass('illuminate-ghost ghost channeling');
        ghost.insertAfter(kotl);
        kotl.data('deck', game.data.ui.summon);
        kotl.data('illuminate-ghost', ghost);
        ghost.data('illuminate-source', kotl);
        ghost.data('channeling', skill.data('channel'));
        source = ghost;
      }*/
      source.addClass('illuminating illumi-'+direction);
      source.data('illuminate', skill);
      source.data('illuminate-target', target);
      source.on('channelend', this.channelend);
      skill.data('discard-to', game[side].skills.sidehand);
    },
    channelend: function (event, eventdata) { 
      var source = $(this);
      game.skills.kotl.illuminate.release(source);
    },
    release: function (source) { 
      var kotl = source.data('illuminate-source') || source;
      var target = source.data('illuminate-target');
      var skill = $('.table .skills .kotl-illuminate.'+kotl.side());
      var damage = skill.data('damage');
      var range = skill.data('aoe range');
      if (kotl.data('skill range bonus')) range += kotl.data('skill range bonus');
      var width = skill.data('aoe width');
      var time = skill.data('channel') - source.data('channeling') + 1;
      source.opponentsInLine(target, range, width, function (card) {
        kotl.damage(damage * time, card, skill.data('damage type'));
      });
      if (!game.camera.hasClass('night')) {
        source.alliesInLine(target, range, width, function (card) {
          card.heal(damage * time);
        });
      }
      game.audio.stop('kotl/illuminate');
      game.audio.play('kotl/illuminaterelease');
      kotl.data('illuminate-target', null);
      kotl.off('turnend.kotl-illuminate');
      kotl.removeBuff('kotl-illuminate');
      kotl.removeClass('illuminating illumi-left illumi-right illumi-top illumi-bottom');
      skill.data('discard-to', false);
      skill.removeClass('channel-on').discard();
    }
  },
  blind: {
    cast: function (skill, source, target) {
      game.fx.add('kotl-blind', source, target);
      game.timeout(1200, function () {
        var side = source.side();
        var opponent = game.opponent(side);
        var card = $('.card', target);
        if (card.hasClass(opponent)) game.skills.kotl.blind.target(skill, source, card);
        target.inCross(1, 0, function (spot, dir) {
          var card = $('.card.'+opponent, spot);
          if (card.length && !card.hasClasses('towers ghost bkb')) {
            game.skills.kotl.blind.target(skill, source, card);
            var destiny = card.getDirSpot(dir);
            if (destiny && destiny.hasClass('free')) {
              card.move(destiny);
            }
          }
        });
      });
    },
    target: function (skill, source, target) {
      source.addBuff(target, skill);
      target.on('attack.kotl-blind', this.attack);
      target.stopChanneling();
      source.damage(skill.data('damage'), target, skill.data('damage type'));
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var buff = source.getBuff('kotl-blind');
      var misschance = buff.data('miss') / 100;
      if (game.random() < misschance) {
        source.data('miss-attack', true);
      }
    }
  },
  mana: {
    cast: function (skill, source) {
      var side = source.side();
      var bonus = skill.data('bonus cards');
      game.skill.buyCards(bonus, side);
      game.fx.add('kotl-mana', source);
    }
  },
  ult: {
    cast: function (skill, source, target) {
      var kotl = source;
      game.fx.add('kotl-ult', source, target);
      game.timeout(800, function () {
        var side = source.side();
        var opponent = game.opponent(side);
        var card = $('.card', target);
        var range = skill.data('aoe range');
        if (kotl.data('skill range bonus')) range += kotl.data('skill range bonus');
        if (card.hasClass(opponent)) game.skills.kotl.ult.target(skill, source, card);
        target.inRange(range, function (spot) {
          var card = $('.card.'+opponent, spot);
          if (card.length && !card.hasClasses('tower ghost bkb')) {
            game.skills.kotl.ult.target(skill, source, card);
          }
        });
      });
    },
    target: function (skill, source, target) {
      source.addBuff(target, skill);
      target.addClass('sleeping');
      target.on('attacked.kotl-ult', this.attacked);
      target.stopChanneling();
    },
    attacked: function (event, eventdata) {
      var target = eventdata.target;
      target.removeBuff('kotl-ult');
      target.removeClass('sleeping');
    }
  }
};
