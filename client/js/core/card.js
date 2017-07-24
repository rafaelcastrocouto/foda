game.card = {
  extendjQuery: function() {
    $.fn.extend({
      side: game.card.side,
      opponent: game.card.opponent,
      place: game.card.place,
      select: game.card.select,
      unselect: game.card.unselect,
      reselect: game.card.reselect,
      canMove: game.card.canMove,
      move: game.card.move,
      animateMove: game.card.animateMove,
      stopChanneling: game.card.stopChanneling,
      reduceStun: game.card.reduceStun,
      canAttack: game.card.canAttack,
      attack: game.card.attack,
      damage: game.card.damage,
      heal: game.card.heal,
      setDamage: game.card.setDamage,
      setArmor: game.card.setArmor,
      setResistance: game.card.setResistance,
      setHp: game.card.setHp,
      setCurrentHp: game.card.setCurrentHp,
      setSpeed: game.card.setSpeed,
      shake: game.card.shake,
      die: game.card.die,
      reborn: game.card.reborn
    });
  },
  build: function(data) {
    var card, legend, fieldset, portrait, current, desc;
    if (data.hand == game.data.ui.left)
      data.className += ' left-hand';
    if (data.deck == game.data.ui.temp)
      data.className += ' temp';
    card = $('<div>').addClass('card ' + data.className);
    legend = $('<legend>').text(data.name);
    fieldset = $('<fieldset>');
    portrait = $('<div>').addClass('portrait').appendTo(fieldset);
    $('<div>').appendTo(portrait).addClass('img');
    $('<div>').appendTo(portrait).addClass('overlay');
    if (data.attribute) {
      $('<h1>').addClass('attr').appendTo(fieldset).text(data.attribute);
    } else if (data.deck == game.data.ui.summon) {
      $('<h1>').addClass('type').appendTo(fieldset).text(game.data.ui.summon);
    } else if (data.type) {
      $('<h1>').addClass('type').appendTo(fieldset).text(data.type);
    }
    current = $('<div>').addClass('current').appendTo(fieldset);
    if (data.hp) {
      $('<p>').addClass('hp').appendTo(current).html('HP <span>' + data.hp + '</span>');
      data['current hp'] = data.hp;
    }
    if (data.damage) {
      $('<p>').addClass('damage').appendTo(current).html('DMG <span>' + data.damage + '</span>');
      data['current damage'] = data.damage;
    }
    desc = $('<div>').addClass('desc').appendTo(fieldset);
    if (data.dot)
      $('<p>').appendTo(desc).text(game.data.ui.dot + ': ').addClass('dot').append($('<span>').text(data.dot));
    if (data.buff) {
      if (data.buff['damage bonus'])
        $('<p>').appendTo(desc).text(game.data.ui.damage + ' ' + game.data.ui.bonus + ': ').addClass('dot').append($('<span>').text(data.buff['damage bonus']));
      if (data.buff.dot)
        $('<p>').appendTo(desc).text(game.data.ui.dot + ': ').addClass('dot').append($('<span>').text(data.buff.dot));
    }
    if (data.buff) {
      if (data.buff['cast damage bonus'])
        $('<p>').appendTo(desc).text(game.data.ui.damage + ' per Cast: ').addClass('dot').append($('<span>').text(data.buff['cast damage bonus']));
      if (data.buff['damage per kill'])
        $('<p>').appendTo(desc).text(game.data.ui.damage + ' per Kill: ').addClass('dot').append($('<span>').text(data.buff['damage per kill']));
    }
    //if (data.hand)
    //  $('<p>').appendTo(desc).text(data.deck + ' (' + data.hand + ')');
    if (data.cards > 1)
      $('<p>').appendTo(desc).text(game.data.ui.cards + ': ' + data.cards);
    if (data['damage type'])
      $('<p>').appendTo(desc).text(game.data.ui.damage + ': ' + data['damage type']);
    else if (data.buff && data.buff['damage type'])
      $('<p>').appendTo(desc).text(game.data.ui.damage + ': ' + data.buff['damage type']);
    if (data.aoe)
      $('<p>').appendTo(desc).text(game.data.ui.aoe + ': ' + data.aoe + ' (' + data['aoe range']+')');
    if (data.range)
      $('<p>').appendTo(desc).text(game.data.ui.range + ': ' + data.range);
    if (data['cast range']) {
      if (typeof (data['cast range']) == 'string' || data['cast range'] > 1)
        $('<p>').appendTo(desc).text(game.data.ui['cast range'] + ': ' + data['cast range']);
    }
    if (data.armor) {
      $('<p>').appendTo(desc).text(game.data.ui.armor + ': ' + data.armor).addClass('armor');
      data['current armor'] = data.armor;
    }
    if (data.resistance) {
      $('<p>').appendTo(desc).text(game.data.ui.resistance + ': ' + data.resistance).addClass('resistance');
      data['current resistance'] = data.resistance;
    }
    if (data.mana > 1)
      $('<p>').appendTo(desc).text(game.data.ui.mana + ': ' + data.mana);
    if (data.speed) {
      data['current speed'] = data.speed;
      //$('<p>').appendTo(desc).text(game.data.ui.speed + ': ' + data.speed);
    }

    if (data['bonus cards']) 
      $('<p>').appendTo(desc).text(game.data.ui.bonus + ' ' + game.data.ui.cards + ': ' + data['bonus cards']);
    if (data.type == game.data.ui.channel)
      $('<p>').appendTo(desc).text(game.data.ui.channel+' '+game.data.ui.duration + ': ' + data.channel);
    if (data.stun) 
      $('<p>').appendTo(desc).text(game.data.ui.stun+' '+game.data.ui.duration + ': ' + data.stun + ' ' + game.data.ui.turns);
    else if (data.buff && data.buff.duration)
      $('<p>').appendTo(desc).text(game.data.ui.buff+' '+game.data.ui.duration + ': ' + data.buff.duration + ' ' + game.data.ui.turns);
    else if (data.buffs && data.buffs.ult && data.buffs.ult.targets && data.buffs.ult.targets.duration)
        $('<p>').appendTo(desc).text(game.data.ui.buff+' '+game.data.ui.duration + ': ' + data.buffs.ult.targets.duration + ' ' + game.data.ui.turns);

    if (data.buff) {
      if (data.buff['hp per kill'])
        $('<p>').appendTo(desc).text(game.data.ui.hp + ' per Kill: ' + data.buff['hp per kill']);
      if (data.buff['cards per turn'])
        $('<p>').appendTo(desc).text(game.data.ui.cards + ': ' + data.buff['cards per turn'] + ' per Turn');
      if (data.buff.chance)
        $('<p>').appendTo(desc).text(game.data.ui.chance + ': ' + data.buff.chance + '%');
      if (data.buff.percentage)
        $('<p>').appendTo(desc).text(game.data.ui.percentage + ': ' + data.buff.percentage + '%');
      if (data.buff.multiplier)
        $('<p>').appendTo(desc).text(game.data.ui.multiplier + ': ' + data.buff.multiplier + 'X');
      if (data.buff['hp bonus'])
        $('<p>').appendTo(desc).text('HP ' + game.data.ui.bonus + ': ' + data.buff['hp bonus']);
      if (data.buff['armor bonus'])
        $('<p>').appendTo(desc).text(game.data.ui.armor + ' ' + game.data.ui.bonus + ': ' + data.buff['armor bonus']);
      if (data.buff['resistance bonus'])
        $('<p>').appendTo(desc).text(game.data.ui.resistance + ' ' + game.data.ui.bonus + ': ' + data.buff['resistance bonus']);
    }
    //if (data.cards)      $('<p>').appendTo(desc).text(game.data.ui.cards+': ' + data.cards);
    if (data.description) {
      $('<p>').appendTo(desc).addClass('description').text('“'+data.description+'”');
      //card.attr({ title: data.name + ': ' + data.description });
    }
    /*card.attr({
      title: data.name
    });*/
    if (data.kd) {
      $('<p>').addClass('kd').appendTo(desc).html(game.data.ui.kd + ': <span class="kills">0</span>/<span class="deaths">0</span>');
      data.kills = 0;
      data.deaths = 0;
    }
    if (data.buffsBox)
      $('<div>').addClass('buffs').appendTo(fieldset);
    $.each(data, function(item, value) {
      card.data(item, value);
    });
    card.append(legend).append(fieldset);
    return card;
  },
  side: function(side) {
    if (this.hasClass('player'))
      return 'player';
    if (this.hasClass('enemy'))
      return 'enemy';
    if (this.hasClass('neutral'))
      return 'neutral';
  },
  opponent: function(side) {
    if (this.hasClass('player'))
      return 'enemy';
    if (this.hasClass('enemy'))
      return 'player';
  },
  place: function(target) {
    if (!target.addClass)
      target = $('#' + target);
    this.getSpot().addClass('free');
    this.appendTo(target.removeClass('free'));
    game.highlight.map();
    //this.parent().find('.fx').each(function () {
    //  $(this).appendTo(target);
    //});
    //if (this.data('fx') && this.data('fx').canvas) { this.data('fx').canvas.appendTo(target); }
    return this;
  },
  select: function(event) {
    // console.trace('card select', event);
    var card = $(this).closest('.card');
    var forceSelection = !event;
    if (card) {
      if (forceSelection)
        game.card.setSelection(card);
      else if (!card.hasClasses('selected attacktarget casttarget dead')) {
        game.card.setSelection(card, event);
      }
    }
    return card;
  },
  clearSelection: function() {
    if (game.selectedCard) {
      game.highlight.clearMap();
      game.selectedCard.removeClass('selected draggable');
      game.states.table.discard.attr('disabled', true);
      if (game.states.table.selectedClone) {
        game.states.table.selectedClone.remove();
        game.states.table.selectedClone = null;
      }
      game.selectedCard = null;
    }
  },
  setSelection: function(card, event) {
    game.card.clearSelection();
    game.selectedCard = card;
    card.addClass('selected');
    game.highlight.map(event);
    game.states.table.selectedClone = card.clone().css({
      'transform': ''
    }).appendTo(game.states.table.selectedCard).removeClass('selected blink done dead draggable dragTarget shake enemyMoveHighlight enemyMoveHighlightTarget').clearEvents();
    game.states.table.selectedCard.addClass('flip');
    card.trigger('select', {
      card: card
    });
    if (!card.hasClasses('done enemy trees towers'))
      card.addClass('draggable');
  },
  unselect: function() {
    game.states.table.selectedCard.removeClass('flip');
    game.timeout(200, game.card.clearSelection);
  },
  reselect: function () {
    if (this.hasClass('selected')) this.select();
    if (this.hasClass('source')) game.selectedCard.select();
  },
  canMove: function() {
    return !this.hasClasses('done static dead stunned rooted entangled disabled sleeping cycloned taunted');
  },
  move: function(destiny) {
    if (typeof destiny === 'string') {
      destiny = $('#' + destiny);
    }
    var card = this, t, d, from = card.getPosition(), to = destiny.getPosition();
    if (destiny.hasClass('free') && !destiny.hasClass('block') && from !== to) {
      card.removeClass('draggable').off('mousedown touchstart');
      game.highlight.clearMap();
      card.stopChanneling();
      card.animateMove(destiny);
      var evt = {
        type: 'move',
        card: card,
        target: to
      };
      card.trigger('move', evt).trigger('action', evt);
      var end = function(card, destiny) {
        destiny.removeClass('free');
        card.getSpot().addClass('free');
        card.css({
          transform: ''
        }).prependTo(destiny).on('mousedown touchstart', game.card.select);
        card.trigger('moved', evt);
        card.reselect();
      }.bind(this, card, destiny);
      if (!this.hasClass('dragTarget')) game.timeout(300, end);
      else game.timeout(25, end);
    }
    return card;
  },
  animateMove: function(destiny) {
    if (!this.hasClass('dragTarget')) {
      var from = this.getPosition();
      var to = destiny.getPosition();
      var fx = game.map.getX(from);
      var fy = game.map.getY(from);
      var tx = game.map.getX(to);
      var ty = game.map.getY(to);
      var dx = (tx - fx) * 100;
      var dy = (ty - fy) * 100;
      this.css({
        transform: 'translate3d(' + (dx - 50) + '%, ' + (dy - 40) + '%, 100px) rotateX(-30deg)'
      });
    }
  },
  stopChanneling: function() {
    if (this.hasClass('channeling')) {
      this.trigger('channelend', this.data('channel event'));
      $(this.data('channel skill')).removeClass('channel-on');
      this.data('channel', null).data('channeling', null).data('channel skill', null).data('channel event', null);
      this.off('channel').off('channelend');
      this.removeClass('channeling');
    }
  },
  setDamage: function(damage) {
    damage = parseInt(damage, 10);
    this.find('.current .damage span').text(damage);
    this.data('current damage', damage);
    this.reselect();
    return this;
  },
  setCurrentHp: function(hp) {
    if (hp < 0) {
      hp = 0;
    }
    this.find('.current .hp span').text(hp);
    this.data('current hp', hp);
    this.reselect();
    return this;
  },
  setHp: function(hp) {
    if (hp < 1) {
      hp = 1;
    }
    this.find('.desc .hp').text(hp);
    this.data('hp', hp);
    this.reselect();
    return this;
  },
  setArmor: function(armor) {
    this.find('.desc .armor').text(game.data.ui.armor + ': ' + armor);
    this.data('current armor', armor);
    this.reselect();
    return this;
  },
  setResistance: function(res) {
    this.find('.desc .resistance').text(game.data.ui.resistance + ': ' + res);
    this.data('current resistance', res);
    this.reselect();
    return this;
  },
  setSpeed: function(speed) {
    this.data('current speed', speed);
    return this;
  },
  shake: function() {
    this.addClass('shake');
    setTimeout(function() {
      this.removeClass('shake');
    }
    .bind(this), 340);
  },
  canAttack: function(force) {
    var classes = 'dead stunned rooted disarmed disabled';
    if (!force) classes += ' done';
    return !this.hasClasses(classes);
  },
  attack: function(target, force) {
    if (typeof target === 'string') {
      target = $('#' + target + ' .card');
    }
    var source = this, damage = source.data('current damage'), name, from = source.getPosition(), to = target.getPosition();
    if (damage && from !== to && target.data('current hp') && source.canAttack(force)) {
      source.stopChanneling();
      var evt = {
        type: 'attack',
        source: source,
        target: target
      };
      source.trigger('attack', evt).trigger('action', evt);
      target.trigger('attacked', evt);
      if (!source.data('critical-attack') && !source.data('miss-attack')) {
        // DAMAGE
        var bonus = source.data('attack bonus') || 0;
        source.damage(damage + bonus, target, game.data.ui.physical);
        source.data('attack bonus', 0);
      }
      if (source.data('range') == game.data.ui.melee) {
        source.addClass('melee-attack');
        setTimeout(function() {
          this.removeClass('melee-attack');
        }
        .bind(source), 240);
      }
      if (source.data('range') == game.data.ui.ranged || source.data('range') == game.data.ui.short) {
        // launch projectile
        var cl = source.data('hero');
        if (source.hasClass('towers')) {
          cl = 'towers ' + source.side();
        }
        game.projectile = $('<div>').addClass('projectile ' + cl);
        game.projectile.appendTo(game.map.el);
        game.card.projectile.apply(source);
        setTimeout(game.card.projectile.bind(target), 50);
        setTimeout(function() {
          game.projectile.remove();
        }, 500);
      }
      if (source.data('critical-attack'))
        source.data('critical-attack', false);
      if (source.data('miss-attack')) {
        // TEXT FX
        source.data('miss-attack', false);
        var missFx = target.find('.missed');
        if (!missFx.length) {
          missFx = $('<span>').text(game.data.ui.miss).addClass('missed').appendTo(target);
        }
        game.timeout(5000, function() {
          this.remove();
        }
        .bind(missFx));
      } else {
        if (source.hasClass('towers'))
          name = 'tower';
        else if (source.hasClass('bear'))
          name = 'bear';
        else
          name = source.data('hero');
        game.audio.play(name + '/attack');
      }
    }
    return this;
  },
  projectile: function() {
    var x = this.getX();
    var y = this.getY();
    game.projectile.css({
      'transform': 'translate3d('+(110 + (x * 210))+'px,'+(140 + (y * 310))+'px, 60px)'
    });

  },
  damage: function(damage, target, type) {
    var source = this, evt, x, y, position, spot, resistance, armor, hp, finalDamage = damage;
    if (damage > 0) {
      if (!type) {
        type = game.data.ui.physical;
      }
      if (type === game.data.ui.magical) {
        resistance = target.data('current resistance');
        if (resistance)
          finalDamage = damage - resistance;
      }
      if (type === game.data.ui.physical || type === 'critical') {
        armor = target.data('current armor');
        if (armor)
          finalDamage = damage - armor;
      }
      if (finalDamage < 1)
        finalDamage = 1;
      if (damage < 1)
        damage = 1;
      if (typeof target === 'string') {
        target = $('#' + target + ' .card');
      }
      position = target.getPosition();
      x = game.map.getX(position);
      y = game.map.getY(position);
      spot = game.map.getSpot(x, y);
      evt = {
        source: this,
        target: target,
        spot: spot,
        x: x,
        y: y,
        position: position,
        damage: finalDamage,
        originalDamage: damage,
        type: type
      };
      target.trigger('damage', evt);
      if (!target.hasClass('immune')) {
        hp = target.data('current hp') - finalDamage;
        target.setCurrentHp(hp);
        target.shake();
      }
      if (hp < 1)
        game.timeout(400, game.card.kill.bind(game, evt));
      if (type === 'critical') {
        source.data('critical-attack', true);
        game.audio.play('crit');
        damageFx = $('<span>').addClass('damaged critical');
      } else {
        damageFx = $('<span>').addClass('damaged');
      }
      var delay = 850;
      if (!target.data('damaged-timeout')) {
        damageFx.text(finalDamage).appendTo(target);
        target.data('damaged-timeout', delay);
      } else {
        game.timeout(target.data('damaged-timeout'), function (damageFx, finalDamage, target) {
          damageFx.text(finalDamage).appendTo(target);
        }.bind(this, damageFx, finalDamage, target));
        target.data('damaged-timeout', target.data('damaged-timeout') + delay);
      }
      game.timeout(delay, function () {
        target.data('damaged-timeout', target.data('damaged-timeout') - delay);
      });
      game.timeout(5000, damageFx.remove.bind(damageFx));
    }
    return this;
  },
  heal: function(healhp) {
    if (healhp > 0) {
      var healFx, currentHeal, currenthp = this.data('current hp'), maxhp = this.data('hp'), hp;
      healhp = parseInt(healhp);
      hp = currenthp + healhp;
      if (hp > maxhp) {
        healhp = maxhp - currenthp;
        if (healhp === 0)
          return;
        this.setCurrentHp(maxhp);
      } else {
        this.setCurrentHp(hp);
      }
      healFx = this.find('.heal');
      if (healFx.length && game.mode !== 'library') {
        currentHeal = healFx.text();
        healFx.text(currentHeal + healhp);
      } else {
        healFx.remove();
        healFx = $('<span>').addClass('heal').text(healhp).appendTo(this);
      }
      game.timeout(2000, function() {
        this.remove();
      }
      .bind(healFx));
    }
    return this;
  },
  kill: function(evt) {
    var target = evt.target;
    var source = evt.source;
    target.setCurrentHp(0);
    if (source.hasClass('heroes') && target.hasClass('heroes')) {
      game[source.side()].kills += 1;
      var kills = source.data('kills') + 1;
      source.data('kills', kills);
      source.find('.kills').text(kills);
      game[target.side()].deaths += 1;
      var deaths = target.data('deaths') + 1;
      target.data('deaths', deaths);
      target.find('.deaths').text(deaths);
      target.reselect();
      source.reselect();
    }
    evt.position = target.getPosition();
    game.timeout(1000, function() {
      this.source.trigger('kill', this);
      this.target.die(this);
    }
    .bind(evt));
  },
  die: function(evt) {
    this.trigger('death', evt);
    this.data('killer', evt.source);
    this.unselect();
    this.stopChanneling();
    this.clearBuffs();
    this.addClass('dead').removeClass('target done stunned rooted silenced hexed disabled sleeping cycloned taunted entangled disarmed ai');
    var pos = evt.position, deaths, spot = $('#' + pos), side = this.side();
    if (!spot.hasClass('cript')) {
      spot.addClass('free');
    }
    if (this.hasClass('heroes')) {
      if (!spot.hasClass('cript')) {
        var damage = game.heroDeathDamage;
        var final = game[side].tower.data('current hp') - damage;
        if (final < 1) damage += final - 1;
        if (evt.target.side() != evt.source.side()) 
          evt.source.damage(damage, game[side].tower, game.data.ui.pure);
        var duration = game.deadLength;
        if (game.mode === 'library') duration = 1;
        this.data('reborn', game.time + duration);
        game[side].tower.selfBuff({
          buffId: this.data('hero')+'-death',
          className: this.data('hero') + ' heroes ' + this.data('hero')+'-death',
          name: this.data('name'),
          description: game.data.ui.death,
          temp: true,
          duration: duration + 1
        }, false /*no extra buffs*/, true /*force tower buff*/);
      }
      deaths = this.data('deaths') + 1;
      this.data('deaths', deaths);
      this.find('.deaths').text(deaths);
      if (this.hasClass('player')) {
        this.appendTo(game.player.heroesDeck);
      } else if (this.hasClass('enemy')) {
        this.appendTo(game.enemy.heroesDeck);
      }
    } else if (this.hasClass('towers')) {
      if (this.hasClass('player')) {
        if (game[game.mode].lose)
          game[game.mode].lose();
      } else if (this.hasClass('enemy')) {
        if (game[game.mode].win)
          game[game.mode].win();
      }
    } else if (this.hasClass('units')) {
      if (!this.hasClass('ld-summon') && evt.source.side() != side && game[side].tower.data('current hp') > game.creepDeathDamage)
        evt.source.damage(game.creepDeathDamage, game[side].tower, game.data.ui.pure);
      this.detach();
    } else {
      this.detach();
    }
    return this;
  },
  reborn: function(spot) {
    if (spot && spot.hasClass)
      spot = spot[0].id;
    var hp = this.data('hp'), x, y;
    if (!spot) {
      if (this.hasClass('player')) {
        x = 1;
        y = 4;
        spot = game.map.toPosition(x, y);
        while (!$('#' + spot).hasClass('free') && x <= 5) {
          x += 1;
          spot = game.map.toPosition(x, y);
        }
      } else if (this.hasClass('enemy')) {
        x = 6;
        y = 0;
        spot = game.map.toPosition(x, y);
        while (!$('#' + spot).hasClass('free') && x >= 2) {
          x -= 1;
          spot = game.map.toPosition(x, y);
        }
      }
    }
    var p = $('#' + spot);
    if ( spot && spot.length && 
     (p.hasClass('free') || p.hasClass('cript')) ) {
      var side = this.side();
      if (game[side].tower.data('current hp') > game.heroRespawnDamage && !p.hasClass('cript'))
        game[game.opponent(side)].tower.damage(game.heroRespawnDamage, game[side].tower, game.data.ui.pure);
      this.data('reborn', null);
      this.setCurrentHp(hp);
      this.removeClass('dead');
      this.place(spot);
      this.trigger('reborn', {
        target: this
      });
      return this;
    }
  }
};
