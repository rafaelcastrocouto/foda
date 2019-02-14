game.items = {
  build: function (side) {
    if (!game.items.builded) {
      game.items.builded = true;
      this.shop = $('<div>').addClass('shop').appendTo(game.camera);
    }
    game.itemsDeck = game.deck.build({
      name: 'items',
      cb: function (deck) {  //console.log(deck.data('cards'));
        deck.addClass('items').appendTo(game.items.shop);
        $.each(deck.data('cards'), function(i, card) {
          card.on('mousedown touchstart', game.card.select).addClass('buy');
        });
      }
    });
  },
  clone: function (cardEl) {
    var card = $(cardEl);
    return card.clone().data(card.data()).on('mousedown touchstart', game.card.select);
  },
  enableShop: function () {
    game.items.shopEnabled = true;
    var side = 'player';
    if (game.mode == 'local') side = game.currentTurnSide;
    game.states.table.shop.attr('disabled', false);
    var money = '';
    if (side) money = ' ($'+game[side].money+')';
    if (game.items.shopOpen) {
      game.states.table.shop.text(game.data.ui.close + money);
    } else game.states.table.shop.text(game.data.ui.shop + money);
  },
  shopClick: function () {
    var side = 'player';
    if (game.mode == 'local') side = game.currentTurnSide;
    if (game.selectedCard && game.selectedCard.hasClass('items')) {
      if (game.selectedCard.hasClass('buy')) game.items.buyItem(side);
      else if (game.mode !== 'tutorial') game.items.sellItem();
    } else {
      game.items.shopOpen = !game.items.shopOpen;
      game.items.shop.toggleClass('show'); 
      if (game.items.shopOpen) {
        game.items.updateShop(side);
      } else {
        game.items.hideShop(side);
      }
    }
  },
  updateShop: function (side, force) {
    if (game.canPlay() || force) {
      var money = '';
      if (side) money = ' ($'+game[side].money+')';
      if (game.items.shopOpen) game.states.table.shop.text(game.data.ui.close + money);
      else game.states.table.shop.text(game.data.ui.shop + money);
      $.each(game.itemsDeck.data('cards'), function(i, card) {
        if (side && card.data('price') > game[side].money) card.addClass('expensive');
        else card.removeClass('expensive');
      });
      if (game.selectedCard && game.selectedCard.hasClass('buy')) game.selectedCard.reselect();
    } 
  },
  hideShop: function (side) {
    var money = '';
    if (side) money = ' ($'+game[side].money+')';
    if (!game.items.sellMode) game.states.table.shop.text(game.data.ui.shop + money);
    if (game.selectedCard && game.selectedCard.hasAllClasses('items buy')) game.card.unselect();
    if (game.mode == 'tutorial') game.tutorial.hideShop();
  },
  disableShop: function () {
    game.items.shopEnabled = false;
    game.items.shopOpen = false;
    game.items.sellMode = false;
    game.states.table.shop.text(game.data.ui.discard).attr('disabled', true);
    if (game.selectedCard && game.selectedCard.hasAllClasses('items buy')) game.card.unselect();
    if (game.items.shop) game.items.shop.removeClass('show');
  },
  addMoney: function (side, money) {
    if (side && money) {
      if (!game[side].money) game[side].money = money;
      else game[side].money += money;
      if (game[side].money > game.maxMoney) game[side].money = game.maxMoney;
      game.items.updateShop(side);
    }
  },
  enableBuy: function () {
    game.items.sellMode = false;
    game.states.table.shop.attr('disabled', game.selectedCard.hasClass('expensive'));
    game.states.table.shop.text(game.data.ui.buy + ' ($'+game.selectedCard.data('price')+')');
  },
  enableSell: function () {
    if (game.mode !== 'tutorial') {
      game.items.sellMode = true;
      game.states.table.shop.text(game.data.ui.sell + ' ($'+Math.floor(game.selectedCard.data('price')/2)+')');
    }
  },
  buyItem: function (side) {
    var card = game.selectedCard;
    var item = card.data('item');
    var itemtype = card.data('itemtype');
    var move = 'B:' + item + ':' + itemtype;
    game.history.saveMove(move);
    if (game.mode == 'online') game.currentMoves.push(move);
    card.removeClass('buy').appendTo(game[side].skills.sidehand).addClass(side);
    if (card.data('cards')) {
      for (var i=1; i<card.data('cards'); i++) {
        game.items.clone(card).removeClass('selected').appendTo(game[side].skills.sidehand);
      }
    }
    game.items.addMoney(side, -card.data('price'));
    game.card.unselect();
    if (game.mode == 'tutorial') game.tutorial.buyItem();
  },
  sellItem: function () {
    var side = game.selectedCard.side();
    game.items.addMoney(side, game.selectedCard.data('price')/2);
    game.items.updateShop(side, 'force');
    game[side].discard(game.selectedCard);
    game.items.sellMode = false;
  },
  clear: function () {
    game.items.disableShop();
    game.player.money = 0;
    game.enemy.money = 0;
  },
  healing: {
    faerie: {
      cast: function (skill, target) {
        target.heal(skill.data('heal'));
      }
    },
    tango: {
      cast: function (skill, target) {
        if (target.hasClass('trees')) {
          game.tree.destroy(target);
        } else {
          var buff = target.selfBuff(skill);
          target.heal(buff.data('heal'));
          buff.on('buffcount', game.items.healing.tango.buffcount);
          buff.on('expire', game.items.healing.tango.buffcount);
        }
      },
      buffcount: function (event, eventdata) {
        var target = eventdata.target;
        var buff = eventdata.buff;
        if (buff.data('duration') !== 3) target.heal(buff.data('heal'));
      }
    },
    vitality: {
      cast: function (skill, target) {
        target.selfBuff(skill);
      }
    },
    meka: {
      cast: function (skill, target) {
        $('.map .card.' + target.side()).not('.dead, .towers, .ghost').each(function () {
          $(this).heal(skill.data('heal'));
        });
        game.audio.play('items/meka');
      }
    },
    heart: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
        buff.on('buffcount', game.items.healing.tango.buffcount);
      },
      buffcount: function (event, eventdata) {
        var target = eventdata.target;
        var buff = eventdata.buff;
        target.heal(buff.data('heal'));
      }
    }
  },
  mana: {
    clarity: {
      cast: function (skill, target) {
        game.skill.buyCardsFromHero(target);
        var buff = target.selfBuff(skill);
        var side = target.side();
        target.on(side + 'turnstart.clarity', game.items.mana.clarity.turnstart);
        target.on('attacked', game.items.mana.clarity.attacked);
      },
      attacked: function (event, eventdata) {
        var target = eventdata.target;
        var side = target.side();
        var buff = target.getBuff('clarity');
        buff.remove();
        target.off(side + 'turnstart.clarity');
      },
      turnstart: function (event, eventdata) {
        var target = eventdata.target;
        var side = target.side();
        game.skill.buyCardsFromHero(target);
        target.off(side + 'turnstart.clarity');
      }
    },
    soul: {
      cast: function (skill, target) {
        var side = target.side();
        var finalDamage = skill.data('damage');
        var hp = target.data('current hp') - finalDamage;
        if (hp < 1) finalDamage += hp + 1;
        target.damage(finalDamage, target, game.data.ui.pure);
        game.skill.buyCardsFromHero(target, skill.data('skill cards'));
        game.audio.play('items/soul');
      }
    },
    void: {
      cast: function (skill, target) {
        var side = target.side();
        game[side].cardsPerTurn += 1;
      }
    },
    diffusal: {
      cast: function (skill, target) {
        var side = target.side();
        var hero = target.data('hero');
        $('.'+side+' .hand .'+hero).each(function () {
          $(this).discard();
        });
      }
    },
    refresher: {
      cast: function (skill, target) {
        var side = target.side();
        game.skill.buyCardsFromHero(target, skill.data('skill cards'));
        game.audio.play('items/refresher');
      }
    }
  },
  armor: {
    ring: {
      cast: function (skill, target) {
        target.selfBuff(skill);
      }
    },
    buckler: {
      cast: function (skill, target) {
        $('.map .card.' + target.side()).not('.dead, .towers, .ghost').each(function () {
          $(this).selfBuff(skill);
        });
        game.audio.play('items/buckler');
      }
    },
    medallion: {
      cast: function (skill, target) {
        target.selfBuff(skill);
        game.audio.play('items/medallion');
      }
    },
    talisman: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
        target.on('attacked.talisman', game.items.armor.talisman.attacked);
      },
      attacked: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var buff = target.getBuff('talisman');
        var misschance = buff.data('miss') / 100;
        if (game.random() < misschance) {
          source.data('miss-attack', true);
        }
      }
    },
    blademail: {
      cast: function (skill, target) {
        target.addClass('blademail');
        var buff = target.selfBuff(skill);
        buff.on('expire', game.items.armor.blademail.expire);
        target.on('damage.blademail', game.items.armor.blademail.damage);
        game.audio.play('items/blademail');
      },
      damage: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        if (source.hasClasses('heroes units') && !source.hasClass('blademail')) {
          target.damage(eventdata.originalDamage, source, eventdata.type);
        }
      },
      expire: function (event, eventdata) {
        var target = eventdata.target;
        target.removeClass('blademail');
        target.off('damage.blademail');
      }
    }
  },
  attack: {
    quelling: {
      cast: function (skill, target) {
        target.addClass('quelling');
        var buff = target.selfBuff(skill);
        target.data('unit damage bonus', buff.data('unit damage bonus'));
      }
    },
    broadsword: {
      cast: function (skill, target) {
        target.selfBuff(skill);
      }
    },
    madness: {
      cast: function (skill, target) {
        target.selfBuff(skill);
        game.audio.play('items/madness');
      }
    },
    crystalys: {
      cast: function (skill, target) {
        target.selfBuff(skill);
        target.on('pre-attack.crystalys', game.items.attack.crystalys.attack);
      },
      attack: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var damage = eventdata.damage;
        var buff = source.getBuff('crystalys');
        var chance = buff.data('chance') / 100;
        var bonus = buff.data('multiplier');
        if (game.random() < chance && target.side() == source.opponent() && !source.data('miss-attack')) {
          source.data('critical-attack', bonus);
        }
      }
    },
    echo: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
        buff.data('echo-enabled', true);
        target.on('attack.echo', game.items.attack.echo.attack);
        target.on('turnend.echo', game.items.attack.echo.turnend);
      },
      attack: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var buff = source.getBuff('echo');
        if (buff.data('echo-enabled') && (target.side() == source.opponent()) && (eventdata.tag !== 'echo')) {
          game.timeout(600, source.attack.bind(source, target, 'force', 'echo'));
          buff.data('echo-enabled', false);
        }
      },
      turnend: function (event, eventdata) {//console.log(target, card)
        var target = eventdata.target;
        var buff = target.getBuff('echo');
        buff.data('echo-enabled', true);
      }
    }
  },
  resistance: {
    cloak: {
      cast: function (skill, target) {
        target.selfBuff(skill);
      }
    },
    pipe: {
      cast: function (skill, target) {
        $('.map .card.' + target.side()).not('.dead, .towers, .ghost').each(function () {
          $(this).selfBuff(skill);
        });
        game.audio.play('activate');
      }
    },
    linken: {
      cast: function (skill, target) {
        target.addClass('linken');
        var buff = target.selfBuff(skill);
        buff.on('expire', game.items.resistance.linken.expire);
        target.on('casted.linken', game.items.resistance.linken.casted);
      },
      casted: function (event, eventdata) {
        var target = eventdata.target;
        target.removeBuff('linken');
        game.audio.play('items/linken');
        target.off('casted.linken');
      },
      expire: function (event, eventdata) {
        var target = eventdata.target;
        target.removeClass('bkb');
        target.off('casted.linken');
      }
    },
    lotus: {
      cast: function (skill, target) {
        target.selfBuff(skill);
        target.on('casted', game.items.resistance.lotus.casted);
      },
      casted: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var skill = eventdata.skill;
        game.audio.play('items/lotus');
        game.timeout(600, target.cast.bind(target, skill, source));
      }
    },
    bkb: {
      cast: function (skill, target) {
        target.stopChanneling();
        target.purge();
        target.addClass('bkb');
        var buff = target.selfBuff(skill);
        buff.on('expire', game.items.resistance.bkb.expire);
        game.audio.play('items/bkb');
      },
      expire: function (event, eventdata) {
        var target = eventdata.target;
        target.removeClass('bkb');
      }
    }
  },
  arcane: {
    dust: {
      cast: function (skill, target) {
        var range = skill.data('aoe range');
        target.opponentsInRange(range, function (card) {
          card.removeClass('invisible');
        });
      }
    },
    glimmer: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
        target.addInvisibility(buff);
      }
    },
    ethereal: {
      cast: function (skill, target) {
        target.addStack('ethereal');
        var buff = target.selfBuff(skill);
        buff.on('expire', game.items.arcane.ethereal.expire);
      },
      expire: function (event, eventdata) {
        var target = eventdata.target;
        target.removeStack('ethereal');
      }
    },
    sheepstick: {
      cast: function (skill, target) {
        target.stopChanneling();
        target.addClass('sheep').removeClass('can-attack');
        target.addStack('disarmed').addStack('silenced');
        var buff = target.selfBuff(skill);
        buff.on('expire', game.items.arcane.sheepstick.expire);
      },
      expire: function (event, eventdata) {
        var target = eventdata.target;
        target.removeClass('sheep');
        target.removeStack('disarmed').removeStack('silenced');
      }
    },
    kaya: {
      cast: function (skill, target) {
        target.data('skillDamageBonus', skill.data('multiplier'));
        target.selfBuff(skill);
        target.addInvisibility();
      }
    }
  },
  movement: {
    windlace: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
      }
    },
    boots: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
      }
    },
    drums: {
      cast: function (skill, target) {
        $('.map .card.' + target.side()).not('.dead, .towers, .ghost').each(function () {
          $(this).selfBuff(skill);
        });
      }
    },
    skadi: {
      cast: function (skill, target) {
        target.selfBuff(skill, 'skadi-target');
        target.on('attack.skadi', game.items.movement.skadi.attack);
      },
      attack: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var buff = source.getBuff('skadi-target');
        var skill = buff.data('skill');
        if (!target.hasClasses('bkb') && target.side() == source.opponent() && !source.data('miss-attack')) {
          source.addBuff(target, skill, 'skadi-attacked');
        }
      }
    },
    phase: {
      cast: function (skill, target) {
        target.addClass('phased');
        var buff = target.selfBuff(skill);
      }
    }
  },
  range: {
    tp: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
        game.skill.channel(skill, target);
        target.on('channelend', this.channelend);
      },
      channelend: function (event, eventdata) {
        var source = eventdata.source;
        var side = source.side();
        var destiny = $('.'+side+'area.fountain.free');
        if (!destiny.length) {
          var targetSpots = [];
          game[side].tower.around(2, function (spot) {
            if (spot.hasClass('free')) targetSpots.push(spot);
          });
          destiny = targetSpots[parseInt(game.random() * targetSpots.length)];
        }
        if (destiny) {
          source.place(destiny);
        }
        source.removeClass('tp');
        source.removeBuff('tp');
      }
    },
    rod: {
      cast: function (skill, target) {
        target.addStack('rooted').removeClass('can-move');
        var buff = target.selfBuff(skill);
        buff.on('expire', game.items.range.rod.expire);
      },
      expire: function (event, eventdata) {
        var target = eventdata.target;
        target.removeStack('rooted');
      }
    },
    blinkdagger: {
      cast: function (skill, target) {
        if (target.hasClass('free')) skill.data('source').place(target);
      }
    },
    lens: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
        target.data('skill range bonus', buff.data('skill range bonus'));
      }
    },
    dragon: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
        target.data('attack range bonus', buff.data('attack range bonus'));
      }
    }
  },
  relic: {
    eul: {
      cast: function (skill, target) {
        target.stopChanneling();
        if (skill.side() == target.side()) 
        target.purge();
        var buff = target.selfBuff(skill);
        buff.on('expire', game.items.relic.eul.expire);
        target.addClass('cycloned');
      },
      expire: function (event, eventdata) {
        var target = eventdata.target;
        var buff = eventdata.buff;
        var skill = buff.data('skill');
        target.removeClass('cycloned');
        if (skill.side() == target.opponent()) target.damage(buff.data('damage'), target, game.data.ui.pure);
      }
    },
    morbid: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
        target.on('attack.morbid', this.attack);
      },
      attack: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var damage = eventdata.damage;
        var buff = source.getBuff('morbid');
        var lifesteal = buff.data('lifesteal') / 100;
        if (target.side() == source.opponent() && !source.data('miss-attack')) 
          source.heal(damage * lifesteal);
      }
    },
    halberd: {
      cast: function (skill, target) {
        target.addStack('disarmed').removeClass('can-attack');
        var buff = target.selfBuff(skill);
        buff.on('expire', game.items.relic.halberd.expire);
      },
      expire: function (event, eventdata) {
        var target = eventdata.target;
        target.removeStack('disarmed');
      }
    },
    shivas: {
      cast: function (skill, target) {
        target.opponentsInRange(skill.data('aoe range'), function (card) {
          target.damage(skill.data('damage'), card, skill.data('damage type'));
          if (!card.hasClasses('bkb cycloned')) {
            target.addBuff(card, skill);
          }
        });
      }
    },
    meteor: {
      cast: function (skill, target) {
        game.fx.add('meteor-cast', target);
        target.inRange(skill.data('aoe range'), function (spot) {
          var card = $('.card.'+skill.opponent(), spot);
          if (card) {
            target.damage(skill.data('damage'), card, skill.data('damage type'));
            if (!card.hasClasses('bkb cycloned')) {
              target.addStun(card, skill);
              var buff = target.addBuff(card, skill);
              card.on('turnend.meteor', game.items.relic.meteor.turnend.bind(this, target, card, skill));
              buff.on('expire', game.items.relic.meteor.expire.bind(this, target, card));
            }
          }
        });
      },
      turnend: function (target, card, skill) {//console.log(target, card)
        var buff = card.getBuff('meteor');
        target.damage(buff.data('dot'), card, buff.data('damage type'));
      },
      expire: function (target, card) {
        var buff = card.getBuff('meteor');
        target.damage(buff.data('dot'), card, buff.data('damage type'));
        target.off('turnend.meteor');
      }
    }
  },
  armaments: {
    vennon: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill, 'vennon-target');
        target.on('attack.vennon', game.items.armaments.vennon.attack);
      },
      attack: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var buff = source.getBuff('vennon-target');
        var skill = buff.data('skill');
        if (!target.hasClasses('bkb') && target.side() == source.opponent() && !source.data('miss-attack')) {
          var attackedbuff = source.addBuff(target, skill, 'vennon-attacked');
          target.on('turnend.vennon', game.items.armaments.vennon.turnend.bind(this, source, target));
          attackedbuff.on('expire', game.items.armaments.vennon.expire.bind(this, source, target));
        }
      },
      turnend: function (source, target) {//console.log(target, card)
        var buff = target.getBuff('vennon-attacked');
        source.damage(buff.data('dot'), target, buff.data('damage type'));
      },
      expire: function (source, target) {
        var buff = target.getBuff('vennon-attacked');
        source.damage(buff.data('dot'), target, buff.data('damage type'));
        target.off('attack.vennon');
      }
    },
    desolator: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill, 'desolator-target');
        target.on('attack.desolator', game.items.armaments.desolator.attack);
      },
      attack: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var buff = source.getBuff('desolator-target');
        var skill = buff.data('skill');
        if (!target.hasClasses('bkb') && target.side() == source.opponent() && !source.data('miss-attack')) {
          source.addBuff(target, skill, 'desolator-attacked');
        }
      }
    },
    manta: {
      cast: function (skill, target) {
        var freespots = [], randomSpot;
        target.around(skill.data('aoe range'), function (spot) {
          if (spot.hasClass('free')) freespots.push(spot);
        });
        for (var i=0; i<skill.data('illusions'); i++) {
          if (freespots.length) {
            randomSpot = freespots[parseInt(game.random() * freespots.length)];
            randomSpot.removeClass('free');
            var illusion = game.skill.illusion(target).appendTo(randomSpot);
            illusion.data('current damage', parseInt(target.data('current damage')/2));
            illusion.on('damage', function () {
              this.remove();
            }.bind(illusion));
            freespots.erase(randomSpot);
          }
        }
      }
    },
    basher: {
      cast: function (skill, target) {
        var side = skill.side();
        game[side].tower.damage(skill.data('damage'), target, skill.data('damage type'));
        game[side].tower.addStun(target, skill);
      }
    },
    radiance: {
      cast: function (skill, target) {
        var buff = target.selfBuff(skill);
        target.on('turnend.radiance', game.items.armaments.radiance.turnend.bind(this, skill, target, buff));
      },
      turnend: function (skill, target, buff) {
        target.around(skill.data('aoe range'), function (spot) {
          var card = $('.card.'+skill.opponent(), spot);
          if (card) {
            target.damage(buff.data('damage'), card, buff.data('damage type'));
          }
        });
      }
    }
  }
};
