game.skill = {
  extendjQuery: function () {
    $.fn.extend({
      canCast: game.skill.canCast,
      cast: game.skill.cast,
      passive: game.skill.passive,
      toggle: game.skill.toggle,
      discard: game.skill.discard,
      addInvisibility: game.skill.addInvisibility,
      removeInvisibility: game.skill.removeInvisibility,
      summon: game.skill.summon
    });
  },
  build: function (side, single, cb) {
    game[side].skills = {};
    game[side].skills.hand = $('<div>').appendTo(game.states.table[side]).addClass('deck skills hand');
    game[side].skills.sidehand = $('<div>').appendTo(game.states.table[side]).addClass('deck skills sidehand');
    game[side].skills.ult = $('<div>').hide().appendTo(game.states.table[side]).addClass('deck skills ult');
    game[side].skills.temp = $('<div>').hide().appendTo(game.states.table[side]).addClass('deck skills temp');
    game[side].skills.cemitery = $('<div>').hide().appendTo(game.states.table[side]).addClass('deck skills cemitery');
    game[side].skills.deck = game.deck.build({
      name: 'skills',
      multi: !single,
      filter: game[side].picks,
      cb: function (deck) {
        var side = this.side.toString();
        deck.addClass('available').hide().appendTo(game.states.table[side]);
        $.each(deck.data('cards'), function (i, skill) {
          var side = this.toString();
          skill.addClass(side);
          if (side == 'player' || game.mode == 'library' || game.mode == 'local') skill.on('mousedown touchstart', game.card.select);
          if (side == 'enemy') skill.attr({ title: '' }).addClass('flipped');
          if (skill.data('deck') === game.data.ui.summon) skill.appendTo(game[side].unitsDeck);
          if (skill.data('deck') === game.data.ui.temp) skill.appendTo(game[side].skills.temp);
          if (skill.data('skill') === 'ult') skill.appendTo(game[side].skills.ult);
        }.bind(side));
        //deck.shuffleDeck();
        game[side].skills.deck = deck;
        if (this.cb) this.cb();
      }.bind({side: side, cb: cb})
    });
  },
  calcMana: function (side) {
    game[side].mana = 0;
    $(game[side].picks).each(function (i, name) { 
      game[side].mana += game.data.heroes[name].mana;
    });
    game[side].cardsPerTurn = Math.round(game[side].mana / 5);
  },
  canCast: function (skill) {
    var c = !this.hasClasses('dead stunned silenced hexed disabled sleeping cycloned taunted');
    if ( skill.hasClass('am-blink') && this.hasClass('rooted') ) c = false;
    return c;
  },
  cast: function (skill, target) {
    var source = this, targets, duration, channeler, channelDuration,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (skillid && hero && (source.data('hero') === hero || source.data('summoner').data('hero') === hero)) {
      if (typeof target === 'string') {
        targets = game.data.skills[hero][skillid].targets;
        if (targets.indexOf(game.data.ui.spot) >= 0 || targets.indexOf(game.data.ui.jungle) >= 0) {
          target = $('#' + target);
        } else {target = $('#' + target + ' .card'); }
      }
      if (target.length) {
        game.highlight.clearMap();
        source.stopChanneling();
        var evt = {
          type: 'cast',
          skill: skill,
          source: source,
          target: target
        };
        source.trigger('cast', evt).trigger('action', evt);
        if (game.audio.sounds.indexOf(hero + '/' + skillid) >= 0) {
          game.audio.play(hero + '/' + skillid);
        }
        if (skill.data('type') == game.data.ui.channel) {
          channelDuration = skill.data('channel');
          evt.type = 'channel';
          source.data('channel event', evt);
          source.data('channeling', channelDuration);
          source.data('channel', channelDuration);
          source.data('channel skill', skill);
          source.addClass('channeling');
          source.trigger('channel', evt);
          skill.addClass('channel-on');
          source.on('channel', function (event, eventdata) {
            channeler = eventdata.source;
            duration = channeler.data('channeling');
            if (duration) {
              duration -= 1;
              channeler.data('channeling', duration);
            }
          });
        }
        game.skills[hero][skillid].cast(skill, source, target);
        if (!skill.hasClass('dragTarget')) game.timeout(400, skill.discard.bind(skill));
        else skill.discard();
      }
    }
    return this;
  },
  animateCast: function (skill, target, event, cb) {
    if (!skill.hasClass('dragTarget')) {
      if (typeof target === 'string') { target = $('#' + target); }
      var s = skill.offset();
      var x = event.clientX - s.left, y = event.clientY - s.top;
      var fx = x * 1 - 150; var fy = y * 1 - 220;
      skill.css({transform: 'translate('+fx+'px, '+fy+'px) scale(0.3)'});
      game.timeout(400, function (cb) {
        $(this).css({
          top: '',
          left: '',
          transform: ''
        });
        if (cb) cb();
      }.bind(skill, cb));
    }
  },
  passive: function (target) {
    var skill = this,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (typeof(target) === 'string') target = $('#' + target + ' .card');
    if (skillid && hero && target.data('hero') === hero) {
      target.trigger('passive', {
        skill: skill,
        target: target
      });
      game.skills[hero][skillid].passive(skill, target);
      game.audio.play('activate');
      target.shake();
      var end = function (target) {
        this.detach();
        game.highlight.clearMap();
        if (target.side() === 'player') target.select();
      }.bind(skill, target);
      if (!skill.hasClass('dragTarget')) game.timeout(400, end);
      else end();
    }
    return this;
  },
  toggle: function (target) {
    var skill = this,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (typeof target === 'string') { target = $('#' + target + ' .card'); }
    if (skillid && hero && target.data('hero') === hero) {
      var evt = {
        type: 'toggle',
        skill: skill,
        target: target
      };
      target.trigger('toggle', evt);
      game.skills[hero][skillid].toggle(skill, target);
      if (game.audio.sounds.indexOf(hero + '/' + skillid) >= 0) {
        game.audio.play(hero + '/' + skillid);
      }
      target.shake();
      if (skill.hasClass('enemy')) {
        game.enemy.hand -= 1;
      } else if (skill.hasClass('selected')) {
        game.timeout(400, function (target) {
          if (target.side() === 'player') target.select();
        }.bind(skill, target));
      }
    }
    return this;
  },
  summon: function (skill) {
    var unit = skill.clone().addClass('units summoned').removeClass('skills selected flipped').on('mousedown touchstart', game.card.select);
    if (game.mode == 'library') unit.on('action', game.library.action);
    unit.find('legend').text(skill.data('summon name'));
    unit.find('.description').remove();
    unit.data('summon', skill);
    unit.data('summoner', this);
    unit.data('hp', skill.data('hp'));
    unit.data('damage', skill.data('damage'));
    unit.data('range', skill.data('range'));
    unit.data('armor', skill.data('armor'));
    unit.data('resistance', skill.data('resistance'));
    unit.data('speed', skill.data('speed') || 2);
    unit.data('current hp', unit.data('hp'));
    unit.data('current damage', unit.data('damage'));
    unit.data('current armor', unit.data('armor'));
    unit.data('current resistance', unit.data('resistance'));
    unit.data('current speed', unit.data('speed'));
    unit.find('fieldset').append($('<div>').addClass('buffs'));
    game.timeout(400, function (unit) {
      if (this.side() === 'player') unit.select();
    }.bind(this, unit));
    return unit;
  },
  addInvisibility: function () {
    this.addClass('invisible');
    this.on('action.invisible', function (event, eventdata) {
      var target = $(this);
      if (eventdata.type !== 'move') {
        target.removeInvisibility();
      }
    });
  },
  removeInvisibility: function () {
    this.removeClass('invisible').off('action.invisible');
    this.trigger('invisibilityLoss', {target: this});
  },
  discard: function (source) {
    if (this.hasClass('skills')) {
      if (source && source.side() == 'player') source.select();
      else if (this.hasClass('selected')) game.card.unselect();
      this.trigger('discard', {target: this});
      var side = this.side();
      if (this.data('deck') === game.data.ui.temp) this.appendTo(game[side].skills.temp);
      else if (this.data('deck') === game.data.ui.summon) this.detach();
      else if (!this.data('cancel-discard')) this.appendTo(game[side].skills.cemitery);
      else this.data('cancel-discard', false);
      if (side == 'enemy') {
        this.addClass('flipped').removeClass('showMoves discardMove');
      }
    } else {
      if (this.closest('.map').length) this.parent().addClass('free');
      this.detach();
    }
    return this;
  }
};
