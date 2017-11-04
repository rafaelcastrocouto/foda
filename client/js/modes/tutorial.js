game.tutorial = {
  build: function () {
    if (!game.tutorial.builded) {
      game.tutorial.builded = true;
      game.tutorial.axe = $('<div>').addClass('axe tutorial');
      game.tutorial.axeimg = $('<div>').addClass('img').appendTo(game.tutorial.axe);
      game.tutorial.axebaloon = $('<div>').addClass('baloon').appendTo(game.tutorial.axe);
      game.tutorial.message = $('<div>').addClass('txt').appendTo(game.tutorial.axebaloon);
      game.tutorial.axe.appendTo(game.states.choose.el);
    }
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.message.text(game.data.ui.waiting);
    game.states.choose.enablePick();
    game.tutorial.axeshow();
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
        setTimeout(function () { this.css({opacity: 1}); }.bind(letter), (i + 1) * 50);
        i++;
      });
    });
  },
  chooseStart: function () {
    game.states.choose.randombt.show();
    $('.pickbox .card').addClass('hidden');
    $('.am, .cm, .pud, .lina, .nyx', '.pickbox').removeClass('hidden');
    game.states.choose.selectFirst();
    game.states.choose.counter.show().text(game.data.ui.clickpick);
  },
  pick: function () {
    var availableSlots = $('.slot.available').length;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    if (availableSlots === 4) {
      game.tutorial.letter(game.data.ui.axechooseorder);
    } else if (availableSlots === 3) {
      game.tutorial.letter(game.data.ui.axeheroes);
    } else if (availableSlots === 2) {
      game.tutorial.letter(game.data.ui.axeautodeck);
    } else if (availableSlots === 1) {
      game.tutorial.letter(game.data.ui.axemana);
    }
    if (availableSlots) {
      game.states.choose.counter.text(availableSlots + ' ' + game.data.ui.togo);
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
      game.tutorial.started = true;
      game.tutorial.lesson = 'Enemy';
      game.message.text(game.data.ui.battle);
      game.loader.removeClass('loading');
      game.audio.play('horn');
      game.player.placeHeroes();
      game.enemy.placeHeroes();
      game.states.table.surrender.show();
      game.states.table.skip.show().attr('disabled', true);
      game.states.table.discard.attr('disabled', true).show();
      game.turn.build(6);
      game.tutorial.axe.removeClass('up').appendTo(game.states.table.el);
      game.tutorial.axebaloon.hide();
      game.player.kills = 0;
      game.enemy.kills = 0;
      game.tutorial.moveCountValue = 5;
      game.message.text(game.data.ui.yourturn);
      game.tutorial.axe.addClass('up left');
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
      if (game.tutorial.lesson === 'Enemy')     game.tutorial.selectedTower();
      if (game.tutorial.lesson === 'Creep')     game.tutorial.selectedCreep(card);
      if (game.tutorial.lesson === 'Move')      game.tutorial.moveLesson();
      if (game.tutorial.lesson === 'Passive')   game.tutorial.selectedPassive();
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
    game.tutorial.axe.removeClass('left');
    game.tutorial.axebaloon.hide().delay(800).fadeIn('slow');
    game.tutorial.letter(game.data.ui.axecreep);
    game.player.buyCreeps(true);
    $('.player .sidehand .card').addClass('blink').on('select', game.tutorial.selected);
  },
  selectedCreep: function (card) {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.audio.play('tutorial/axemove');
    if (card.hasClass('creep')) game.tutorial.letter(game.data.ui.axesummoncreep);
    $('.player .sidehand .card, .map .player.ld').on('summon cast', game.tutorial.summonedCreep);
  },
  summonedCreep: function () {
    if (game.tutorial.lesson != 'Move') {
      game.tutorial.lesson = 'Move';
      $('.map .heroes.player').addClass('blink').on('move', game.tutorial.moveCount).on('select', game.tutorial.select);
    }
    $('.map .units.blink').removeClass('blink');      
    game.tutorial.axebaloon.hide().fadeIn('slow');
    if (game.player.skills.sidehand.children().length) game.tutorial.letter(game.data.ui.axesummonselect);
    else game.tutorial.letter(game.data.ui.axeselectplayer);
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
    if (game.tutorial.moveCountValue === 3) game.tutorial.endTurnLesson();
  },
  endTurnLesson: function () {
    $('.blink').removeClass('blink');
    game.states.table.skip.addClass('blink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.axe.addClass('left');
    game.tutorial.letter(game.data.ui.axeendturn);
    --game.tutorial.moveCountValue;
  },
  skip: function () {
    game.turn.time.text(game.data.ui.time + ': 1:30 ' + game.data.ui.night);
    game.turn.msg.text(game.data.ui.turns + ': 1/1 (2)');    
    $('.blink').removeClass('blink');
    //game.message.addClass('blink');
    if (!game.tutorial.waited) game.tutorial.moveCountValue = 4;
    else game.tutorial.moveCountValue = 2;
    game.tutorial.axebaloon.hide();
    game.tutorial.axe.addClass('left');
    game.message.text(game.data.ui.enemyturn);
    game.loader.addClass('loading');
    game.states.table.el.removeClass('turn');
    game.map.el.addClass('night');
    game.timeout(2000, game.tutorial.enemyStart);
  },
  enemyStart: function () {
    //game.message.removeClass('blink');
    game.turn.el.removeClass('show');
    game.tutorial.axebaloon.fadeIn('slow');
    game.tutorial.letter(game.data.ui.axedone);
    game.enemy.buyCreeps(true);
    $('.enemy .am-blink').first().appendTo(game.enemy.skills.hand);
    $('.enemy .kotl-leak').first().appendTo(game.enemy.skills.hand);
    $('.enemy .kotl-mana').first().appendTo(game.enemy.skills.hand);
    game.timeout(3000, game.tutorial.enemyMove);
  },
  enemyMove: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeenemymove);
    game.message.html(game.data.ui.enemymove);
    game.currentData.moves = [
      'S:'+game.map.mirrorPosition('G3')+':melee',
      'C:'+game.map.mirrorPosition('C1')+':'+game.map.mirrorPosition('D3')+':blink:am'
      //'M:'+game.map.mirrorPosition('D1')+':'+game.map.mirrorPosition('C2'),
      //'M:'+game.map.mirrorPosition('E1')+':'+game.map.mirrorPosition('E2'),
      //'C:'+game.map.mirrorPosition('F1')+':'+game.map.mirrorPosition('F1')+':mana:kotl',
    ].join('|');
    game.enemy.startMoving(game.tutorial.endTurn);
  },
  endTurn: function () {
    game.map.el.removeClass('night');
    //game.message.removeClass('blink');
    game.turn.time.text(game.data.ui.time + ': 1:30 ' + game.data.ui.day);
    $('.spot').removeClass('free');
    game.turn.el.text(game.data.ui.yourturn).addClass('show');
    game.tutorial.axebaloon.hide();
    game.audio.play('tutorial/axewait');
    game.timeout(2000, game.tutorial.attack);
  },
  attack: function () {
    game.turn.msg.text(game.data.ui.turns + ': 2/1 (3)');
    game.card.unselect();
    game.turn.el.removeClass('show');
    game.tutorial.axe.removeClass('left');
    game.enemy.skills.deck.removeClass('slide');
    $('.enemy.skills .card').fadeOut(400);
    game.tutorial.lesson = 'Attack';
    $('.map .player.heroes, .map .player.units').removeClass('done');
    $('.map .player.heroes, .map .player.units').each(function (i, card) {
      var hero = $(card),
          range = hero.data('range');
      hero.around(range, function (spot) {
        if (spot.find('.card.enemy').length) {
          hero.addClass('blink');
        }
      });
    });
    game.states.table.el.addClass('turn');
    game.tutorial.axebaloon.fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeattack);
    game.audio.play('tutorial/axeattack');
    game.tutorial.moveCountValue = 5;
    game.message.text(game.data.ui.yourturn);
    $('.map .player.heroes, .map .player.units').on('attack.tutorial', function () {
      game.card.unselect();
      --game.tutorial.moveCountValue;
      game.timeout(100, game.tutorial.passiveLesson);
    });
  },
  passiveLesson: function () {
    game.tutorial.lesson = 'Passive';
    $('.map .player').removeClass('blink');
    var card = $('.player .available.skills .am-shield'),
        hero = $('.map .player.heroes.am');
    //if (hero.hasClass('done')) {
    //  card = $('.player .available.skills .cm-aura');
    //  hero = $('.map .player.heroes.cm');
    //}
    card.first().appendTo(game.player.skills.sidehand).addClass('blink').on('select', game.tutorial.selected);
    hero.on('passive.tutorial', game.tutorial.toggleLesson);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeskillselect);
  },
  sourceBlink: function (data) { //console.log(data.card)
    if (data.card.data('source')) data.card.data('source').addClass('blink');
  },
  selectedPassive: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeskill);
  },
  toggleLesson: function () {
    game.tutorial.lesson = 'Toggle';
    $('.blink').removeClass('blink');
    $('.player .available.skills .pud-rot').first().appendTo(game.player.skills.sidehand).addClass('blink').on('select', game.tutorial.selected);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axetoggle);
    --game.tutorial.moveCountValue;
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
  },/*
  instantLesson: function () {
    game.tutorial.lesson = 'Instant';
    $('.map .player.pud').off('toggle.tutorialOff'); 
    $('.blink').removeClass('blink');
    var card = $('.player .available.skills .nyx-spike'),
        hero = $('.map .player.nyx');
    if (hero.hasClass('done')) {
      card = $('.player .available.skills .ld-rabid');
      hero = $('.map .player.ld');
    }
    card.first().appendTo(game.player.skills.sidehand).addClass('blink').on('select', game.tutorial.selected);
    hero.on('cast.tutorial', game.tutorial.castLesson);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeinstant);
    --game.tutorial.moveCountValue;
  },*/
  castLesson: function () {
    game.tutorial.lesson = 'Cast';
    $('.blink').removeClass('blink');
    card = $('.player .available.skills .am-blink');
    hero = $('.map .player.am');
    card.first().appendTo(game.player.skills.hand).addClass('blink').on('select', game.tutorial.selected);
    hero.on('cast.tutorial', game.tutorial.channelLesson);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axecast);
    --game.tutorial.moveCountValue;
    $('.spot').each(function (i, spot) {
      if (!$('.card', spot).length) $(spot).addClass('free');
    });
  },
  channelLesson: function () {
    game.tutorial.lesson = 'Channel';
    $('.blink').removeClass('blink');
    var card = $('.playerdecks .skills .cm-ult'),
        hero = $('.map .player.cm').removeClass('done');
    card.first().appendTo(game.player.skills.hand).addClass('blink').on('select', game.tutorial.selected);
    hero.on('cast.tutorial', game.tutorial.casted);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axechannel);
    --game.tutorial.moveCountValue;
  },
  casted: function () {
    --game.tutorial.moveCountValue;
    game.timeout(3000, game.tutorial.end);
  },
  surrender: function() {
    game.clear();
    game.states.changeTo('menu');
  },
  end: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.letter(game.data.ui.axeend);
    game.audio.play('tutorial/axeah');
    game.winner = game.player.name;
    game.player.points += 1;
    localStorage.setItem('points', game.player.points);
    localStorage.setItem('tutorial', 1);
    game.states.changeTo('result');
  },
  clear: function () {
    game.tutorial.lesson = '';
    game.tutorial.started = false;
    game.states.choose.back.attr('disabled', false);
    localStorage.removeItem('mode');
    if (game.tutorial.axe) {
      game.tutorial.axe.appendTo(game.states.choose.el);
      game.tutorial.axe.removeClass('up');
      game.tutorial.axe.removeClass('left');
      game.tutorial.axebaloon.hide();
    }
  }
};
