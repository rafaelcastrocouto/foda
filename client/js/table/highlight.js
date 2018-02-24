game.highlight = {
  extendjQuery: function() {
    $.fn.extend({
      highlightSource: game.highlight.source,
      highlightAlly: game.highlight.ally,
      highlightTargets: game.highlight.targets,
      highlightAttack: game.highlight.attack,
      highlightMove: game.highlight.move,
      strokeSkill: game.highlight.strokeSkill,
      strokeAttack: game.highlight.strokeAttack,
      highlightArrows: game.highlight.highlightArrows,
      highlightCreep: game.highlight.highlightCreep,
      radialStroke: game.highlight.radialStroke,
      crossStroke: game.highlight.crossStroke,
      linearStroke: game.highlight.linearStroke,
    });
  },
  map: function(event) { 
    game.highlight.clearMap();
    var card = game.selectedCard;
    if (game.selectedCard && !card.hasClass('nohighlight') && !game.lockHighlight) {
      if (card.hasClasses('heroes units')) {
        if (game.mode == 'tutorial') {
          if (game.tutorial.lesson !== 'Select' && game.tutorial.lesson !== 'Unselect' && game.tutorial.lesson !== 'Creep') {
            card.highlightMove();
          }
          if (game.tutorial.lesson !== 'Select' && game.tutorial.lesson !== 'Unselect' && game.tutorial.lesson !== 'Creep' && game.tutorial.lesson !== 'Move') {
            card.highlightAttack();
          }
        } else {
          card.highlightMove();
          card.highlightAttack();
        }
      }
      if (card.hasClass('skills')) {
        card.highlightSource();
        if (!card.hasClass('channel-on'))
          card.strokeSkill();
        if (card.canPlay()) {
          card.addClass('draggable');
          card.highlightArrows();
          card.highlightTargets(event);
        }
        if (card.closest('.hand').length && (game.mode != 'tutorial') && card.canPlay()) {
          game.skill.enableDiscard();
        }
      }
      if (card.hasClass('towers')) {
        card.strokeAttack();
      }
      if (card.hasClass('units') && card.parent().is('.sidehand')) {
        game[card.side()].tower.strokeAttack();
        if (card.canPlay())
          card.highlightCreep();
      }
      if (card.hasAllClasses('items buy')) {
        game.items.enableBuy();
      } else if (card.hasClass('items')) {
        game.items.enableSell();
        card.strokeSkill();
        if (card.canPlay()) {
          card.addClass('draggable');
          card.highlightArrows();
          card.highlightTargets(event);
        }
      }
    }
  },
  source: function() {
    var skill = this;
    var hero = skill.data('hero');
    if (hero)
      $('.map .card.' + skill.side() + '.heroes.' + hero).addClass('source');
    return skill;
  },
  channelStop: function(event, skill, source) {
    source.addClass('casttarget').on('mouseup.highlight', game.skill.activeStopChanneling);
  },
  targets: function(event) {
    var skill = this;
    var source = skill.data('source');
    if (!skill.hasClass('items')) {
      if (!source || !source.length) {
        source = $('.map .source');
        skill.data('source', source);
      }
    }
    if (skill.hasClass('items') || source.hasClasses('heroes units')) {
      if (skill.data('type') === game.data.ui.passive) {
        game.highlight.passive(source);
      } else if (skill.data('type') === game.data.ui.toggle) {
        game.highlight.toggle(skill, source);
      } else if (skill.hasClass('items')                    || 
                skill.data('type') === game.data.ui.active  || 
                skill.data('type') === game.data.ui.channel || 
                skill.data('type') === game.data.ui.summon) {
        game.highlight.active(event, source, skill);
      }
      var targets = skill.data('targets');
      if (targets && targets.indexOf(game.data.ui.summon) > 0) {
        var summon = source.data('summon');
        if (game.highlight.possible(summon)) {
          summon.addClass('casttarget').on('mouseup.highlight', game.player.cast);
        }
      }
    }
    return skill;
  },
  active: function(event, source, skill, sec) {
    var targets = skill.data('targets');
    if (sec) targets = skill.data('secondary targets');
    if (skill.hasClass('items') || source.canCast(skill) ) {
      if (skill.hasClass('channel-on'))
        game.highlight.channelStop(event, skill, source);
      else if (targets) {
        if (targets.indexOf(game.data.ui.tree) >= 0)
          game.highlight.tree(skill.side());
        if (targets.indexOf(game.data.ui.self) >= 0)
          game.highlight.self(source);
        if (targets.indexOf(game.data.ui.ally) >= 0)
          game.highlight.ally(source, skill);
        if (targets.indexOf(game.data.ui.enemy) >= 0)
          game.highlight.enemy(source, skill);
        if (targets.indexOf(game.data.ui.jungle) >= 0)
          game.highlight.jungle(source, skill);
        if (targets.indexOf(game.data.ui.sumonner) >= 0)
          game.highlight.summoner(source, skill);
        if (targets.indexOf(game.data.ui.spot) >= 0) {
          if (targets.indexOf(game.data.ui.range) >= 0)
            game.highlight.atRange(source, skill, (targets.indexOf(game.data.ui.free) >= 0));
          else if (targets.indexOf(game.data.ui.free) >= 0)
            game.highlight.freeSpots(source, skill);
          else {
            var aoe = skill.data('aoe');
            if (aoe === game.data.ui.radial)
              game.highlight.radial(source, skill);
            if (aoe === game.data.ui.linear)
              game.highlight.linear(source, skill);
          }
        }
      }
    }
  },
  passive: function(source) {
    if (!source.hasClass('dead')) {
      source.addClass('casttarget').on('mouseup.highlight', game.player.passive);
    }
  },
  toggle: function(skill, source) {
    if (!source.hasClasses('dead stunned silenced hexed disabled sleeping cycloned taunted')) {
      source.addClass('casttarget').on('mouseup.highlight', game.player.toggle);
    }
  },
  tree: function (side) {
    var t = 'rad';
    if (side == 'enemy') t = 'dire';
    $('.map .trees.'+t).addClass('casttarget').on('mouseup.highlight', game.player.cast);
  },
  self: function(source) {
    if (!source.hasClass('cycloned')) source.addClass('casttarget').on('mouseup.highlight', game.player.cast);
  },
  tower: function(side) {
    game[side].tower.addClass('casttarget').on('mouseup.highlight', game.player.cast);
  },
  ally: function(source, skill) {
    var range = skill.data('cast range');
    var side = skill.side();
    var targets = skill.data('targets');
    if (range === 'global' || skill.hasClass('items')) {
      if (skill.data('cycloned')) {
        if (targets && targets.indexOf(game.data.ui.heroes) >= 0) $('.map .card.' + side).not('.unit, .dead, .towers, .source, .ghost, .bkb').addClass('casttarget').on('mouseup.highlight', game.player.cast);
        else $('.map .card.' + side).not('.dead, .towers, .source, .ghost').addClass('casttarget').on('mouseup.highlight', game.player.cast);
      } else {
        if (targets && targets.indexOf(game.data.ui.heroes) >= 0) $('.map .card.' + side).not('.unit, .dead, .towers, .source, .ghost, .bkb, cycloned').addClass('casttarget').on('mouseup.highlight', game.player.cast);
        else $('.map .card.' + side).not('.dead, .towers, .source, .ghost, cycloned').addClass('casttarget').on('mouseup.highlight', game.player.cast);
      }
      if (skill.hasClass('items') && game.mode == 'library') {
        var opponent = skill.opponent();
        if (targets && targets.indexOf(game.data.ui.heroes) >= 0) $('.map .card.' + opponent).not('.unit, .dead, .towers, .source, .ghost, .bkb').addClass('casttarget').on('mouseup.highlight', game.player.cast);
        else $('.map .card.' + opponent).not('.dead, .towers, .source, .ghost, .bkb').addClass('casttarget').on('mouseup.highlight', game.player.cast);
      }
    } else {
      if (source.data('skill range bonus') && !skill.data('fixed range')) 
        range += source.data('skill range bonus');
      source.around(range, function(neighbor) {
        var card = $('.card', neighbor);
        if (skill.data('cycloned')) {
          if (card.hasClass(source.side()) && !card.hasClasses('dead towers ghost bkb')) {
            card.addClass('casttarget').on('mouseup.highlight', game.player.cast);
          }
        } else {
          if (card.hasClass(source.side()) && !card.hasClasses('dead towers ghost bkb cycloned')) {
            card.addClass('casttarget').on('mouseup.highlight', game.player.cast);
          }
        }
      });
    }
  },
  enemy: function(source, skill) {
    var range = skill.data('cast range');
    if (range === 'global' || !source) {
      if (skill.data('cycloned')) $('.map .' + skill.opponent()).not('.dead, .towers, .source, .ghost, .bkb').addClass('casttarget').on('mouseup.highlight', game.player.cast);
      else $('.map .' + skill.opponent()).not('.dead, .towers, .source, .ghost, .bkb, .cycloned').addClass('casttarget').on('mouseup.highlight', game.player.cast);
    } else {
      if (source.data('skill range bonus') && !skill.data('fixed range')) 
        range += source.data('skill range bonus');
      if (source.data('attack range bonus') && skill.data('attack cast range')) 
        range += source.data('attack range bonus');
      source.inRange(range, function(neighbor) {
        var card = $('.card', neighbor);
        if (skill.data('cycloned')) {
          if (card.hasClass(source.opponent()) && !card.hasClasses('dead towers ghost bkb'))
          card.addClass('casttarget').on('mouseup.highlight', game.player.cast);
        } else {
          if (card.hasClass(source.opponent()) && !card.hasClasses('dead towers ghost bkb cycloned'))
            card.addClass('casttarget').on('mouseup.highlight', game.player.cast);
        }
      });
    }
  },
  jungle: function(source, skill) {
    var range = skill.data('cast range');
    if (source.data('skill range bonus') && !skill.data('fixed range')) 
      range += source.data('skill range bonus');
    source.inRange(range, function(neighbor) {
      if (neighbor.hasAllClasses('jungle free') && !neighbor.hasClasses('block cript'))
        neighbor.addClass('targetarea').on('mouseup.highlight', game.player.cast);
    });
  },
  summoner: function(source, skill) {
    var summoner = source.data(game.data.ui.summoner);
    summoner.around(skill.data('cast range'), function(neighbor) {
      if (neighbor.hasClass('free') && !neighbor.hasClasses('block cript')) {
        neighbor.addClass('targetarea').on('mouseup.highlight', game.player.cast);
      }
    });
  },
  freeSpots: function(source, skill) {
    var range = skill.data('cast range');
    if (source.data('skill range bonus') && !skill.data('fixed range')) 
      range += source.data('skill range bonus');
    var doit = true;
    if (!(skill.data('summon available') && source.data('summon').hasClass('cycloned'))) {
      source.around(range, function(neighbor) {
        if (neighbor.hasClass('free') && !neighbor.hasClasses('block cript')) {
          neighbor.addClass('targetarea').on('mouseup.highlight', game.player.cast);
        }
      }); 
    }
  },
  radial: function(source, skill) {
    var range = skill.data('cast range');
    if (!range && skill.data('cast select')) range = skill.data('selected cast range');
    if (source.data('skill range bonus') && !skill.data('fixed range')) 
      range += source.data('skill range bonus');
    source.around(range, function(neighbor) {
      var card = neighbor.find('.card');
      if (card.length && !card.hasClass('invisible')) {
        card.addClass('casttarget').on('mouseup.highlight', game.player.cast);
      } else if (!neighbor.hasClasses('block cript')) {
        neighbor.addClass('targetarea').on('mouseup.highlight', game.player.cast);
      }
    });
  },
  linear: function(source, skill) {
    var pos = source.getPosition()
      , range = skill.data('cast range')
      , width = skill.data('cast width');
    if (source.data('skill range bonus') && !skill.data('fixed range') && !skill.data('fixed cast range'))
      range += source.data('skill range bonus');
    source.inCross(range, width, function(neighbor) {
      var card = neighbor.find('.card');
      if (card.length && !card.hasClass('invisible')) {
        card.addClass('casttarget').on('mouseup.highlight', game.player.cast);
      } else if (!neighbor.hasClasses('block cript')) 
        neighbor.addClass('targetarea').on('mouseup.highlight', game.player.cast);
    });
  },
  atRange: function(source, skill, free) {
    var range = skill.data('cast range');
    if (source.data('skill range bonus') && !skill.data('fixed range'))
      range += source.data('skill range bonus');
    source.atRange(range, function(spot) {
      if (!free || (spot.hasClass('free') && !spot.hasClass('cript block')))
        spot.addClass('targetarea').on('mouseup.highlight', game.player.cast);
    });
  },
  move: function() {
    var card = this, speed;
    if (card.canPlay() && card.hasClasses('units heroes') && card.canMove()) {
      if (card.hasClass('selected'))
        card.addClass('draggable');
      speed = card.data('current speed');
      if (speed > 1) {
        card.inMovementRange(Math.round(speed), function(neighbor) {
          if (neighbor.hasClass('free') && !neighbor.hasClass('block')) {
            neighbor.addClass('movearea').on('mouseup.highlight', game.player.move);
          }
        });
      }
    }
    return card;
  },
  attack: function() {
    var source = this, pos, range;
    if (!source.canPlay()) {
      source.strokeAttack();
    } else if ( source.canAttack() && source.canPlay() && source.hasClasses('units heroes')) {
      if (source.hasClass('selected'))
        source.addClass('draggable');
      source.strokeAttack();
      range = source.data('range');
      if (source.data('attack range bonus')) range += source.data('attack range bonus');
      source.inRange(range, function(neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass(source.opponent()) && !card.hasClasses('invisible ethereal cycloned')) {
          card.addClass('attacktarget').on('mouseup.highlight', game.player.attack);
        }
        // deny
        if (card[0] !== source[0] && card.hasAllClasses(source.side() + ' units') && card.data('current hp') < Math.floor(card.data('hp') / 3) && !card.hasClasses('ethereal cycloned')) {
          card.addClass('attacktarget').on('mouseup.highlight', game.player.attack);
        }
        //tree
        if (card.hasClass('trees') && source.hasClass('quelling')) {
          card.addClass('attacktarget').on('mouseup.highlight', game.player.attack);
        }
      });
    }
    return source;
  },
  strokeAttack: function() {
    var card = this;
    if (!card.hasClasses('dead stunned disabled disarmed hexed')) {
      var range = card.data('range');
      if (card.data('attack range bonus')) range += card.data('attack range bonus');
      card.radialStroke(range, card.side() + 'attack');
    }
    return card;
  },
  strokeSkill: function(source) {
    var skill = this
      , hero = skill.data('hero');
    if (!source) source = $('.map .source');
    if (hero || skill.hasClass('items')) {
      game.skill.castsource = source;
      game.skill.castrange = skill.data('cast range') || skill.data('stroke range');
      if (source.data('skill range bonus') && !skill.data('fixed range') && !skill.data('fixed cast range') ) 
        game.skill.castrange += source.data('skill range bonus');
      if (source.data('attack range bonus') && skill.data('attack cast range')) 
        game.skill.castrange += source.data('attack range bonus');
      if (skill.data('aoe')) {
        game.skill.aoe = skill.data('aoe');
        game.skill.aoewidth = skill.data('aoe width');
        game.skill.aoerange = skill.data('aoe range');
        if (source.data('skill range bonus') && !skill.data('fixed range')) 
          game.skill.aoerange += source.data('skill range bonus');
        game.skill.castwidth = skill.data('cast width');
        game.map.el.addClass('aoe');
        $('.map .spot').on('mouseover.highlight mouseleave.highlight', game.highlight.hover);
      }
      if (source) {
        if (game.skill.aoe === game.data.ui.linear) {
          source.crossStroke(game.skill.aoerange, game.skill.aoewidth, 'skillstroke');
          if (game.skill.castrange && !skill.hasClass('channel-on')) {
            source.crossStroke(game.skill.castrange, game.skill.castwidth, 'skillstroke');
          }
        } else if (game.skill.castrange) {
          source.radialStroke(game.skill.castrange, 'skillstroke');
        }
        if (skill.data('targets') && skill.data('targets').indexOf(game.data.ui.summon) > 0) {
          var summon = source.data('summon');
          if (game.highlight.possible(summon)) {
            game.skill.summonHover = true;
            summon.radialStroke(game.skill.castrange, 'skillstroke');
          }
        } 
      }
    }
    return skill;
  },
  hover: function(event) {
    var spot = $(this);
    if (game.map.el.hasClass('aoe')) {
      $('.map .spot').removeClass('skillstroke skillhoverstroke stroke top right left bottom toparrow bottomarrow leftarrow rightarrow');
      $('.map .card').removeClass('toparrow bottomarrow leftarrow rightarrow');
      if (spot.hasClass('targetarea') || spot.find('.casttarget').length) {
        if (!spot.hasClasses('block cript')) game.highlight.strokeAtCursor(spot);
      } else
        game.highlight.strokeAtCaster();
    }
  },
  strokeAtCursor: function(spot) {
    game.selectedCard.highlightArrows(spot);
    if (game.skill.aoe === game.data.ui.linear) {
      spot.linearStroke(game.skill.aoerange, game.skill.aoewidth, 'skillhoverstroke');
    } else if (game.skill.aoe === game.data.ui.radial) {
      spot.radialStroke(game.skill.aoerange, 'skillhoverstroke');
    }
  },
  strokeAtCaster: function() {
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
  possible: function(unit) {
    return (unit && game.map.el.has(unit) && !unit.hasClass('cycloned'));
  },
  highlightArrows: function(spot) {
    var skill = this
      , source = $('.map .source')
      , range = skill.data('aoe range')
      , opponent = source.opponent();
    if (this.data('highlight') == 'top') {
      // LD roar
      var summon = source.data('summon');
      var dir = 'top';
      if (source.side() == 'enemy')
        dir = 'bottom';
      if (spot) {
        spot.around(range, function(neighbor) {
          if (!neighbor.hasClasses('block cript')) neighbor.addClass(dir + 'arrow');
          $('.card.' + opponent, neighbor).addClass(dir + 'arrow');
        });
      } else {
        if (game.highlight.possible(summon)) {
          summon.around(range, function(neighbor) {
            if (!neighbor.hasClasses('block cript')) neighbor.not(source.parent()).addClass(dir + 'arrow');
            $('.card.' + opponent, neighbor).addClass(dir + 'arrow');
          });
        }
        source.around(range, function(neighbor) {
          if (!neighbor.hasClasses('block cript')) neighbor.addClass(dir + 'arrow');
          $('.card.' + opponent, neighbor).addClass(dir + 'arrow');
        });
      }
    }
    if (this.data('highlight') == 'in') {
      var width = skill.data('aoe width');
      // PUD hook
      if (spot) {
        var linedir = game.map.invertDirection(source.getDirectionStr(spot));
        var targetSpot = source.firstSpotInLine(spot, range);
        if (targetSpot && linedir) {
          source.inLine(targetSpot, range, width, function(neighbor) {
            var card = $('.card', neighbor);
            if (card.length)
              card.addClass(linedir + 'arrow');
            else
              if (!neighbor.hasClasses('block cript')) neighbor.addClass(linedir + 'arrow');
          });
        }
      }
      /* else {
        source.inCross(range, width, function (neighbor, dir) {
          var invdir = game.map.invertDirection(dir);
          var card = $('.card', neighbor);
          if (card.length) card.addClass(invdir+'arrow');
          else neighbor.addClass(invdir+'arrow');
        });
      }*/
    }
    if (this.data('highlight') == 'out') {
      if (spot) {
        // KOTL blind
        spot.inCross(1, 0, function(neighbor, dir) {
          var card = $('.card.' + opponent, neighbor);
          if (card.length)
            card.addClass(dir + 'arrow');
          else
            if (!neighbor.hasClasses('block cript')) neighbor.addClass(dir + 'arrow');
        });
      }
    }
  },
  highlightCreep: function() {
    var side = game.selectedCard.side();
    game[side].tower.strokeAttack();
    $('.spot.' + side + 'area.free').addClass('movearea').on('mouseup.highlight', game[side].summonCreep);
  },
  radialStroke: function(r, cl) {
    //console.log(r,cl)
    var spot = this
      , range = r
      , cls = 'left right top bottom';
    if (typeof (r) == 'string')
      range = game.map.getRangeInt(r);
    var radius, x, y, r2, l, fil = function(x, y, border) {
      var spot = game.map.getSpot(x, y);
      if (spot) {
        spot.addClass(cl + ' stroke ' + border);
      }
    }, w = game.map.getX(spot), h = game.map.getY(spot);
    if (range === 0) {
      return fil(w, h, 'left right top bottom');
    }
    radius = game.map.rangeArray[range];
    r = Math.round(radius);
    r2 = radius * radius;
    l = Math.ceil(radius) * Math.cos(Math.PI / 4);
    if (range % 2 === 0) {
      fil(w, h + r, 'bottom');
      fil(w, h - r, 'top');
      fil(w - r, h, 'left');
      fil(w + r, h, 'right');
    } else if (range % 2 === 1) {
      fil(w, h + r, 'bottom left right');
      fil(w, h - r, 'top  left right');
      fil(w - r, h, 'left top bottom');
      fil(w + r, h, 'right top bottom');
    }
    if (range === 2 || range === 3) {
      for (x = 1; x <= l; x += 1) {
        y = 1;
        fil(w + x, h + y, 'right bottom');
        fil(w + x, h - y, 'right top');
        fil(w - x, h + y, 'left bottom');
        fil(w - x, h - y, 'left top');
      }
    } else if (range === 4 || range === 6 || range === 8) {
      for (x = 1; x <= l; x += 1) {
        y = Math.round(Math.sqrt(r2 - x * x));
        fil(w + x, h + y, 'right bottom');
        fil(w + y, h + x, 'right bottom');
        fil(w + x, h - y, 'right top');
        fil(w + y, h - x, 'right top');
        fil(w - x, h + y, 'left bottom');
        fil(w - y, h + x, 'left bottom');
        fil(w - x, h - y, 'left top');
        fil(w - y, h - x, 'left top');
      }
    } else if (range >= 5) {
      for (x = 1; x <= l; x += 1) {
        y = Math.round(Math.sqrt(r2 - x * x));
        fil(w + x, h + y, 'bottom');
        fil(w - x, h + y, 'bottom');
        fil(w + x, h - y, 'top');
        fil(w - x, h - y, 'top');
        fil(w - y, h + x, 'left');
        fil(w - y, h - x, 'left');
        fil(w + y, h - x, 'right');
        fil(w + y, h + x, 'right');
      }
    }
    if (range === 7) {
      fil(w + 3, h + 2, 'bottom');
      fil(w - 3, h + 2, 'bottom');
      fil(w + 3, h - 2, 'top');
      fil(w - 3, h - 2, 'top');
      fil(w - 2, h + 3, 'left');
      fil(w - 2, h - 3, 'left');
      fil(w + 2, h + 3, 'right');
      fil(w + 2, h - 3, 'right');
    }
  },
  crossStroke: function(range, width, cl) {
    var spot = this;
    var radius, x, y, r, fil = function(x, y, border) {
      var spot = game.map.getSpot(x, y);
      if (spot) {
        spot.addClass(cl + ' stroke ' + border);
      }
    }, w = game.map.getX(spot), h = game.map.getY(spot);
    if (range === 0) {
      return fil(w, h, 'left right top bottom');
    }

    fil(w, h + range, 'bottom');
    fil(w, h - range, 'top');
    fil(w - range, h, 'left');
    fil(w + range, h, 'right');

    if (width == 1) {
      fil(w + width, h + range, 'bottom');
      fil(w - width, h + range, 'bottom');
      fil(w + width, h - range, 'top');
      fil(w - width, h - range, 'top');
      fil(w - range, h + width, 'left');
      fil(w - range, h - width, 'left');
      fil(w + range, h + width, 'right');
      fil(w + range, h - width, 'right');
    }

    for (r = 1 + width; r <= range; r += 1) {
      fil(w - width, h + r, 'left');
      fil(w + width, h + r, 'right');
    }
    for (r = 1 + width; r <= range; r += 1) {
      fil(w - width, h - r, 'left');
      fil(w + width, h - r, 'right');
    }
    for (r = 1 + width; r <= range; r += 1) {
      fil(w + r, h - width, 'top');
      fil(w + r, h + width, 'bottom');
    }
    for (r = 1 + width; r <= range; r += 1) {
      fil(w - r, h - width, 'top');
      fil(w - r, h + width, 'bottom');
    }

  },
  linearStroke: function(range, width, cl) {
    var spot = this;
    var radius, x, y, r, fil = function(x, y, border) {
      var spot = game.map.getSpot(x, y);
      if (spot) {
        spot.addClass(cl + ' stroke ' + border);
      }
    }, cw = game.map.getX(spot), ch = game.map.getY(spot), w = game.map.getX(game.skill.castsource), h = game.map.getY(game.skill.castsource);
    if (ch - h > 0) {
      fil(w, h + range, 'bottom');
      if (width == 1) {
        fil(w + 1, h + 1, 'top');
        fil(w - 1, h + 1, 'top');
        fil(w + 1, h + range, 'bottom');
        fil(w - 1, h + range, 'bottom');
      }
      for (r = 1; r <= range; r += 1) {
        fil(w - width, h + r, 'left');
        fil(w + width, h + r, 'right');
      }
    } else if (ch - h < 0) {
      fil(w, h - range, 'top');
      if (width == 1) {
        fil(w + 1, h - 1, 'bottom');
        fil(w - 1, h - 1, 'bottom');
        fil(w + 1, h - range, 'top');
        fil(w - 1, h - range, 'top');
      }
      for (r = 1; r <= range; r += 1) {
        fil(w - width, h - r, 'left');
        fil(w + width, h - r, 'right');
      }
    } else if (cw - w > 0) {
      fil(w + range, h, 'right');
      if (width == 1) {
        fil(w + 1, h - 1, 'left');
        fil(w + 1, h + 1, 'left');
        fil(w + range, h - 1, 'right');
        fil(w + range, h + 1, 'right');
      }
      for (r = 1; r <= range; r += 1) {
        fil(w + r, h - width, 'top');
        fil(w + r, h + width, 'bottom');
      }
    } else if (cw - w < 0) {
      fil(w - range, h, 'left');
      if (width == 1) {
        fil(w - 1, h - 1, 'right');
        fil(w - 1, h + 1, 'right');
        fil(w - range, h - 1, 'left');
        fil(w - range, h + 1, 'left');
      }
      for (r = 1; r <= range; r += 1) {
        fil(w - r, h - width, 'top');
        fil(w - r, h + width, 'bottom');
      }
    }
  },
  clearMap: function() {
    game.skill.aoe = null;
    game.skill.aoerange = null;
    game.skill.aoewidth = null;
    game.skill.castrange = null;
    game.skill.castwidth = null;
    game.skill.castsource = null;
    game.skill.summonHover = null;
    game.map.el.removeClass('aoe');
    $('.map .card, .map .spot').clearEvents('highlight').removeClass('source stroke attacktarget casttarget movearea movetarget movesource moving targetarea stroke playerattack enemyattack skillhoverstroke skillstroke top bottom left right toparrow bottomarrow leftarrow rightarrow');
  },
  refresh: function () {
    if (game.selectedCard) game.selectedCard.reselect();
    else game.highlight.map();
  }
};
