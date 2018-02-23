game.library = {
  build: function () {
    game.library.buildSkills();
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.player.type = 'challenged';
    game.enemy.type = 'challenger';
    game.setData('challenged', game.player.name);
    game.setData('challenger', game.enemy.name);
  },
  buildSkills: function (cb) {
    if (!game.library.skills) {
      game.library.skills = game.deck.build({
        name: 'skills',
        deckFilter: [game.data.ui.buy, game.data.ui.summon],
        cb: function (deck) {
          deck.addClass('library').hide().appendTo(game.states.choose.el);
          $.each(deck.data('cards'), function (i, skill) {
            skill.addClass('player');
          });
          if (cb) cb(deck);
        }
      });
    }
  },
  chooseStart: function (hero) {
    game.states.choose.pickedbox.show();
    game.states.choose.intro.show();
    game.states.choose.librarytest.show();
    game.loader.removeClass('loading');
    $('.slot').removeClass('available');
    game.recovering = false;
    game.message.text(game.data.ui.library);
    if (hero) game.states.choose.selectHero(hero, 'force');
    else game.states.choose.selectFirst('force');
  },
  select: function (card, force) { 
    var hero = card.data('hero'),
        heroSkills,
        disabled;
    if (hero !== $('.choose .card.selected').data('hero') || force) {
      disabled = card.hasClass('dead');
      $('.slot .card.skills').appendTo(game.library.skills);
      heroSkills = $('.library.skills .card.'+hero);
      $('.slot').each(function (i) {
        var skill = $(heroSkills[i]); 
        if (disabled) skill.addClass('dead');
        skill.appendTo(this);
      });
      game.states.choose.pickedbox.hide().fadeIn();
      $('.slot:empty').hide();
      if (!card.data('disable')) {
        game.library.hero = card.data('hero');
        game.setData('choose', game.library.hero);
      }
      game.states.choose.intro.attr('disabled', !game.data.heroes[game.library.hero].intro);
      game.states.choose.librarytest.attr('disabled', !!card.data('disable'));
    }
    game.states.choose.playVideo();
  },
  chooseEnd: function () {
    game.states.choose.clear();
    game.states.changeTo('vs');
  },
  setTable: function () {
    game.player.placeHeroes();
    game.enemy.placeHeroes();
    game.states.table.back.show();
    game.states.table.surrender.hide();
    game.items.enableShop();
    game.states.table.enableUnselect();
    game.turn.build(11);
    game.timeout(400, function () {
      game.skill.build('enemy');
      game.skill.build('player', false, function () {
        game.units.buyCreeps('player', true);
        game.library.buildHand();
        game.library.beginPlayer();
        $('.map .player.card.'+game.library.hero).select();
      });
    });
  },
  showIntro: function () {
    var hero = game.library.hero,
        link = game.data.heroes[hero].intro;
    if (link && !$(this).attr('disabled')) game.states.choose.playVideo(link);
    return false;
  },
  beginPlayer: function () { 
    game.turn.begin('player', function () {
      game.tower.attack('enemy');
      if (game.player.turn > 1) game.skill.buyHand('player');
      game.items.addMoney('player', 800);
    });
  },
  buildHand: function () {
    $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
    $('.card', game.player.skills.deck).each(function () {
      var card = $(this);
      if (card.data('hand') === game.data.ui.right) {
        card.appendTo(game.player.skills.hand);
      } else {
        card.appendTo(game.player.skills.sidehand);
      }
    });
  },
  skip: function () {
    if ( game.currentTurnSide == 'player' ) {
      game.library.endPlayer();
    }
  },
  endPlayer: function () {
    game.turn.end('player', game.library.beginEnemy);
  }, 
  beginEnemy: function () {
    game.turn.begin('enemy', function () {
      game.loader.addClass('loading');
      game.skill.buyHand('enemy');
      game.tower.attack('player');
      game.library.endEnemy();
    });
  },
  endEnemy: function () {
    game.turn.end('enemy', game.library.beginPlayer);
  },
  win: function () {
    game.states.table.clear();
    game.states.changeTo('choose');
  },
  clear: function () {
    game.seed = 0;
    game.id = null;
  }
};
