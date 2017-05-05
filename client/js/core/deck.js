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
    if (name === 'skills') { game.deck.createSkillsDeck(deck, cb, filter, multi, deckFilter); }
    if (name === 'units') { game.deck.createUnitsDeck(deck, cb, filter, multi, deckFilter); }
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
        herodata.speed = 2;
        herodata.kd = true;
        herodata.buffsBox = true;
        herodata.className = [
          heroid,
          'heroes'
        ].join(' ');
        card = game.card.build(herodata).appendTo(deck);
        cards.push(card);
      }
    });
    deck.data('cards', cards);
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
          unitdata.type = unitid;
          unitdata.speed = 2;
          unitdata.buffsBox = true;
          unitdata.className = [
            unitid,
            'units'
          ].join(' ');
          card = game.card.build(unitdata).appendTo(deck);
          cards.push(card);
        });
      }
    });
    deck.data('cards', cards);
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
          if (!deckFilter || (deckFilter && skillData.deck == deckFilter)) {
            var k;
            skillData.hero = hero;
            skillData.skill = skill;
            skillData.skillId = hero + '-' + skill;
            skillData.className = [
              hero + '-' + skill,
              'skills',
              hero
            ].join(' ');
            if (skillData.buff) {
              skillData.buff.buffId = hero + '-' + skill;
              skillData.buff.className = hero + '-' + skill;
            }
            if (skillData.buffs) for (var buffs in skillData.buffs) {
              for (var buff in skillData.buffs[buffs]) {
                skillData.buffs[buffs][buff].buffId = hero +'-'+ skill +'.'+ buffs +'-'+ buff;
                skillData.buffs[buffs][buff].className = hero +'-'+ skill +' '+ buffs +'-'+ buff;
              }
            }
            if (multi) {
              for (k = 0; k < skillData.cards; k += 1) {
                cards.push(game.card.build(skillData).appendTo(deck));
              }
            } else { cards.push(game.card.build(skillData).appendTo(deck)); }
          }
        });
      }
    });
    deck.data('cards', cards);
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
