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
    if (!target.hasClass('towers') && !target.hasClass('cycloned')) {
      var stun = skill.data('stun');
      target.stopChanneling();
      target.removeInvisibility();
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
    if (!target.hasClass('cycloned') && (!target.hasClass('towers') || towerForce)) {
      // get buff data
      var data = skill;
      if (!buffs) {
        // BUFF
        if (skill instanceof jQuery) data = JSON.parse(skill.data('buff'));
      } else if (buffs && typeof(buffs) == 'string') {
        // BUFFS  
        var buffsId = buffs.split('-');
        var buffsData;
        if (typeof(data.buffs) == 'string') buffsData = JSON.parse(data.buffs);
        else if (skill instanceof jQuery && skill.data('buffs')) buffsData = JSON.parse(skill.data('buffs'));
        if (buffsData[buffsId[0]] && buffsData[buffsId[0]][buffsId[1]]) {
          data = buffsData[buffsId[0]][buffsId[1]];
        }
      }
      if (data) {
        if (!data.buffId) data.buffId = buffs || data.skillId;
        if (!data.buffId && skill.data) skill.data('skillId');
        if (!data.className) data.className = data.buffId;
        if (!data.name && skill.data) data.name = skill.data('name');
        if (!data.source) data.source = this.attr('id');
        if (!data.skill && skill.attr) data.skill = skill.attr('id');
        if (!data.target) data.target = target.attr('id');
        if (!data.description && skill.data) data.description = skill.data('description');
        if (data.duration && !data.unpurgeable) {
          data.className += ' purgeable ' + (source.side() || game.selectedCard.side());
        }
        if (skill.hasClass && skill.hasClass('items')) data.className += ' items '+skill.data('itemtype'); 
        // remove duplicated buff
        target.removeBuff(data.buffId);
        // create new buff
        var buff = $('<div>').addClass('buff ' + data.className).attr({
          title: data.name + ': ' + data.description
        });
        $.each(data, function(item, value) {    
          if (value && (value.constructor.name == 'Array' || value.constructor.name == 'Object')) 
            value = JSON.stringify(value); 
          //console.log(item, value )
          buff.data(item, value);
        });
        $('<div>').appendTo(buff).addClass('img');
        $('<div>').appendTo(buff).addClass('overlay');
        if (data.duration) {
          buff.append($('<span>').text(data.duration));
        }
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
          if (data['resistance reduction'] && typeof (data['resistance reduction']) == 'number')
            target.setResistance(target.data('current resistance') - data['resistance reduction']);
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
    if (buffs.hasClass && buffs.hasClass('buff')) {
      b = buffs;
      multi = true;
    } else if (!multi) b = buffs.split(' ');
    else if (multi == 'all') b = $('.buff:not([class*=aura])', target);
    else if (multi == 'purge') b = $('.buff.purgeable.' + target.opponent(), target);
    $.each(b, function(i, buffId) {
      var buff;
      if (!multi) buff = target.find('.buffs > .' + buffId);
      else buff = $(buffId);
      if (buff && buff.data) {
        var data = buff.data();
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
          if (data['resistance reduction'] && typeof (data['resistance reduction']) == 'number')
            target.setResistance(target.data('current resistance') + data['resistance reduction']);
          if (data['speed bonus'] && typeof (data['speed bonus']) == 'number')
            target.setSpeed(target.data('current speed') - data['speed bonus']);
          if (data['speed slow'] && typeof (data['speed slow']) == 'number')
            target.setSpeed(target.data('current speed') + data['speed slow']);
        }
        buff.trigger('expire', {target: target, buff: buff});
        buff.remove();
      }
    });
    if (multi == 'purge') {
      var eul = $('.buff.eul', target);
      if (eul.length) {
        target.removeClass('cycloned');
        eul.remove();
      }
    }
    target.reselect();
    return this;
  },
  purge: function () {
    this.removeStack('rooted').removeStack('disarmed');
    game.fx.stop(this.opponent(), this);
    this.removeBuff(0,'purge');
  },
  turn: function (card) {
    var buffs = card.find('.buffs > .buff');
    buffs.each(function (i, buffElement) {
      var buff = $(buffElement);
      var duration = buff.data('duration'),
          buffId = buff.data('buffId');
      buff.trigger('buffcount', {target: card, buff: buff});
      //console.log(duration)
      if (duration && duration.constructor.name == 'Number') {
        if (duration > 1) {
          duration -= 1;
          buff.data('duration', duration);
          $('span', buff).text(duration);
          var s = buff.closest('.card');
          s.reselect();
        } else if (buffId) {
          card.removeBuff(buffId);
        }
      }
    });
  }
};