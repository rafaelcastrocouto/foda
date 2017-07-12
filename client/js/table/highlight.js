game.highlight = {
  extendjQuery: function () {
    $.fn.extend({
      highlightSource: game.highlight.source,
      highlightAlly: game.highlight.ally,
      highlightTargets: game.highlight.targets,
      highlightAttack: game.highlight.attack,
      highlightMove: game.highlight.move,
      strokeSkill: game.highlight.strokeSkill,
      strokeAttack: game.highlight.strokeAttack,
      highlightArrows: game.highlight.highlightArrows,
      highlightCreep: game.highlight.highlightCreep
    });
  },
  map: function (event) {
    game.highlight.clearMap();
    if (game.selectedCard) {
      if (game.selectedCard.hasClasses('heroes units')) {
        game.selectedCard.strokeAttack();
        if (game.isPlayerTurn()) {
          if (game.mode == 'tutorial') {
            if (game.tutorial.lesson == 'Move') {
              game.selectedCard.highlightMove();
            } else if (game.tutorial.lesson == 'Attack') {
              game.selectedCard.highlightAttack();
            }
          } else {
            game.selectedCard.highlightMove();
            game.selectedCard.highlightAttack();
          }
        }
      }
      if (game.selectedCard.hasClass('skills')) {
        game.selectedCard.highlightSource();
        if (!game.selectedCard.hasAllClasses('channel-on')) game.selectedCard.strokeSkill();
        if (game.isPlayerTurn()) {
          game.selectedCard.highlightArrows();
          game.selectedCard.highlightTargets(event);
        }
        if (game.selectedCard.closest('.hand').length &&
            (game.mode != 'tutorial' || game.mode != 'library') &&
            game.isPlayerTurn()) {
          game.states.table.discard.attr('disabled', false);
        }
      }
      if (game.selectedCard.hasClass('towers')) {
        game.selectedCard.strokeAttack();
      }
      if (game.selectedCard.hasClass('units') && game.selectedCard.parent().is('.sidehand')) {
        game.selectedCard.highlightCreep();
      }
    }
  },
  source: function () {
    var skill = this;
    var hero = skill.data('hero');
    if (hero) $('.map .card.player.heroes.' + hero).addClass('source');
    return skill;
  },
  channelStop: function (event, skill, source) {
    source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.stopChanneling);
  },
  targets: function (event) {
    var skill = this, hero = skill.data('hero');
    var source = skill.data('source');
    if (!source || !source.length) {
      source = $('.map .source');
      skill.data('source', source);
    }
    if (hero) {
      if (source.hasClasses('heroes units')) {
        if (skill.data('type') === game.data.ui.passive) {
          game.highlight.passive(source);
        } else if (skill.data('type') === game.data.ui.toggle) {
          game.highlight.toggle(skill, source);
        } else if (skill.data('type') === game.data.ui.active ||
                   skill.data('type') === game.data.ui.channel) {
          game.highlight.active(event, source, skill);
        }
        if (skill.data('targets').indexOf(game.data.ui.summon) > 0) {
          var summon = source.data('summon');
          if (game.highlight.possible(summon)) {
            summon.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
          }
        }
      }
    }
    return skill;
  },
  active: function (event, source, skill) {
    var targets = skill.data('targets');
    if (source.canCast(skill)) {
      if (skill.hasClass('channel-on')) game.highlight.channelStop(event, skill, source);
      else {
        if (targets.indexOf(game.data.ui.self) >= 0) game.highlight.self(source);
        if (targets.indexOf(game.data.ui.ally) >= 0) game.highlight.ally(source, skill);
        if (targets.indexOf(game.data.ui.enemy) >= 0) game.highlight.enemy(source, skill);
        if (targets.indexOf(game.data.ui.sumonner) >= 0) game.highlight.summoner(source, skill);
        if (targets.indexOf(game.data.ui.spot) >= 0) {
          if (targets.indexOf(game.data.ui.range) >= 0) game.highlight.atRange(source, skill, (targets.indexOf(game.data.ui.free) >= 0));
          else if (targets.indexOf(game.data.ui.free) >= 0) game.highlight.freeSpots(source, skill);
          else {
            var aoe = skill.data('aoe');
            if (aoe === game.data.ui.radial) game.highlight.radial(source, skill);
            if (aoe === game.data.ui.linear) game.highlight.linear(source, skill);
          }
        }
      }
    }
  },
  passive: function (source) {
    if (!source.hasClass('dead')) {
      source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.passive);
    }
  },
  toggle: function (skill, source) {
    if (!source.hasClasses('dead stunned silenced hexed disabled sleeping cycloned taunted')) {
      source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.toggle);
    }
  },
  self: function (source) {
    source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
  },
  tower: function () {
    $('.map .player.tower').addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
  },
  ally: function (source, skill) {
    var range = skill.data('cast range');
    if (range === game.data.ui.global) {
      $('.map .player').not('.towers, .source, .ghost').addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
    } else {
      source.around(range, function (neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass('player') && !card.hasClass('towers')) {
          card.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
        }
      });
    }
  },
  enemy: function (source, skill) {
    var range = skill.data('cast range');
    if (range === game.data.ui.global) {
      $('.map .enemy').not('.towers').addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
    } else {
      source.inRange(range, function (neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass('enemy') && !card.hasClass('towers')) {
          card.addClass('casttarget').on('mouseup.highlight touchend.highlightd', game.player.cast);
        }
      });
    }
  },
  summoner: function (source, skill) {
    var summoner = source.data(game.data.ui.summoner);
    summoner.around(skill.data('cast range'), function (neighbor) {
      if (neighbor.hasClass('free')) {
        neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  freeSpots: function (source, skill) {
    source.around(skill.data('cast range'), function (neighbor) {
      if (neighbor.hasClass('free')) {
        neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  radial: function (source, skill) {
    source.around(skill.data('cast range'), function (neighbor) {
      var card = neighbor.find('.card');
      if (card.length) {
        card.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
      } else neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
    });
  },
  linear: function (source, skill) {
    var pos = source.getPosition(),
        range = skill.data('cast range'),
        width = skill.data('cast width');
    source.inCross(range, width, function (neighbor) {
      var card = neighbor.find('.card');
      if (card.length) {
        card.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
      } else neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
    });
  },
  atRange: function (source, skill, free) {
    var range = skill.data('cast range');
    source.atRange(range, function (spot) {
      if (!free || spot.hasClass('free')) spot.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
    });
  },
  move: function () {
    var card = this, speed;
    if (card.hasClass('player') && card.hasClasses('units heroes') && card.canMove()) {
      if (card.hasClass('selected')) card.addClass('draggable');
      speed = card.data('current speed');
      if (speed < 1) { return card; }
      if (speed > 3) { speed = 3; }
      card.inMovementRange(Math.round(speed), function (neighbor) {
        if (neighbor.hasClass('free')) { 
          neighbor.addClass('movearea').on('mouseup.highlight touchend.highlight', game.player.move); 
        }
      });
    }
    return card;
  },
  attack: function () {
    var source = this, pos, range;
    if (source.hasClass('player') && source.hasClasses('units heroes') && source.canAttack()) {
      if (source.hasClass('selected')) source.addClass('draggable');
      range = source.data('range');
      source.inRange(range, function (neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass('enemy')) { card.addClass('attacktarget').on('mouseup.highlight touchend.highlight', game.player.attack); }
        if (card[0] !== source[0] &&
            card.hasAllClasses('player units') && 
            card.data('current hp') < card.data('hp')/2 ) { card.addClass('attacktarget').on('mouseup.highlight touchend.highlight', game.player.attack); }
      });
    }
    return source;
  },
  strokeAttack: function () {
    var card = this;
    if (!card.hasClasses('dead stunned disabled disarmed hexed')) {
      card.radialStroke(card.data('range'), card.side() + 'attack');
    }
    return card;
  },
  strokeSkill: function () {  
    var skill = this,
      hero = skill.data('hero'),
      source = $('.map .source');
    if (hero) {
      game.skill.castsource = source;
      game.skill.castrange = skill.data('cast range') || skill.data('stroke range');
      if (skill.data('aoe')) {
        game.skill.aoe = skill.data('aoe');
        game.skill.aoewidth = skill.data('aoe width');
        game.skill.aoerange = skill.data('aoe range');
        game.skill.castwidth = skill.data('cast width');
        game.map.el.addClass('aoe');
        $('.map .spot').on('mouseover.highlight mouseleave.highlight', game.highlight.hover);
      }
      if (game.skill.aoe === game.data.ui.linear) {
        source.crossStroke(game.skill.aoerange, game.skill.aoewidth, 'skillstroke');
        if (game.skill.castrange && !skill.hasClass('channel-on')) {
          source.crossStroke(game.skill.castrange, game.skill.castwidth, 'skillstroke');
        }
      } else if (game.skill.castrange) {
        source.radialStroke(game.skill.castrange, 'skillstroke');
      }
      if (skill.data('targets').indexOf(game.data.ui.summon) > 0) {
        var summon = source.data('summon');
        if (game.highlight.possible(summon)) {
          game.skill.summonHover = true;
          summon.radialStroke(game.skill.castrange, 'skillstroke');
        }
      }
    }
    return skill;
  },
  hover: function (event) {
    var spot = $(this);
    if (game.map.el.hasClass('aoe')) {
      $('.map .spot').removeClass('skillstroke skillhoverstroke stroke top right left bottom toparrow bottomarrow leftarrow rightarrow');
      $('.map .card').removeClass('toparrow bottomarrow leftarrow rightarrow');
      if (spot.hasClass('targetarea') || spot.find('.casttarget').length) {
        game.highlight.strokeAtCursor(spot);
      } else game.highlight.strokeAtCaster();
    }
  },
  strokeAtCursor: function (spot) {
    game.selectedCard.highlightArrows(spot);
    if (game.skill.aoe === game.data.ui.linear) {
      spot.linearStroke(game.skill.aoerange, game.skill.aoewidth, 'skillhoverstroke');
      spot.find('.card').crossStroke(game.skill.castrange, game.skill.castwidth, 'skillstroke');
    } else if (game.skill.aoe === game.data.ui.radial) {
      spot.radialStroke(game.skill.aoerange, 'skillhoverstroke');
    }
  },
  strokeAtCaster: function () {
    game.selectedCard.highlightArrows();
    if (game.skill.aoe === game.data.ui.linear) {
      game.skill.castsource.crossStroke(game.skill.aoerange, game.skill.aoewidth, 'skillstroke');
      game.skill.castsource.crossStroke(game.skill.castrange, game.skill.castwidth, 'skillstroke');
    } else if (game.skill.aoe === game.data.ui.radial) {
      game.skill.castsource.radialStroke(game.skill.castrange, 'skillstroke');
      if (game.skill.summonHover) {
        var summon = game.skill.castsource.data('summon');
        if (game.highlight.possible(summon)) {
          summon.radialStroke(game.skill.castrange, 'skillstroke');
        }
      }
    }
  },
  possible: function (unit) {
    return (unit && game.map.el.has(unit));
  },
  highlightArrows: function (spot) {
    var skill = this,
        source = $('.map .source'),
        range = skill.data('aoe range');
    if (this.data('highlight') == 'top') {
      // LD roar
      var summon = source.data('summon');
      if (spot) {
        spot.around(range, function (neighbor) {
          neighbor.addClass('toparrow');
          $('.card.enemy', neighbor).addClass('toparrow');
        });
      } else {
        if (game.highlight.possible(summon)) {
          summon.around(range, function (neighbor) {
            neighbor.not(source.parent()).addClass('toparrow');
            $('.card.enemy', neighbor).addClass('toparrow');
          });
        }
        source.around(range, function (neighbor) {
          neighbor.addClass('toparrow');
          $('.card.enemy', neighbor).addClass('toparrow');
        });
      }
    }
    if (this.data('highlight') == 'in') {
      var width = skill.data('aoe width');
      if (spot) {
        // PUD hook
        var linedir = game.map.invertDirection(source.getDirectionStr(spot));
        source.inLine(spot, range, width, function (neighbor) {
          var card = $('.card', neighbor);
          if (card.length) card.addClass(linedir+'arrow');
          else neighbor.addClass(linedir+'arrow');
        }, 1);
      } else {
        // MAG ult
        source.inCross(range, width, function (neighbor, dir) {
          var invdir = game.map.invertDirection(dir);
          var card = $('.card', neighbor);
          if (card.length) card.addClass(invdir+'arrow');
          else neighbor.addClass(invdir+'arrow');
        }, 1);
      }
    }
    if (this.data('highlight') == 'out') {
      if (spot) {
        // KOTL blind
        spot.inCross(1, 0, function (neighbor, dir) {
          var card = $('.card.enemy', neighbor);
          if (card.length) card.addClass(dir+'arrow');
          else neighbor.addClass(dir+'arrow');
        });
      }
    }
  },
  highlightCreep: function () {
    game.player.tower.strokeAttack();
    $('.spot.playerarea.free').addClass('movearea').on('mouseup.highlight touchend.highlight', game.player.summonCreep);
  },
  clearMap: function () {
    game.skill.aoe = null;
    game.skill.aoerange = null;
    game.skill.aoewidth = null;
    game.skill.castrange = null;
    game.skill.castwidth = null;
    game.skill.castsource = null;
    game.skill.summonHover = null;
    game.map.el.removeClass('aoe');
    $('.map .card, .map .spot').clearEvents('highlight').removeClass('source stroke attacktarget casttarget movearea targetarea stroke playerattack enemyattack skillhoverstroke skillstroke top bottom left right toparrow bottomarrow leftarrow rightarrow');
  }
};
