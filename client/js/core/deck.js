game.deck = {
  extendjQuery: function () {
    $.fn.extend({
      randomCard: game.deck.randomCard,
      shuffleDeck: game.deck.shuffleDeck
    });
  },
  build: function (op) {
    var name = op.name,
      filter = op.filter,
      cb = op.cb,
      multi = op.multi,
      deckFilter = op.deckFilter,
      deck = $('<div>').addClass('deck ' + name);
    if (!game.data[name]) {
      game.states.loading.json(name, function () {
        game.deck.createDeck(deck, name, cb, filter, multi);
      });
    } else { game.deck.createDeck(deck, name, cb, filter, multi, deckFilter); }
    return deck;
  },
  createDeck: function (deck, name, cb, filter, multi, deckFilter) {
    if (name === 'heroes') { game.deck.createHeroesDeck(deck, cb, filter); }
    if (name === 'units') { game.deck.createUnitsDeck(deck, cb, filter); }
    if (name === 'skills') { game.deck.createSkillsDeck(deck, cb, filter, multi, deckFilter); }
    if (name === 'items') { game.deck.createItemsDeck(deck, cb, filter, multi, deckFilter); }
  },
  createHeroesDeck: function (deck, cb, filter) {
    var deckData = game.data.heroes,
      cards = [],
      card;
    $.each(deckData, function (heroid, herodata) {
      var found = false;
      if (filter) {
        $.each(filter, function (i, pick) {
          if (pick === heroid) { found = true; }
        });
      }
      if (found || !filter) {
        herodata.hero = heroid;
        herodata.speed = game.defaultSpeed;
        herodata.bounty = game.heroBounty;
        herodata.kd = true;
        herodata.buffsBox = true;
        herodata.className = [
          heroid,
          'heroes'
        ].join(' ');
        Object.assign(herodata, game.data.values.heroes[heroid]);
        card = game.card.build(herodata).appendTo(deck);
        cards.push(card.attr('id'));
      }
    });
    deck.data('cards', JSON.stringify(cards));
    if (cb) { cb(deck); }
  },
  createUnitsDeck: function (deck, cb, filter) {
    var deckData = game.data.units,
      cards = [],
      card;
    //console.log(deckData)
    $.each(deckData, function (unittype, units) {
      var found = false;
      if (filter) {
        $.each(filter, function (i, pick) {
          if (pick === unittype) { found = true; }
        });
      }
      if (found || !filter) {
        $.each(units, function (unitid, unitdata) {
          unitdata.type = game.data.ui.summon;
          unitdata.label = unitid;
          unitdata.unit = unittype;
          unitdata.speed = game.defaultSpeed;
          if (!unitdata.bounty) unitdata.bounty = game.unitBounty;
          unitdata.buffsBox = true;
          unitdata.className = [
            unittype+'-'+unitid,
            unittype,
            'units'
          ].join(' ');
          Object.assign(unitdata, game.data.values.units[unittype][unitid]);
          card = game.card.build(unitdata).appendTo(deck);
          cards.push(card.attr('id'));
        });
      }
    });
    deck.data('cards', JSON.stringify(cards));
    if (cb) { cb(deck); }
  },
  createSkillsDeck: function (deck, cb, filter, multi, deckFilter) {
    var deckData = game.data.skills,
      cards = [];
    $.each(deckData, function (hero, skills) {
      var found = false;
      if (filter) {
        $.each(filter, function (i, pick) {
          if (pick === hero) { found = true; }
        });
      }
      if (found || !filter) {
        $.each(skills, function (skill, skillData) {
          if (!deckFilter || (deckFilter && deckFilter.indexOf(skillData.deck) < 0 )) {
            var k;
            skillData.hero = hero;
            skillData.label = skill;
            skillData.skillId = hero + '-' + skill;
            skillData.className = [
              hero + '-' + skill,
              'skills',
              hero
            ].join(' ');
            if (skillData.type == game.data.ui.summon) skillData.className += ' summon';
            Object.assign(skillData, game.data.values.skills[hero][skill]);
            if (skillData.buff) {
              skillData.buff.buffId = hero + '-' + skill;
              skillData.buff.className = hero + '-' + skill;
              Object.assign(skillData.buff, game.data.values.skills[hero][skill].buffdata);
            }
            if (skillData.buffs) for (var buffs in skillData.buffs) {
              for (var buff in skillData.buffs[buffs]) {
                skillData.buffs[buffs][buff].buffId = hero +'-'+ skill +'.'+ buffs +'-'+ buff;
                skillData.buffs[buffs][buff].className = hero +'-'+ skill +' '+ buffs +'-'+ buff;
                Object.assign(skillData.buffs[buffs][buff], game.data.values.skills[hero][skill].buffsdata[buffs][buff]);
              }
            }
            var n = 1;
            if (multi) n = skillData.cards;
            for (k = 0; k < n; k += 1) {
              var card = game.card.build(skillData);
              card.appendTo(deck);
              cards.push(card.attr('id')); 
            }
          }
        });
      }
    });
    deck.data('cards', JSON.stringify(cards));
    if (cb) { cb(deck); }
  },
  createItemsDeck: function (deck, cb) {
    var deckData = game.data.items,
      cards = [];
    $.each(deckData, function (itemtype, itemtypes) {
      var typeContainer = $('<div>').addClass(itemtype).appendTo(deck);
      $.each(itemtypes, function (item, itemData) {
        var k;
        var cl = 'items';
        if (itemData.attribute == game.data.ui.consumable) cl += ' consumable';
        itemData.item = item;
        itemData.itemtype = itemtype;
        itemData.className = [
          item,
          itemtype,
          cl
        ].join(' ');
        Object.assign(itemData, game.data.values.items[itemtype][item]);
        if (itemData.buff) {
          itemData.buff.buffId = item;
          itemData.buff.className = item;
          Object.assign(itemData.buff, game.data.values.items[itemtype][item].buffdata);
        }
        if (itemData.buffs) for (var buffs in itemData.buffs) {
          for (var buff in itemData.buffs[buffs]) {
            itemData.buffs[buffs][buff].buffId = item +'.'+ buffs +'-'+ buff;
            itemData.buffs[buffs][buff].className = item +' '+ buffs +'-'+ buff;
            Object.assign(itemData.buffs[buffs][buff], game.data.values.items[itemtype][item].buffsdata[buffs][buff]);
          }
        }
        var card = game.card.build(itemData).appendTo(typeContainer);
        cards.push(card.attr('id'));
      });
    });
    deck.data('cards', JSON.stringify(cards));
    if (cb) { cb(deck); }
  },
  randomCard: function (noseed) {
    if (this.length) {
      if (noseed) { return $(this[parseInt(Math.random() * this.length, 10)]); }
      return $(this[parseInt(game.random() * this.length, 10)]);
    } else return this;
  },
  shuffleDeck: function () {
    var deck = this;
    var array = $('.card', deck);
    if (array.length) {
      var sharray = array.shuffle();
      $(sharray).each(function (i, el) {
        deck.append(el);
      });
    }
  }
};
