game.states.choose = {
  size: 100,
  event: 'mouseup.choose touchend.choose',
  build: function () {
    this.pickbox = $('<div>').addClass('pickbox').appendTo(this.el);
    this.pickedbox = $('<div>').addClass('pickedbox').hide();
    this.slots = this.buildSlots();
    this.counter = $('<p>').addClass('counter').hide().appendTo(this.pickedbox);
    game.library.buildSkills(game.states.choose.buildDeck);
    this.buttonbox = $('<div>').addClass('buttonbox');
    this.back = $('<div>').addClass('back button alert').text(game.data.ui.back).on('mouseup touchend', this.backClick).appendTo(this.buttonbox);
    this.intro = $('<div>').addClass('intro button').text(game.data.ui.intro).on('mouseup touchend', game.library.showIntro).appendTo(this.buttonbox);
    this.randombt = $('<div>').addClass('random button').text(game.data.ui.random).on('mouseup touchend', game.states.choose.randomClick).appendTo(this.buttonbox);
    this.mydeck = $('<div>').addClass('mydeck button highlight').text(game.data.ui.mydeck).on('mouseup touchend', this.savedDeck).appendTo(this.buttonbox);
    this.librarytest = $('<div>').addClass('librarytest button highlight').text(game.data.ui.librarytest).on('mouseup touchend', this.testHeroClick).appendTo(this.buttonbox);
    this.el.append(this.buttonbox).append(this.pickedbox);
    this.video = $('<iframe>').hide().addClass('video').attr({'frameborder': 0, 'width': 760, 'height': 340, 'allow': 'autoplay; fullscreen', 'rel': 0}).appendTo(this.pickbox);
  },
  start: function () {
    $('.choose .buttonbox .button').not('.back').hide();
    game.audio.loopSong('SneakyAdventure');
    var hero = game.getData('choose');
    this.sort();
    $('.slot').removeClass('available');
    $('.slot:nth-child(1)').addClass('available');
    if (game.size == 's3v3' || game.size == 's5v5') {
      $('.slot:nth-child(2)').addClass('available');
      $('.slot:nth-child(3)').addClass('available');
    }
    if (game.size == 's5v5') {
      $('.slot:nth-child(4)').addClass('available');
      $('.slot:nth-child(5)').addClass('available');
    }
    if (game.mode != 'library') this.selectFirst('force');
    if (game.mode && game[game.mode].chooseStart) game[game.mode].chooseStart(hero);
  },
  buildDeck: function (libdeck) {
    return game.deck.build({
      name: 'heroes', 
      cb: function (pickDeck) {
        game.states.choose.pickDeck = pickDeck;
        pickDeck.addClass('pickdeck').appendTo(game.states.choose.pickbox);
        $.each(JSON.parse(pickDeck.data('cards')), function (i, cardId) {
          card = $('#'+cardId);
          card[0].dataset.index = i;
          //if (card.data('disable')) card.addClass('dead');
          card.on(game.states.choose.event, game.states.choose.select);
        });
        pickDeck.width(game.states.choose.size * (pickDeck.children().length));
        
      }
    });
  },
  buildSlots: function () {
    var slots = [];
    for (var s = 0; s < 5; s += 1) {
      slots.push($('<div>').appendTo(this.pickedbox).attr({ title: game.data.ui.rightpick }).data('slot', s).addClass('slot available').on('mouseup touchend', this.pick));
    }
    return slots;
  },
  select: function (force) {
    var card = $(this);//console.log('select', game.events.dragging, card, force)
    if (card.hasClass && card.hasClass('card')) {
      if (force != 'force' && card.hasClass('selected') && !game.events.dragging) {
        if (card.hasClass('zoom')) {
          $('.choose .pickedbox').removeClass('transparent');
          game.states.choose.removeZoom(card);
        }
        else {
          $('.choose .pickedbox').addClass('transparent');
          game.states.choose.addZoom(card);
        }
      } else if (force == 'force' || !game.events.dragging) {
        if (game.mode == 'library') game.library.select(card, force);
        $('.choose .selected').removeClass('selected draggable');
        $('.choose .half').removeClass('half');
        card.addClass('selected');
        card.prev().addClass('half');
        card.next().addClass('half');
        if (game.mode != 'library') card.addClass('draggable');
        var index = card.siblings(':visible').addBack().index(card);
        if (index === undefined) index = card.index();
        game.states.choose.pickDeck.css('left', index * -0.78 * game.states.choose.size);
        if (!card.hasClass('dead')) game.setData('choose', card.data('hero')); 
      }
    }
    if (game.events.dragging && force && force.target && force.type == 'touchend') game.states.choose.pick.call($(force.target), force);
    if (force && force.preventDefault) {
      game.events.end(force);
      force.preventDefault();
    } return false;
  },
  addZoom: function (card) {
    $('.choose .card').addClass('transparent');
    card.addClass('zoom').removeClass('transparent draggable'); //console.log('clicked hero add')
    $('.choose .slot').addClass('transparent');
    game.states.choose.buttonbox.addClass('hidden');
  },
  removeZoom: function (card) {
    $('.choose .card').removeClass('transparent');
    card.removeClass('zoom'); //console.log('clicked hero rem')
    game.states.choose.buttonbox.removeClass('hidden');
    $('.choose .slot').removeClass('transparent');
    if(game.mode != 'library') card.addClass('draggable');
  },
  enablePick: function () {
    game.states.choose.pickEnabled = true;
    game.states.choose.pickedbox.show();
  },
  disablePick: function () {
    game.states.choose.pickEnabled = false;
  },
  pick: function (event) { //console.log('pick')
    var card,
      slot = $(this).closest('.slot'),
      pick = $('.pickbox .card.selected');
    if (!slot.length) slot = $('.slot.drop');
    if (!slot.length) slot = $('.card.picked.drop').parent();
    //console.log(slot, pick)
    if (!pick.data('disable') &&
        game.states.choose.pickEnabled &&
        game.mode !== 'library') {
      game.states.choose.mydeck.attr('disabled', true);
      game.audio.play('activate');
      if (slot.hasClass('available')) {
        slot.removeClass('available');
        var prev = pick.prevAll(':visible').first();
        if (prev.length) card = prev;
        else card = pick.nextAll(':visible').first();
      } else {
        card = slot.children('.card');
        card.on(game.states.choose.event, game.states.choose.select).insertBefore(pick).removeClass('picked');
      }
      //console.log(card)
      pick.addClass('picked').appendTo(slot).clearEvents('choose');
      game.states.choose.sort();
      game.states.choose.select.call(card, 'force');
      if (game[game.mode] && game[game.mode].pick) game[game.mode].pick();
    }
    if (event.type == 'touchend') return false;
  },
  selectFirst: function (force) {
    var first = game.states.choose.pickDeck.children(':visible').first();
    this.select.call(first, force);
  },
  selectHero: function (hero, force) {
    var card = game.states.choose.pickDeck.children('.'+hero);
    this.select.call(card, force);
  },
  sort: function () {
    $('.pickdeck .card').sort(function (a, b) {
      return a.dataset.index - b.dataset.index;
    }).appendTo('.pickdeck');
  },
  savedDeck:  function () {
    if (!$(this).attr('disabled')) {
      $(this).attr('disabled', true);
      var deck = game.getData('mydeck');
      if (deck) deck = deck.split(',');
      if (deck && deck.length == 5) {
        game.states.choose.randombt.attr('disabled', true);
        game.states.choose.remember(deck);
        if (game[game.mode].chooseEnd) {
          game.states.choose.selectFirst();
          game.timeout(1000, game[game.mode].chooseEnd);
        }
      }
    }
    return false;
  },
  remember: function (deck) {
    $('.slot').each(function (i) {
      var slot = $(this),
          hero = deck[i],
          card = $('.pickbox .card.'+hero);
      if (card && slot.hasClass('available')) {
        slot.append(card).removeClass('available selected');
      }
      if ($('.choose .card.selected').length === 0) { game.states.choose.selectFirst(); }
    });
  },
  randomClick: function (e) {
    if (!$(this).attr('disabled')) {
      $(this).attr('disabled', true);
      game.states.choose.randomFill();
      if (game[game.mode].chooseEnd) {
        game.timeout(1000, game[game.mode].chooseEnd);
      }
    }
    e.preventDefault();
    return false;
  },
  randomFill: function (cb) {
    $('.slot:visible').each(function () {
      var slot = $(this), card;
      if (slot.hasClass('available')) {
        card = $('.pickbox .card').not('.dead, .hidden').randomCard('noseed');
        slot.append(card).removeClass('available selected');
      }
    });
    //game.states.choose.selectFirst();
    if (cb) cb();
  },
  fillPicks: function (side, picked) {
    if (!side) side = 'player';
    if (!game[side].picks) {
      game[side].picks = [];
      $('.slot').each(function () { 
        var slot = $(this), card = slot.find('.card');
        game[side].picks[slot.data('slot')] = card.data('hero');
      });
    }
    if (picked && side == 'player') game.setData('mydeck', game.player.picks.join('|'));
    if (picked && side == 'enemy') game.setData('mysecdeck', game.enemy.picks.join('|'));
  },
  playVideo: function (link) {
    //library only
    var t;
    if (!game.states.choose.videoPlaying && link) {
      game.states.choose.videoPlaying = true;
      game.states.choose.video.attr({'src': 'https://www.youtube.com/embed/' + link + '?autoplay=1'}).show();
      t = game.states.choose.intro.text();
      t = '■' + t.substr(1);
      game.states.choose.intro.text(t).addClass('playing');
    } else {
      game.states.choose.videoPlaying = false;
      game.states.choose.video.attr({'src': 'about:blank'}).hide();
      t = game.states.choose.intro.text();
      t = '▶' + t.substr(1);
      game.states.choose.intro.text(t).removeClass('playing');
    }
  },
  testHeroClick: function () {
    //library only
    if (!game.states.choose.librarytest.attr('disabled')) {
      game.library.chooseEnd();
    } else game.overlay.alert('Sorry but this hero is still under development!');
    return false;
  },
  backClick: function () {
    if (!$(this).attr('disabled')) {
      if (game.mode == 'online') {
        game.online.backClick();
      } else if (game.mode == 'single') {
        game.states.changeTo('campaign');
      } else if (game.mode == 'local' || game.mode == 'library') {
        var mode = game.mode;
        game.clear();
        game.setMode(mode);
        game.states.changeTo('config');
      } else {
        game.clear();
        game.states.changeTo('menu');
      }
      game.setData('mode', false);
    }
    return false;
  },
  clear: function (fast) {
    $('.slot .card.skills').appendTo(game.library.skills);
    $('.pickbox .card').removeClass('hidden');
    $('.slot').addClass('available');
    if (this.mydeck) this.mydeck.attr('disabled', false);
    if (this.randombt) this.randombt.attr('disabled', false);
    if (this.back) this.back.attr({disabled: false});
    if (this.counter) this.counter.hide();
    if (this.pickedbox) this.pickedbox.hide();
    $('.choose .buttonbox .button').not('.back').hide();
    if (this.video) this.playVideo(); //clear video iframe
    $('.slot .card.heroes').prependTo(this.pickDeck).on(game.states.choose.event, game.states.choose.select);
    this.sort();
    $('.choose .card').removeClass('transparent zoom');
    $('.choose .pickedbox').removeClass('transparent');
    game.states.choose.lockZoom=false;
  }
};
