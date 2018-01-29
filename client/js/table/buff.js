game.buff = {
  extendjQuery: function() {
    $.fn.extend({
      selfBuff: game.buff.selfBuff,
      addStun: game.buff.addStun,
      addBuff: game.buff.addBuff,
      hasBuff: game.buff.hasBuff,
      getBuff: game.buff.getBuff,
      removeBuff: game.buff.removeBuff,
      clearBuffs: game.buff.clearBuffs,
      purge: game.buff.purge
    });
  },
  addStun: function(target, skill, bonus) {
    if (!target.hasClass('towers')) {
      var stun = skill.data('stun');
      target.stopChanneling();
      target.removeClass('can-attack');
      if (bonus) stun += bonus;
      if (target.hasClass('stunned')) {
        target.removeBuff('stun');
      } else target.addClass('stunned');
      this.addBuff(target, {
        name: 'Stun',
        buffId: 'stun',
        className: 'stun',
        source: this,
        skill: skill,
        duration: stun,
        description: 'Unit is stunned and cannot move, attack or cast'
      });
    }
    return this;
  },
  selfBuff: function(skill, buffs, towerForce, fxOff) {
    //console.trace(this, skill, buffs)
    return this.addBuff(this, skill, buffs, towerForce, fxOff);
  },
  addBuff: function(target, skill, buffs, towerForce, fxOff) {
    var source = $(this);
    //console.trace(target, skill, buffs)
    if (!target.hasClass('towers') || towerForce) {
      // get buff data
      var data = skill;
      if (buffs) {
        var buffsId = buffs.split('-');
        data = skill.data('buffs')[buffsId[0]][buffsId[1]];
      } else if (skill.data && skill.data('buff')) {
        data = skill.data('buff');
      }
      if (!data.buffId) data.buffId = buffs || data.skillId || skill.data('skillId');
      if (!data.className) data.className = data.buffId;
      if (!data.name) data.name = skill.data('name');
      if (!data.source) data.source = this;
      if (!data.skill) data.skill = skill;
      if (!data.target) data.target = target;
      if (!data.description) data.description = skill.data('description');
      if (data.duration) {
        data.className += ' purgeable ' + source.side();
        data.temp = true;
      }
      // remove duplicated buff
      target.removeBuff(data.buffId);
      // create new buff
      var buff = $('<div>').addClass('buff ' + data.className).data('buff', data).attr({
        title: data.name + ': ' + data.description
      });
      buff.data(data);
      $('<div>').appendTo(buff).addClass('img');
      $('<div>').appendTo(buff).addClass('overlay');
      if (data.temp) buff.append($('<span>').text(data.duration));
      // apply buff effects
      if (!fxOff) {
        if (data['hp bonus'] && typeof (data['hp bonus']) == 'number') {
          target.setHp(target.data('hp') + data['hp bonus']);
          target.setCurrentHp(target.data('current hp') + data['hp bonus']);
        }
        if (data['damage bonus'] && typeof (data['damage bonus']) == 'number')
          target.setDamage(target.data('current damage') + data['damage bonus']);
        if (data['damage reduction'] && typeof (data['damage reduction']) == 'number')
          target.setDamage(target.data('current damage') - data['damage reduction']);
        if (data['armor bonus'] && typeof (data['armor bonus']) == 'number')
          target.setArmor(target.data('current armor') + data['armor bonus']);
        if (data['armor reduction'] && typeof (data['armor reduction']) == 'number')
          target.setArmor(target.data('current armor') - data['armor reduction']);
        if (data['resistance bonus'] && typeof (data['resistance bonus']) == 'number')
          target.setResistance(target.data('current resistance') + data['resistance bonus']);
        if (data['speed bonus'] && typeof (data['speed bonus']) == 'number')
          target.setSpeed(target.data('current speed') + data['speed bonus']);
        if (data['speed slow'] && typeof (data['speed slow']) == 'number')
          target.setSpeed(target.data('current speed') - data['speed slow']);
      }
      // append buff
      target.find('.buffs').append(buff);
      target.reselect();
      return buff;
    }
  },
  hasBuff: function(buff) {
    var target = this;
    return target.find('.buffs .' + buff).length;
  },
  getBuff: function(buff) {
    return this.find('.buffs .' + buff);
  },
  removeBuff: function(buffs, multi) {
    var target = this;
    var b;
    if (!multi) b = buffs.split(' ');
    if (multi == 'all') b = $('.buff:not([class*=aura])', target);
    if (multi == 'purge') b = $('.buff.purgeable.' + target.opponent(), target);
    $.each(b, function(i, buffId) {
      var buff;
      if (!multi) buff = target.find('.buffs > .' + buffId);
      else buff = $(buffId);
      if (buff && buff.data) {
        var data = buff.data('buff');
        if (data) {
          if (data['hp bonus'] && typeof (data['hp bonus']) == 'number') {
            target.setHp(target.data('hp') - data['hp bonus']);
            var hp = target.data('current hp') - data['hp bonus'];
            if (hp < 1) hp = 1;
            target.setCurrentHp(hp);
          }
          if (data.buffId == 'stun') target.removeClass('stunned');
          if (data['damage bonus'] && typeof (data['damage bonus']) == 'number')
            target.setDamage(target.data('current damage') - data['damage bonus']);
          if (data['damage reduction'] && typeof (data['damage reduction']) == 'number')
            target.setDamage(target.data('current damage') + data['damage reduction']);
          if (data['armor bonus'] && typeof (data['armor bonus']) == 'number')
            target.setArmor(target.data('current armor') - data['armor bonus']);          
          if (data['armor reduction'] && typeof (data['armor reduction']) == 'number')
            target.setArmor(target.data('current armor') + data['armor reduction']);
          if (data['resistance bonus'] && typeof (data['resistance bonus']) == 'number')
            target.setResistance(target.data('current resistance') - data['resistance bonus']);
          if (data['speed bonus'] && typeof (data['speed bonus']) == 'number')
            target.setSpeed(target.data('current speed') - data['speed bonus']);
          if (data['speed slow'] && typeof (data['speed slow']) == 'number')
            target.setSpeed(target.data('current speed') + data['speed slow']);
        }
        buff.remove();
      }
      target.reselect();
    });
    return this;
  },
  clearBuffs: function () {
    this.removeBuff(0,'all');
  },
  purge: function () {
    this.removeBuff(0,'purge');
  },
  turn: function (card) {
    var buffs = card.find('.buffs > .buff');
    buffs.each(function (i, buffElement) {
      var buff = $(buffElement);
      var duration = buff.data('duration'),
          data = buff.data('buff');
      buff.trigger('buffcount', {target: card, buff: buff});
      if (duration > 1) {
        duration -= 1;
        buff.data('duration', duration);
        $('span', buff).text(duration);
        var s = buff.closest('.card');
        s.reselect();
      } else if (data && data.temp && data.buffId) {
        buff.trigger('expire', {target: card, buff: buff});
        card.removeBuff(data.buffId);
      }
    });
  }
};