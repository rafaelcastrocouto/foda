game.skills.kotl = {
  illuminate: {
    cast: function (skill, source, target) {
      var direction = source.getDirectionStr(target);
      skill.addClass('on');
      if (!source.hasBuff('kotl-ult')) {
        source.data('illuminate-target', target);
        source.data('illuminate', game.player.turn);
        source.addClass('illuminating illumi-'+direction);
        source.on('channelend', this.channelend);
      } else {
        var ghost = source.clone().removeClass('selected player').addClass('illuminate-ghost ghost illuminating illumi-'+direction).insertAfter(source);
        $('.current', ghost).detach();
        ghost.data('release-counter', skill.data('channel'));
        ghost.data('skill', skill);
        ghost.data('source', source);
        ghost.data('illuminate', game.player.turn);
        ghost.data('illuminate-target', target);
        source.data('illuminate-ghost', ghost);
        ghost.on('turnend.kotl-illuminate', this.turnend);
        var side = source.side();
        $('.table .'+side+' .skills .kotl-illuminate').addClass('done');
        game.timeout(400, function () {
          var side = this.side;
          var skill = this.skill;
          skill.appendTo(game[side].skills.sidehand).removeClass('done');
        }.bind({side: side, skill: skill}));
      }
    },
    channelend: function (event, eventdata) {
      var source = eventdata.source;
      var skill = eventdata.skill;
      if (!source.hasBuff('kotl-ult')) {
        game.skills.kotl.illuminate.release(skill, source);
      } else {
        game.skills.kotl.illuminate.release(skill, source.data('illuminate-ghost'));
      }
    },
    turnend: function (event, eventdata) {
      var ghost = eventdata.target;
      var counter = ghost.data('release-counter');
      var source = ghost.data('source');
      if (counter) {
        counter--;
        ghost.data('release-counter', counter);
      } else {
        game.skills.kotl.illuminate.release(ghost.data('skill'), ghost);
      }
    },
    release: function (skill, source) { 
      var kotl = source.data('source') || source;
      var target = source.data('illuminate-target');
      var time = game.player.turn - source.data('illuminate') + 1;
      var damage = skill.data('damage');
      var range = skill.data('aoe range');
      var width = skill.data('aoe width');
      skill.removeClass('on');
      source.opponentsInLine(target, range, width, function (card) {
        kotl.damage(damage * time, card, skill.data('damage type'));
      }, kotl);
      source.data('illuminate', null);
      source.data('illuminate-target', null);
      source.data('illuminate-ghost', null);
      source.off('turnend.kotl-illuminate');
      source.removeClass('illuminating illumi-left illumi-right illumi-top illumi-bottom');
      if (source.hasClass('illuminate-ghost')) source.detach();
      var side = kotl.side();
      $('.table .'+side+' .skills .kotl-illuminate').removeClass('done');
    }
  },
  leak: {
    cast: function (skill, source, target) {
      source.addBuff(target, skill);
      target.shake();
      target.on('move.kotl-leak', this.move);
    },
    move: function (event, eventdata) {
      var target = eventdata.card;
      if (target.hasBuff('kotl-leak')) {
        var hero = target.data('hero');
        var opponent = target.side();
        $('.'+opponent+' .hand .'+hero).randomCard().discard();
      } else {
        target.off('move.kotl-leak');
      }
    }
  },
  mana: {
    cast: function (skill, source) {
      var side = source.side();
      var bonus = skill.data('bonus cards');
      game[side].buyCards(bonus);
    }
  },
  ult: {
    cast: function (skill, source) {
      var side = source.side();
      if (!source.hasBuff('kotl-ult')) {
        var recall = $('.table .'+side+' .skills .kotl-recall');
        var blind = $('.table .'+side+' .skills .kotl-blind');
        var illuminate = $('.table .'+side+' .skills .kotl-illuminate');
        skill.addClass('on');
        source.selfBuff(skill);
        source.on('turnend.kotl-ult', this.turnend);
        source.addClass('kotl-ult');
        source.data('kotl-ult', skill);
        illuminate.data('type', game.data.ui.active);
        illuminate.find('.type').text(game.data.ui.active);
        illuminate.addClass('spiritform');
        recall.appendTo(game.player.skills.hand);
        blind.appendTo(game.player.skills.hand);
      } else {
        this.off(source, true);
      }
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
    source.addBuff(target, skill);
    target.on('attack.kotl-blind', this.attack);
    target.inCross(1, 0, function (spot, dir) {
      var card = $('.card.'+opponent, spot);
      if (card.length && !card.hasClasses('tower ghost')) {
        source.addBuff(card, skill);
        card.on('attack.kotl-blind', this.attack);
        var destiny = card.getDirSpot(dir);
        if (destiny && destiny.hasClass('free')) {
          card.place(destiny);
        }
      }
    });
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
      if (destiny) {
        target.stopChanneling();
        target.place(destiny);
        target.data('recall-source', null);
        target.data('recall-skill', null);
        target.off('damage.kotl-recall');
      }
    }
  }
};
