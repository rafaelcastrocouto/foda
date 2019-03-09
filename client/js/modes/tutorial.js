game.tutorial = {
  build: function () {
    if (!game.tutorial.builded) {
      game.tutorial.builded = true;
      game.tutorial.axe = $('<div>').addClass('axe tutorial');
      game.tutorial.axeimg = $('<div>').addClass('img').appendTo(game.tutorial.axe);
      game.tutorial.axebaloon = $('<div>').addClass('baloon').appendTo(game.tutorial.axe);
      game.tutorial.txtflip = $('<div>').addClass('txtflip').appendTo(game.tutorial.axebaloon);
      $('<span>').addClass('txtclip').appendTo(game.tutorial.txtflip);
      $('<span>').addClass('txtclip right').appendTo(game.tutorial.txtflip);
      game.tutorial.message = $('<span>').addClass('txt').appendTo(game.tutorial.txtflip);
      $('<span>').addClass('txtclip').appendTo(game.tutorial.txtflip);
      $('<span>').addClass('txtclip right').appendTo(game.tutorial.txtflip);
      game.tutorial.axe.appendTo(game.states.choose.el);
    }
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.message.text(game.data.ui.waiting);
    game.states.choose.enablePick();
    game.tutorial.axeshow();
    game.player.type = 'challenged';
    game.enemy.type = 'challenger';
  },
  axeshow: function () {
    game.tutorial.letter(game.data.ui.axepick);
    setTimeout(function () {
      if (game.mode == 'tutorial') {
        game.tutorial.axe.addClass('up');
        game.timeout(400, function () {
          if (game.mode == 'tutorial' && game.currentState == 'choose') {
            game.audio.play('tutorial/axehere');
            game.tutorial.axebaloon.fadeIn('slow');
            game.message.text(game.data.ui.tutorialstart);
            game.loader.removeClass('loading');
          }
        });
      }
    }, 400);
  },
  letter: function (str) {
    var el = game.tutorial.message;
    var i = 0;
    el.html(str);
    $(el[0].childNodes).each(function (n, node) {
      if (node.nodeName == '#text') {
        var rep = $('<span>'+node.textContent+'</span>');
        el[0].insertBefore(rep[0], node);
        el[0].removeChild(node);
        node = rep;
      }
      else node = $(node);
      var arr = node.text().split('');
      node.empty();
      $(arr).each(function () {
        var letter = $('<span>'+this+'</span>').css({opacity: 0});
        node.append(letter);
        setTimeout(function () { this.css({opacity: 1}); }.bind(letter), (i + 1) * 20);
        i++;
      });
    });
  },
  chooseStart: function () {
    game.states.choose.randombt.show();
    $('.pickbox .card').addClass('hidden');
    $('.am, .cm, .pud, .lina, .en', '.pickbox').removeClass('hidden');
    game.states.choose.selectFirst();
    game.states.choose.counter.show().text(game.data.ui.clickpick);
  },
  pick: function () {
    var availableSlots = $('.slot.available').length;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    if (availableSlots === 4) {
      game.tutorial.letter(game.data.ui.axeheroes);
    } else if (availableSlots === 3) {
      game.tutorial.letter(game.data.ui.axemana);
    } else if (availableSlots === 2) {
      game.tutorial.letter(game.data.ui.axechooseorder);
    } else if (availableSlots === 1) {
      game.tutorial.letter(game.data.ui.axeautodeck);
    }
    if (availableSlots) {
      if (game.language.current == 'ru')
        game.states.choose.counter.text(game.data.ui.togo + ' ' + availableSlots);
      else game.states.choose.counter.text(availableSlots + ' ' + game.data.ui.togo);
    } else {
      game.states.choose.back.attr('disabled', true);
      game.loader.addClass('loading');
      game.message.text(game.data.ui.loadingdeck);
      game.states.choose.counter.text(game.data.ui.getready);
      game.audio.play('tutorial/axebattle');
      game.tutorial.letter(game.data.ui.axebattle);
      setTimeout(game.tutorial.chooseEnd, 2000);
    }
  },
  chooseEnd: function () {
    game.states.choose.fillPicks('player');
    game.states.changeTo('vs');
  },
  setTable: function () {
    if (!game.tutorial.started) {
      game.currentTurnSide = 'player';
      game.tutorial.started = true;
      game.tutorial.lesson = 'Enemy';
      game.message.text(game.data.ui.battle);
      game.loader.removeClass('loading');
      game.audio.play('horn');
      game.player.placeHeroes();
      game.enemy.placeHeroes();
      game.states.table.skip.attr('disabled', true);
      game.states.table.surrender.attr('disabled', false);
      game.skill.disableDiscard();
      game.turn.build(6);
      game.tutorial.axe.removeClass('up').appendTo(game.states.table.el);
      game.tutorial.axebaloon.hide();
      game.tutorial.moveCountValue = 5;
      game.message.text(game.data.ui.yourturn);
      game.tutorial.axe.addClass('up');
      game.enemy.tower.addClass('blink').on('select', game.tutorial.selected);
      game.timeout(400, function () {
        game.skill.build('enemy');
        game.skill.build('player', 0, function () {
          game.timeout(1000, game.tutorial.selectEnemyLesson);
        });
      });
    }
  },
  selectEnemyLesson: function () {
    game.states.table.el.addClass('turn');
    game.turn.time.text(game.data.ui.time + ': 1:00 ' + game.data.ui.day);
    game.turn.msg.text(game.data.ui.turns + ': 1/0 (1)');
    game.tutorial.axebaloon.fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeselectenemy);
  },
  selected: function (event, data) {
    var card = data.card;
    if (card.hasClass('blink')) {
      if (game.tutorial.lesson === 'Enemy') game.tutorial.selectedTower();
      if (game.tutorial.lesson === 'Creep') game.tutorial.selectedCreep(card);
      if (game.tutorial.lesson === 'Move') game.tutorial.moveLesson();
      if (game.tutorial.lesson === 'Passive') game.tutorial.selectedPassive();
      if (game.tutorial.lesson === 'Jungle') game.tutorial.selectedJungle(data);
      if (game.tutorial.lesson === 'JungleSummon') game.tutorial.selectedJungleSummon();
      if (game.tutorial.lesson === 'Passive' ||
          game.tutorial.lesson === 'Toggle'  ||
          game.tutorial.lesson === 'Channel' ||
          game.tutorial.lesson === 'Cast')      game.tutorial.sourceBlink(data);
    }
    return card;
  },
  selectedTower: function () {
    $('.map .towers.enemy').removeClass('blink').off('select');
    game.audio.play('tutorial/axeah');
    game.tutorial.lesson = 'Unselect';
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeunselect);
    game.states.table.enableUnselect();
  },
  unselected: function () {
    if (game.tutorial.lesson === 'Unselect') {
      game.tutorial.lesson = '';
      game.tutorial.creepLesson();
    }
  },
  creepLesson: function () {
    game.tutorial.lesson = 'Creep';
    game.tutorial.axebaloon.hide().delay(800).fadeIn('slow');
    game.tutorial.letter(game.data.ui.axecreep);
    game.units.buyCreeps('player', true);
    $('.player .sidehand .card').addClass('blink').on('select', game.tutorial.selected);
    game.audio.play('tutorial/axemove');
  },
  selectedCreep: function (card) {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    if (card.hasClass('creep')) game.tutorial.letter(game.data.ui.axesummoncreep);
    game.tutorial.letter(game.data.ui.axesummoncreep);
    $('.player .sidehand .card, .map .player.ld').on('summon cast', game.tutorial.summonedCreep);
  },
  summonedCreep: function () {
    if (game.tutorial.lesson != 'Move') {
      game.tutorial.lesson = 'Move';
      $('.map .heroes.player').addClass('blink can-move').on('move.tutorial', game.tutorial.moveCount).on('select', game.tutorial.select);
    }
    $('.map .units.blink').removeClass('blink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    if (game.player.skills.sidehand.children().length) game.tutorial.letter(game.data.ui.axesummonselect);
    else game.tutorial.letter(game.data.ui.axeselectplayer);
    --game.tutorial.moveCountValue;
  },
  moveLesson: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    if (game.selectedCard.hasClass('heroes')) {
      game.tutorial.letter(game.data.ui.axemove);
    }
    if (game.selectedCard.hasClass('units')) {
      game.tutorial.letter(game.data.ui.axesummoncreep);
    }
  },
  moveCount: function (event, data) {  //console.trace('moveCount', event, data);
    data.card.removeClass('blink');
    game.states.table.skip.attr('disabled', false);
    game.tutorial.letter(game.data.ui.axemoveagain);
    --game.tutorial.moveCountValue;
    if (game.tutorial.moveCountValue < 3) game.tutorial.endTurnLesson();
  },
  endTurnLesson: function () {
    $('.map .heroes.player').removeClass('blink can-move').off('move.tutorial');
    $('.blink').removeClass('blink');
    game.states.table.skip.addClass('blink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeendturn);
    game.tutorial.axe.addClass('fleft');
  },
  skip: function () {
    $('.map .player.card').removeClass('can-move');
    game.states.table.el.removeClass('turn');
    game.currentTurnSide = 'enemy';
    game.turn.time.text(game.data.ui.time + ': 1:30 ' + game.data.ui.night);
    game.turn.msg.text(game.data.ui.turns + ': 1/1 (2)');    
    $('.blink').removeClass('blink');
    game.message.text(game.data.ui.enemyturn);
    game.tutorial.letter(game.data.ui.axedone);
    game.tutorial.axebaloon.fadeIn('slow');
    game.loader.addClass('loading');
    game.camera.addClass('night');
    game.timeout(2000, game.tutorial.enemyStart);
  },
  enemyStart: function () {
    game.currentTurnSide = 'enemy';
    game.turn.el.removeClass('show');
    game.units.buyCreeps('enemy', true);
    $('.map .heroes.enemy').addClass('can-move');
    $('.enemy .ld-rabid').first().appendTo(game.enemy.skills.hand).addClass('flipped');
    $('.enemy .wk-stun').first().appendTo(game.enemy.skills.hand).addClass('flipped');
    $('.enemy .am-blink').first().appendTo(game.enemy.skills.hand).addClass('flipped');
    game.timeout(2400, game.tutorial.openShop);
  },
  openShop: function () {
    game.items.addMoney('player', 800);
    game.items.enableShop();
    $('.table .card.items').hide();
    $('.table .card.items.sheepstick').show().addClass('blink');
    game.tutorial.letter(game.data.ui.axeshop);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.states.table.shop.addClass('blink');
  },
  buyItem: function () {
    $('.table .card.items.sheepstick').removeClass('blink');
  },
  hideShop: function () {
    if ($('.player .sidehand .card.items').length) {
      game.items.disableShop();
      game.states.table.shop.removeClass('blink');
      game.timeout(1000, game.tutorial.enemyMove);
      game.tutorial.axe.removeClass('fleft');
    }
  },
  enemyMove: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeenemymove);
    game.message.html(game.data.ui.enemymove);
    var target = $('#G6').firstFreeSpotInLine($('#G5'), 8).getPosition();
    var moves = [
      'M:'+game.map.mirrorPosition('E1')+':'+game.map.mirrorPosition('E3'),
      'C:'+game.map.mirrorPosition('E3')+':'+game.map.mirrorPosition('E4')+':bear:ld',
      'C:'+game.map.mirrorPosition('G1')+':'+game.map.mirrorPosition(target)+':blink:am',
      'S:'+game.map.mirrorPosition('K5')+':melee'
      //'M:'+game.map.mirrorPosition('E1')+':'+game.map.mirrorPosition('E2'),
      //'C:'+game.map.mirrorPosition('F1')+':'+game.map.mirrorPosition('F1')+':mana:kotl',
    ].join('|');
    game.enemy.autoMove(moves, game.tutorial.endTurn);
  },
  endTurn: function () {
    game.camera.removeClass('night');
    //game.message.removeClass('blink');
    game.turn.time.text(game.data.ui.time + ': 1:30 ' + game.data.ui.day);
    $('.spot').removeClass('free');
    game.turn.el.text(game.data.ui.playerturn).addClass('show');
    game.tutorial.axebaloon.hide();
    game.audio.play('tutorial/axewait');
    $('.map .heroes.enemy').removeClass('can-move');
    game.timeout(2000, game.tutorial.useItem);
  },
  useItem: function () {
    game.currentTurnSide = 'player';
    game.turn.msg.text(game.data.ui.turns + ': 2/1 (3)');
    game.enemy.skills.deck.removeClass('slide');
    game.turn.el.removeClass('show');
    game.states.table.el.addClass('turn');
    game.message.text(game.data.ui.yourturn);
    game.card.unselect();
    $('.table .card.items.sheepstick').addClass('blink').on('cast.tutorial', game.tutorial.itemCast);
    game.tutorial.axebaloon.fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeuseitem);
  },
  itemCast: function () {
    $('.table .card.items.sheepstick').off('cast.tutorial');
    game.timeout(400, game.tutorial.attack);
  },
  attack: function () {
    game.tutorial.lesson = 'Attack';
    $('.map .player.heroes, .map .player.units').addClass('can-move can-attack');
    $('.map .player.heroes, .map .player.units').each(function (i, card) {
      var hero = $(card),
          range = hero.data('range');
      hero.around(range, function (spot) {
        if (spot.find('.card.enemy').length) {
          hero.addClass('blink');
        }
      });
    });
    game.tutorial.axebaloon.fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeattack);
    game.audio.play('tutorial/axeattack');
    $('.map .player.heroes, .map .player.units').on('attack.tutorial', function () {
      game.card.unselect();
      $('.map .player.heroes, .map .player.units').off('attack.tutorial');
      game.timeout(100, game.tutorial.passiveLesson);
    });
  },
  passiveLesson: function () {
    game.tutorial.lesson = 'Passive';
    $('.map .player').removeClass('blink');
    var card = $('.player .available.skills .lina-passive'),
        hero = $('.map .player.heroes.lina');
    card.first().appendTo(game.player.skills.sidehand).addClass('blink').on('select', game.tutorial.selected);
    hero.on('passive.tutorial', game.tutorial.jungleLesson);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeskillselect);
  },
  sourceBlink: function (data) { //console.log(data.card)
    if (data.card.data('source')) $('#'+data.card.data('source')).addClass('blink');
  },
  selectedPassive: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeskill);
  },
  jungleLesson: function () {
    game.tutorial.lesson = 'Jungle';
    $('.blink').removeClass('blink');
    var hero = $('.map .player.heroes.en').addClass('blink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axejungle);
  },
  selectedJungle: function (data) { //console.log(data)
    $('.blink').removeClass('blink');
    if (data.card.hasAllClasses('en player heroes')) {
      $('#B2').addClass('tutorialmovearea blink').on('mouseup.tutorial', game.tutorial.jungleSummonLesson);
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.letter(game.data.ui.jungleSummonLesson);
    }
  },
  jungleSummonLesson: function () {
    var hero = $('.map .player.heroes.en'),
        card = $('.player .available.skills .en-curse'),
        spot = $(this);
    if (hero.hasClass('selected')) {
      game.tutorial.lesson = 'JungleSummon';
      $('#A1').addClass('free');
      $('#B2').removeClass('tutorialmovearea blink').off('mouseup.tutorial');
      $('.map .player.heroes.en').place(spot).removeClass('can-move');
      card.first().appendTo(game.player.skills.hand).addClass('blink').on('select', game.tutorial.selected);
      hero.on('cast.tutorial', game.tutorial.toggleLesson);
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.letter(game.data.ui.axesummonjungle);
    }
  },
  selectedJungleSummon: function () {
    $('#A1').addClass('blink');
  },
  toggleLesson: function () {
    game.tutorial.lesson = 'Toggle';
    $('.blink').removeClass('blink');
    $('.map .player.heroes.en').off('cast.tutorial');
    $('.player .available.skills .pud-rot').first().appendTo(game.player.skills.sidehand).addClass('blink').on('select', game.tutorial.selected);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axetoggle);
    $('.map .player.pud').on('toggle.tutorial', game.tutorial.toggleOffLesson);
  },
  toggleOffLesson: function () {
    game.tutorial.lesson = 'ToggleOff';
    $('.map .player.pud').off('toggle.tutorial').on('toggle.tutorialOff',  game.tutorial.castLesson);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axetoggleoff);
    game.timeout(1000, function () {
      $('.map .player.pud').addClass('blink');
      $('.player .skills .pud-rot').select();
    });
  },
  castLesson: function () {
    $('.map .player.pud').off('toggle.tutorialOff');
    game.tutorial.lesson = 'Cast';
    $('.blink').removeClass('blink');
    card = $('.player .available.skills .am-blink');
    hero = $('.map .player.am');
    card.first().appendTo(game.player.skills.hand).addClass('blink').on('select', game.tutorial.selected);
    hero.on('cast.tutorial', game.tutorial.channelLesson);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axecast);
    $('.spot').each(function (i, spot) {
      if (!$('.card', spot).length) $(spot).addClass('free');
    });
  },
  channelLesson: function () {
    game.tutorial.lesson = 'Channel';
    $('.blink').removeClass('blink');
    var card = $('.playerdecks .skills .cm-ult'),
        hero = $('.map .player.cm').addClass('can-move');
    card.first().appendTo(game.player.skills.hand).addClass('blink').on('select', game.tutorial.selected);
    hero.on('cast.tutorial', game.tutorial.casted);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axechannel);
  },
  casted: function () {
    $('.playerdecks .skills .cm-ult').hide();
    game.timeout(5000, game.tutorial.end);
  },
  surrender: function() {
    game.clear();
    game.states.changeTo('menu');
  },
  end: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeend);
    game.audio.play('tutorial/axeah');
    game.winner = game.player.type;
    game.player.points += 1;
    game.setData('points', game.player.points);
    game.setData('tutorial', 'done');
    game.states.changeTo('result');
  },
  clear: function () {
    $('.table .blink').removeClass('blink');
    $('.table .card.items').show();
    game.tutorial.lesson = '';
    game.tutorial.started = false;
    game.states.choose.back.attr('disabled', false);
    if (game.tutorial.axe) {
      game.tutorial.axe.appendTo(game.states.choose.el);
      game.tutorial.axe.removeClass('up');
      game.tutorial.axe.removeClass('left fleft');
      game.tutorial.axebaloon.hide();
    }
  }
};
