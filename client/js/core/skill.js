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
  build: function (side, single) {
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
        var side = this.toString();
        deck.addClass('available').hide().appendTo(game.states.table[side]);
        $.each(deck.data('cards'), function (i, skill) {
          var side = this.toString();
          skill.addClass(side);
          if (side == 'player') skill.on('mousedown touchstart', game.card.select);
          else skill.attr({ title: '' }).addClass('flipped');
          if (skill.data('deck') === game.data.ui.temp) skill.appendTo(game[side].skills.temp);
          if (skill.data('skill') === 'ult') skill.appendTo(game[side].skills.ult);
        }.bind(side));
        //deck.shuffleDeck();
      }.bind(side)
    });
  },
  calcMana: function (side) {
    game[side].mana = 0;
    $(game[side].picks).each(function (i, name) { 
      game[side].mana += game.data.heroes[name].mana;
    });
    game[side].maxCards = 10;
    game[side].cardsPerTurn = Math.round(game[side].mana / 5);
    if (game.mode == 'library') game[side].cardsPerTurn = $('.pickbox .card.'+game.library.hero).data('mana');
  },
  canCast: function (skill) {
    var c = !this.hasClasses('dead stunned silenced hexed disabled sleeping cycloned taunted');
    if ( skill.hasClass('am-blink') && this.hasClass('rooted') ) c = false;
    return c;
  },
  cast: function (skill, target) { //console.trace('cast')
    var source = this, targets, duration, channeler, channelDuration,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (skillid && hero && source.data('hero') === hero) {
      if (typeof target === 'string') {
        targets = game.data.skills[hero][skillid].targets;
        if (targets.indexOf(game.data.ui.spot) >= 0) {
          target = $('#' + target);
        } else {target = $('#' + target + ' .card'); }
      }
      if (target.length) {
        source.stopChanneling();
        var evt = {
          type: 'cast',
          skill: skill,
          source: source,
          target: target
        };
        source.trigger('cast', evt).trigger('action', evt);
        game.skills[hero][skillid].cast(skill, source, target);
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
        game.timeout(300, function () { 
          //console.trace('castend')
          this.skill.discard();
        }.bind({source: source, skill: skill}));
      }
    }
    return this;
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
      game.timeout(300, function () {
        this.skill.detach();
        game.highlight.clearMap();
        if (this.target.side() === 'player') this.target.select();
      }.bind({target: target, skill: skill}));
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
      }
      game.timeout(300, function () {
        if (this.side() === 'player') this.select();
        else this.addClass('flipped');
      }.bind(target));
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
    game.timeout(300, function () {
      if (this.source.side() === 'player') this.unit.select();
    }.bind({source: this, unit: unit}));
    return unit;
  },
  addInvisibility: function () {
    this.addClass('invisible');
    this.on('action.invisible', function (event, eventdata) {
      if (eventdata.type !== 'move') {
        $(this).removeInvisibility();
      }
    });
  },
  removeInvisibility: function () {
    this.removeClass('invisible').off('action.invisible');
    this.trigger('invisibilityLoss', {source: this});
  },
  discard: function () {
    if (this.hasClass('skills')) {
      if (this.hasClass('selected')) game.card.unselect();
      game.highlight.clearMap();
      this.trigger('discard', {target: this});
      var side = this.side();
      if (this.data('deck') === game.data.ui.temp) this.appendTo(game[side].skills.temp);
      else this.appendTo(game[side].skills.cemitery);
      if (side == 'enemy') {
        this.addClass('flipped').removeClass('showMoves');
      }
    }
    return this;
  }
};
