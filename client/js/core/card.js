game.card = {
  extendjQuery: function () {
    $.fn.extend({
      side: game.card.side,
      opponent: game.card.opponent,
      place: game.card.place,
      select: game.card.select,
      unselect: game.card.unselect,
      canMove: game.card.canMove,
      move: game.card.move,
      animateMove: game.card.animateMove,
      selfBuff: game.card.selfBuff,
      addBuff: game.card.addBuff,
      hasBuff: game.card.hasBuff,
      getBuff: game.card.getBuff,
      removeBuff: game.card.removeBuff,
      stopChanneling: game.card.stopChanneling,
      addStun: game.card.addStun,
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
  build: function (data) {
    var card, legend, fieldset, portrait, current, desc;
    if (data.hand == game.data.ui.left) data.className += ' left-hand';
    if (data.deck == game.data.ui.temp) data.className += ' temp';
    card = $('<div>').addClass('card ' + data.className);
    legend = $('<legend>').text(data.name);
    fieldset = $('<fieldset>');
    portrait = $('<div>').addClass('portrait').appendTo(fieldset);
    $('<div>').appendTo(portrait).addClass('img');
    $('<div>').appendTo(portrait).addClass('overlay');
    if (data.attribute) {
      $('<h1>').addClass('attr').appendTo(fieldset).text(data.attribute);
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
    if (data.dot)                   $('<p>').appendTo(desc).text(game.data.ui.dot + ': ').addClass('dot').append($('<span>').text(data.dot));
    if (data.buff) {
      if (data.buff['damage bonus']) $('<p>').appendTo(desc).text(game.data.ui.damage + ' ' +  game.data.ui.bonus + ': ').addClass('dot').append($('<span>').text(data.buff['damage bonus']));
      if (data.buff.dot)             $('<p>').appendTo(desc).text(game.data.ui.dot + ': ').addClass('dot').append($('<span>').text(data.buff.dot));
    }
    if (data.hand)                  $('<p>').appendTo(desc).text(data.deck+' (' + data.hand + ')');
    if (data.cards)                 $('<p>').appendTo(desc).text(game.data.ui.cards+': ' + data.cards);
    if (data['damage type'])        $('<p>').appendTo(desc).text(game.data.ui.damage+': ' + data['damage type']);
    if (data.aoe)                   $('<p>').appendTo(desc).text(game.data.ui.aoe+': ' + data.aoe + ' ('+data['aoe range']+')');
    if (data.range)                 $('<p>').appendTo(desc).text(game.data.ui.range + ': ' + data.range);
    if (data['cast range']) {
      if (typeof(data['cast range']) == 'string' || data['cast range'] > 1) $('<p>').appendTo(desc).text(game.data.ui['cast range'] + ': ' + data['cast range']);
    }
    if (data.armor) {
      $('<p>').appendTo(desc).text(game.data.ui.armor + ': ' + data.armor).addClass('armor');
      data['current armor'] = data.armor;
    }
    if (data.resistance) {
      $('<p>').appendTo(desc).text(game.data.ui.resistance + ': ' + data.resistance).addClass('resistance');
      data['current resistance'] = data.resistance;
    }
    if (data.mana > 1) $('<p>').appendTo(desc).text(game.data.ui.mana + ': ' + data.mana);
    if (data.speed) {
      data['current speed'] = data.speed;
      //$('<p>').appendTo(desc).text(game.data.ui.speed + ': ' + data.speed);
    }
    if (data.type == game.data.ui.channel) $('<p>').appendTo(desc).text(game.data.ui.duration + ': ' + data.channel);
    if (data.buff) {
      if (data.buff['damage per kill'])  $('<p>').appendTo(desc).text(game.data.ui.damage + ': ' + data.buff['damage per kill'] + ' per Kill');
      if (data.buff['hp per kill'])      $('<p>').appendTo(desc).text(game.data.ui.hp + ': ' + data.buff['hp per kill'] + ' per Kill');
      if (data.buff.chance)              $('<p>').appendTo(desc).text(game.data.ui.chance + ': ' + data.buff.chance + '%');
      if (data.buff.percentage)          $('<p>').appendTo(desc).text(game.data.ui.percentage + ': ' + data.buff.percentage + '%');
      if (data.buff.duration)            $('<p>').appendTo(desc).text(game.data.ui.duration + ': ' + data.buff.duration + ' ' + game.data.ui.turns);       
      if (data.buff.multiplier)          $('<p>').appendTo(desc).text(game.data.ui.multiplier + ': ' + data.buff.multiplier + 'X');
      if (data.buff['hp bonus'])         $('<p>').appendTo(desc).text('HP '+game.data.ui.bonus+': ' + data.buff['hp bonus']);
      if (data.buff['armor bonus'])      $('<p>').appendTo(desc).text(game.data.ui.armor+' '+game.data.ui.bonus+': ' + data.buff['armor bonus']);
      if (data.buff['resistance bonus']) $('<p>').appendTo(desc).text(game.data.ui.resistance+' '+game.data.ui.bonus+': ' + data.buff['resistance bonus']);
    }
    //if (data.cards)      $('<p>').appendTo(desc).text(game.data.ui.cards+': ' + data.cards);
    if (data.description) {
      $('<p>').appendTo(desc).addClass('description').text(data.description);
      //card.attr({ title: data.name + ': ' + data.description });
    }
    card.attr({ title: data.name });
    if (data.kd) {
      $('<p>').addClass('kd').appendTo(desc).html(game.data.ui.kd + ': <span class="kills">0</span>/<span class="deaths">0</span>');
      data.kills = 0;
      data.deaths = 0;
    }
    if (data.buffsBox) $('<div>').addClass('buffs').appendTo(fieldset);
    $.each(data, function (item, value) {
      card.data(item, value);
    });
    card.append(legend).append(fieldset);
    return card;
  },
  side: function (side) {
    if (this.hasClass('player')) return 'player';
    if (this.hasClass('enemy')) return 'enemy';
    if (this.hasClass('neutral')) return 'neutral';
  },
  opponent: function (side) {
    if (this.hasClass('player')) return 'enemy';
    if (this.hasClass('enemy')) return 'player';
  },
  place: function (target) {
    if (!target.addClass) target = $('#' + target);
    this.getSpot().addClass('free');
    this.appendTo(target.removeClass('free'));
    game.highlight.map();
    //this.parent().find('.fx').each(function () {
    //  $(this).appendTo(target);
    //});
    //if (this.data('fx') && this.data('fx').canvas) { this.data('fx').canvas.appendTo(target); }
    return this;
  },
  select: function (event) { // console.trace('card select', event);
    var card = $(this).closest('.card'); 
    var forceSelection = !event;
    if (card) {
      if (forceSelection) game.card.setSelection(card);
      else if (!card.hasClasses('selected attacktarget casttarget dead')) {
        game.card.setSelection(card, event);
      }
    }
    return card;
  },
  clearSelection: function () {
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
  setSelection: function (card, event) {
    game.card.clearSelection();
    game.selectedCard = card;
    card.addClass('selected');
    game.highlight.map(event);
    game.states.table.selectedClone = card.clone().css({'transform': ''}).appendTo(game.states.table.selectedCard).removeClass('selected blink done dead draggable dragTarget shake enemyMoveHighlight enemyMoveHighlightTarget').clearEvents();
    game.states.table.selectedCard.addClass('flip');
    card.trigger('select', { card: card });
    if (!card.hasClasses('done enemy trees towers')) card.addClass('draggable');
  },
  unselect: function () {
    game.states.table.selectedCard.removeClass('flip');
    game.timeout(200, game.card.clearSelection);
  },
  canMove: function () {
    return !this.hasClasses('done static dead stunned rooted entangled disabled sleeping cycloned taunted');
  },
  move: function (destiny) {
    if (typeof destiny === 'string') { destiny = $('#' + destiny); }
    var card = this, t, d,
      from = card.getPosition(),
      to = destiny.getPosition();
    if (destiny.hasClass('free') && from !== to && card.canMove()) {
      card.removeClass('draggable').off('mousedown touchstart');
      game.highlight.clearMap();
      card.stopChanneling();
      card.animateMove(destiny);
      var evt = { type: 'move', card: card, target: to };
      card.trigger('move', evt).trigger('action', evt);
      if (card.hasClass('selected')) card.unselect();
      game.timeout(300, function () {
//         this.card.parent().find('.fx').each(function () {
//           $(this).appendTo(this.destiny);
//         });
        this.destiny.removeClass('free');
        this.card.getSpot().addClass('free');
        this.card.css({ transform: '' }).prependTo(this.destiny).on('mousedown touchstart', game.card.select);
      }.bind({ card: card, destiny: destiny }));
    }
    return card;
  },
  animateMove: function (destiny) {
    var from = this.getPosition(), to = destiny.getPosition(),
      fx = game.map.getX(from), fy = game.map.getY(from),
      tx = game.map.getX(to), ty = game.map.getY(to),
      dx = (tx - fx) * 100, dy = (ty - fy) * 100;
    this.css({ transform: 'translate3d(' + (dx - 50) + '%, ' + (dy - 40) + '%, 100px) rotateX(-30deg)' });
  },
  selfBuff: function (skill, buffs, fxOff) { //console.trace(this, skill, buffs)
    return this.addBuff(this, skill, buffs, fxOff);
  },
  addBuff: function (target, skill, buffs, fxOff) { //console.trace(target, skill, buffs)
    // get buff data
    var data = skill;
    if (buffs) {
      var buffsId = buffs.split('-');
      data = skill.data('buffs')[buffsId[0]][buffsId[1]];
    } else if (skill.data && skill.data('buff')) {
      data = skill.data('buff');
    }
    if (!data.buffId) data.buffId = buffs || skill.data('skillId');
    if (!data.className) data.className = data.buffId;
    if (!data.name) data.name = skill.data('name');
    if (!data.source) data.source = this;
    if (!data.skill) data.skill = skill;
    if (!data.target) data.target = target;
    if (!data.description) data.description = skill.data('description');
    if (data.duration) data.temp = true;
    // remove duplicated buff
    target.removeBuff(data.buffId);
    // create new buff
    var buff = $('<div>').addClass('buff ' + data.className).data('buff', data).attr({ title: data.name + ': ' + data.description });
    $.each(data, function (item, value) { buff.data(item, value); });
    $('<div>').appendTo(buff).addClass('img');
    $('<div>').appendTo(buff).addClass('overlay');
    // apply buff effects
    if (!fxOff) {
      if (data['hp bonus'] && typeof(data['hp bonus']) == 'number') {
        target.setHp(target.data('hp') + data['hp bonus']);
        target.setCurrentHp(target.data('current hp') + data['hp bonus']);
      }
      if (data['damage bonus'] && typeof(data['damage bonus']) == 'number') target.setDamage(target.data('current damage') + data['damage bonus']);
      if (data['armor bonus'] && typeof(data['armor bonus']) == 'number') target.setArmor(target.data('current armor') + data['armor bonus']);
      if (data['resistance bonus'] && typeof(data['resistance bonus']) == 'number') target.setResistance(target.data('current resistance') + data['resistance bonus']);
      if (data['speed bonus'] && typeof(data['speed bonus']) == 'number') target.setSpeed(target.data('current speed') + data['speed bonus']);
      if (data['speed slow'] && typeof(data['speed slow']) == 'number') target.setSpeed(target.data('current speed') - data['speed slow']);
    }
    // append buff
    target.find('.buffs').append(buff);
    if (target.hasClass('selected')) { target.select(); }
    return buff;
  },
  hasBuff: function (buff) {
    var target = this;
    return target.find('.buffs .' + buff).length;
  },
  getBuff: function (buff) {
    return this.find('.buffs .' + buff);
  },
  removeBuff: function (buffs) {
    var target = this;
    $.each(buffs.split(' '), function (i, buffId) {
      var buff = target.find('.buffs > .' + buffId);
      if (buff) {
        var data = buff.data('buff');
        if (data) {
          if (data['hp bonus'] && typeof(data['hp bonus']) == 'number') {
            target.setHp(target.data('hp') - data['hp bonus']);
            var hp = target.data('current hp') - data['hp bonus'];
            if (hp < 1) hp = 1;
            target.setCurrentHp(hp);
          }
          if (data['damage bonus'] && typeof(data['damage bonus']) == 'number') target.setDamage(target.data('current damage') - data['damage bonus']);
          if (data['armor bonus'] && typeof(data['armor bonus']) == 'number') target.setArmor(target.data('current armor') - data['armor bonus']);
          if (data['resistance bonus'] && typeof(data['resistance bonus']) == 'number') target.setResistance(target.data('current resistance') - data['resistance bonus']);
          if (data['speed bonus'] && typeof(data['speed bonus']) == 'number') target.setSpeed(target.data('current speed') - data['speed bonus']);
          if (data['speed slow'] && typeof(data['speed slow']) == 'number') target.setSpeed(target.data('current speed') + data['speed slow']);
        }
        buff.remove();
      }
      if (target.hasClass('selected')) { target.select(); }
    });
    return this;
  },
  addStun: function (target, skill) {
    var stun = skill.data('stun');
    if (target.hasClass('stunned')) {
      var currentstun = target.data('stun');
      if (!currentstun || stun > currentstun) { target.data('stun', stun); }
    } else {
      target.stopChanneling();
      this.addBuff(target, {
        name: 'Stun',
        buffId: 'stun',
        className: 'stun',
        source: this,
        skill: skill,
        duration: stun,
        description: 'Unit is stunned and cannot move, attack or cast'
      });
      target.addClass('stunned').data('stun', stun);
      if (target.hasClass('selected')) { target.select(); }
    }
    return this;
  },
  reduceStun: function () {
    var target = this, currentstun;
    if (target.hasClass('stunned')) {
      currentstun = parseInt(target.data('stun'), 10);
      if (currentstun > 0) {
        target.data('stun', currentstun - 1);
      } else { 
        target.trigger('stunend', { target: target }).data('stun', null).removeClass('stunned').removeBuff('stun');
        if (target.hasClass('selected')) { target.select(); }
      }
    }
    return this;
  },
  stopChanneling: function () {
    if (this.hasClass('channeling')) {
      this.trigger('channelend', this.data('channel event'));
      $(this.data('channel skill')).removeClass('channel-on');
      this.data('channel', null).data('channeling', null).data('channel skill', null).data('channel event', null);
      this.off('channel').off('channelend');
      this.removeClass('channeling');
    }
  },
  setDamage: function (damage) {
    damage = parseInt(damage, 10);
    this.find('.current .damage span').text(damage);
    this.data('current damage', damage);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  setCurrentHp: function (hp) {
    if (hp < 0) { hp = 0; }
    this.find('.current .hp span').text(hp);
    this.data('current hp', hp);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  setHp: function (hp) {
    if (hp < 1) { hp = 1; }
    this.find('.desc .hp').text(hp);
    this.data('hp', hp);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  setArmor: function (armor) {
    this.find('.desc .armor').text(game.data.ui.armor + ': ' + armor);
    this.data('current armor', armor);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  setResistance: function (res) {
    this.find('.desc .resistance').text(game.data.ui.resistance + ': ' + res);
    this.data('current resistance', res);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  setSpeed: function (speed) {
    this.data('current speed', speed);
    return this;
  },
  shake: function () {
    this.addClass('shake');
    setTimeout(function () {
      this.removeClass('shake');
    }.bind(this), 340);
  },
  canAttack: function () {
    return !this.hasClasses('done dead stunned rooted disarmed');
  },
  attack: function (target) {
    if (typeof target === 'string') { target = $('#' + target + ' .card'); }
    var source = this, damage = source.data('current damage'), name,
      from = source.getPosition(),
      to = target.getPosition();
    if (damage && from !== to && target.data('current hp') && source.canAttack()) {
      source.stopChanneling();
      var evt = {
        type: 'attack',
        source: source,
        target: target
      };
      source.trigger('attack', evt).trigger('action', evt);
      if (!source.data('critical-attack') && !source.data('miss-attack')) {
        // DAMAGE
        source.damage(damage, target, game.data.ui.physical);
      }
      if (source.data('range') == game.data.ui.melee) {
        source.addClass('melee-attack');
        setTimeout(function () {
          this.removeClass('melee-attack');
        }.bind(source), 240);
      }
      if (source.data('range') == game.data.ui.ranged ||
          source.data('range') == game.data.ui.short) {
        // launch projectile
        var cl = source.data('hero');
        if (source.hasClass('towers')) {
          cl = 'towers '+source.side();
        }
        game.projectile = $('<div>').addClass('projectile '+cl);
        var p = source.offset();
        game.card.projectile.apply(source);
        game.projectile.appendTo(game.camera);
        setTimeout(game.card.projectile.bind(target), 10);
        setTimeout(function () {
          game.projectile.remove();
        }, 260);
      }
      if (source.data('critical-attack')) source.data('critical-attack', false);
      if (source.data('miss-attack')) {
        // TEXT FX
        source.data('miss-attack', false);
        var missFx = target.find('.missed');
        if (!missFx.length) {
          missFx = $('<span>').text(game.data.ui.miss).addClass('missed').appendTo(target);
        }
        game.timeout(2000, function () {
          this.remove();
        }.bind(missFx));
      } else {
        if (source.hasClass('towers')) name = 'tower';
        else if (source.hasClass('bear')) name = 'bear';
        else name = source.data('hero');
        game.audio.play(name + '/attack');
      }
    }
    return this;
  },
  projectile: function () {
    var p = this.offset();
    game.projectile.css({'top': p.top - 80, 'left': p.left - 30});
  },
  damage: function (damage, target, type) {
    var source = this, evt, x, y, position, spot, resistance, armor, hp, finalDamage = damage;
    if (damage > 0) {
      if (!type) { type = game.data.ui.physical; }
      if (type === game.data.ui.magical) {
        resistance = target.data('current resistance');
        if (resistance) finalDamage = damage - resistance;
      }
      if (type === game.data.ui.physical || type === 'critical') { 
        armor = target.data('current armor');
        if (armor) finalDamage = damage - armor; 
      }
      if (finalDamage < 1) finalDamage = 1;
      if (damage < 1) damage = 1;
      if (typeof target === 'string') { target = $('#' + target + ' .card'); }
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
      if (hp < 1) game.timeout(400, game.card.kill.bind(game, evt));
      if (type === 'critical') {
        source.data('critical-attack', true);
        game.audio.play('crit');
        damageFx = target.find('.damaged.critical');
        if (!damageFx.length) {
          damageFx = $('<span>').addClass('damaged critical').appendTo(target);
        } else {
          finalDamage += parseInt(damageFx.text(), 10);
        }
      } else {
        damageFx = target.find('.damaged').not('.critical');
        if (!damageFx.length) {
          damageFx = $('<span>').addClass('damaged').appendTo(target);
        } else {
          finalDamage += parseInt(damageFx.text(), 10);
        }
      }
      damageFx.text(finalDamage);
      game.timeout(2000, function () {
        this.remove();
      }.bind(damageFx));
    }
    return this;
  },
  heal: function (healhp) {
    if (healhp > 0) {
      var healFx, currentHeal,
        currenthp = this.data('current hp'),
        maxhp = this.data('hp'),
        hp;
      healhp = parseInt(healhp);
      hp = currenthp + healhp;
      if (hp > maxhp) {
        healhp = maxhp - currenthp;
        if (healhp === 0) return;
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
      game.timeout(2000, function () {
        this.remove();
      }.bind(healFx));
    }
    return this;
  },
  kill: function (evt) {
    var target = evt.target,
        source = evt.source;
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
      if (target.hasClass('selected')) { target.select(); }
      else if (source.hasClass('selected')) { source.select(); }
    }
    game.timeout(800, function () {
      this.source.trigger('kill', this);
      this.target.die(this);
    }.bind(evt));
  },
  die: function (evt) {
    this.trigger('death', evt);
    this.data('killer', evt.source);
    this.addClass('dead').removeClass('target done');
    this.unselect();
    var pos = this.getPosition(), deaths,
      spot = $('#' + pos);
    if (!spot.hasClass('cript')) { spot.addClass('free'); }
    if (this.hasClass('heroes')) {
      deaths = this.data('deaths') + 1;
      this.data('deaths', deaths);
      this.find('.deaths').text(deaths);
      if (!spot.hasClass('cript')) {
        if (game.mode === 'library') {
          this.data('reborn', game.time + 1);
        } else this.data('reborn', game.time + game.deadLength);
      }
      if (this.hasClass('player')) {
        this.appendTo(game.player.heroesDeck);
      } else if (this.hasClass('enemy')) { this.appendTo(game.enemy.heroesDeck); }
    } else if (this.hasClass('towers')) {
      if (this.hasClass('player')) {
        if (game[game.mode].lose) game[game.mode].lose();
      } else if (this.hasClass('enemy')) { 
        if (game[game.mode].win) game[game.mode].win(); 
      }
    } else if (this.hasClass('units')) {
      var side = this.side();
      if (evt.source.side() != side) evt.source.damage(game.creepDeathDamage, game[side].tower, game.data.ui.pure);
      this.detach();
    } else { this.detach(); }
    return this;
  },
  reborn: function (spot, nopenalty) { //console.trace(this, spot)
    if (spot && spot.hasClass) spot = spot[0].id;
    var hp = this.data('hp'), x, y;
    if (!spot) {
      if (this.hasClass('player')) {
        x = 0;
        y = 4;
        spot = game.map.toPosition(x, y);
        while (!$('#' + spot).hasClass('free')) {
          x += 1;
          spot = game.map.toPosition(x, y);
        }
      } else if (this.hasClass('enemy')) {
        x = 8;
        y = 1;
        spot = game.map.toPosition(x, y);
        while (!$('#' + spot).hasClass('free')) {
          x -= 1;
          spot = game.map.toPosition(x, y);
        }
      }
    }
    if (spot && spot.length) {  
      var side = this.side();
      if (!nopenalty) game[game.opponent(side)].tower.damage(game.heroDeathDamage, game[side].tower, game.data.ui.pure);
      this.data('reborn', null);
      this.setCurrentHp(hp);
      this.removeClass('dead');
      this.place(spot);
      this.trigger('reborn');
      return this;
    }
  }
};
