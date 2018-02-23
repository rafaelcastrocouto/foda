game.skills.kotl = {
  illuminate: {
    cast: function (skill, source, target) {
      var kotl = source;
      var direction = kotl.getDirectionStr(target);
      var side = kotl.side();
      skill.addClass('channel-on');
      kotl.selfBuff(skill, 'illuminate-channel');
      if (kotl.hasBuff('kotl-ult')) {
        var ghost = kotl.clone().removeClass('selected heroes can-attack can-move');
        ghost.addClass('illuminate-ghost ghost channeling');
        ghost.insertAfter(kotl);
        kotl.data('deck', game.data.ui.summon);
        kotl.data('illuminate-ghost', ghost);
        ghost.data('illuminate-source', kotl);
        ghost.data('channeling', skill.data('channel'));
        source = ghost;
      }
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
      if (source.hasClass('ghost')) {
        source.alliesInLine(target, range, width, function (card) {
          card.heal(damage * time);
        });
      }
      game.audio.stop('kotl/illuminate');
      game.audio.play('kotl/illuminaterelease');
      kotl.data('illuminate-target', null);
      kotl.data('illuminate-ghost', null);
      kotl.off('turnend.kotl-illuminate');
      kotl.removeBuff('kotl-illuminate');
      kotl.removeClass('illuminating illumi-left illumi-right illumi-top illumi-bottom');
      if (source.hasClass('ghost')) source.discard();
      skill.data('discard-to', false);
      skill.removeClass('channel-on').discard();
    }
  },
  leak: {
    cast: function (skill, source, target) {
      source.addBuff(target, skill);
      target.shake();
      target.data('kotl-leak', skill);
      target.on('moved.kotl-leak', this.moved);
      game.skills.kotl.leak.discard(target, source, skill);
    },
    moved: function (event, eventdata) {
      var target = eventdata.card;
      target.shake();
      if (target.hasBuff('kotl-leak')) {
        var buff = target.getBuff('kotl-leak');
        var source = buff.data('source');
        var skill = target.data('kotl-leak');
        game.skills.kotl.leak.discard(target, source, skill);
      } else {
        target.off('moved.kotl-leak');
      }
    },
    discard: function (target, source, skill) {
      var hero = target.data('hero');
      var opponent = target.side();
      var card = $('.'+opponent+' .hand .'+hero).randomCard();
      if (card.length) card.discard();
      else source.addStun(target, skill);
    }
  },
  mana: {
    cast: function (skill, source) {
      var side = source.side();
      var bonus = skill.data('bonus cards');
      game.skill.buyCards(bonus, side);
    }
  },
  ult: {
    cast: function (skill, source) {
      var side = source.side();
      if (!source.hasBuff('kotl-ult')) {
        var illuminate = $('.table .'+side+' .skills .kotl-illuminate');
        //skill.addClass('on');
        source.on('turnend.kotl-ult', this.turnend);
        source.addClass('kotl-ult');
        source.data('kotl-ult', skill);
        illuminate.data('type', game.data.ui.active);
        illuminate.find('.type').text(game.data.ui.active);
        illuminate.addClass('spiritform');
      }
      source.selfBuff(skill);
      var recall = $('.table .'+side+' .skills .kotl-recall');
      if (recall.parent()[0] !== game[side].skills.hand[0]);
        recall.appendTo(game[side].skills.hand);
      var blind = $('.table .'+side+' .skills .kotl-blind');
      if (blind.parent()[0] !== game[side].skills.hand[0]);
        blind.appendTo(game[side].skills.hand);
    },
    turnend: function (event, eventdata) {
      var source = eventdata.target;
      if (!source.hasBuff('kotl-ult')) {
        game.skills.kotl.ult.off(source);
      }
    },
    off: function (source, event) {
      var side = source.side();
      var recall = $('.table .'+side+' .skills .kotl-recall');
      var blind = $('.table .'+side+' .skills .kotl-blind');
      var illuminate = $('.table .'+side+' .skills .kotl-illuminate');
      var skill = source.data('kotl-ult');
      if (event) source.removeBuff('kotl-ult');
      skill.removeClass('on');
      illuminate.data('type', game.data.ui.channel);
      illuminate.removeClass('spiritform');
      var ghost = source.data('illuminate-ghost');
      if (ghost) {
        game.skills.kotl.illuminate.release(ghost.data('skill'), ghost);
      }
      source.off('turnend.kotl-ult');
      source.removeClass('kotl-ult');
      source.data('kotl-ult', null);
      recall.discard();
      blind.discard();
    },
    channelend: function (event, eventdata) {
      this.off(eventdata.source, true);
    }
  },
  blind: {
    cast: function (skill, source, target) {
      var side = source.side();
      var opponent = game.opponent(side);
      var card = $('.card', target);
      if (card.hasClass(opponent)) game.skills.kotl.blind.target(skill, source, card);
      target.inCross(1, 0, function (spot, dir) {
        var card = $('.card.'+opponent, spot);
        if (card.length && !card.hasClasses('tower ghost bkb')) {
          game.skills.kotl.blind.target(skill, source, card);
          var destiny = card.getDirSpot(dir);
          if (destiny && destiny.hasClass('free')) {
            card.move(destiny);
          }
        }
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
  recall: {
    cast: function (skill, source, target) {
      var buff = source.addBuff(target, skill);
      buff.on('expire.kotl-recall', this.expire);
      target.on('damage.kotl-recall', this.damage);
      target.data('recall-source', source);
      target.data('recall-skill', skill);
    },
    damage: function (event, eventdata) {
      var target = eventdata.target;
      target.removeBuff('kotl-recall');
    },
    expire: function (event, eventdata) {
      var target = eventdata.target;
      var source = target.data('recall-source');
      var destiny;
      source.around(game.data.ui.melee, function (spot) {
        if (spot.hasClass('free') && target.data('recall-skill')) destiny = spot;
      });
      if (destiny && !target.hasClasses('bkb cycloned')) {
        target.stopChanneling();
        target.place(destiny);
        game.audio.play('kotl/recallend');
        target.data('recall-source', null);
        target.data('recall-skill', null);
        target.off('damage.kotl-recall');
      }
    }
  }
};
