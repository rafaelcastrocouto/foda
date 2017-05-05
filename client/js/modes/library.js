game.library = {
  build: function () {
    game.library.buildSkills();
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
  },
  buildSkills: function () {
    if (!game.library.skills) {
      game.library.skills = game.deck.build({
        name: 'skills',
        deckFilter: game.data.ui.buy,
        cb: function (deck) {
          deck.addClass('library').hide().appendTo(game.states.choose.el);
          $.each(deck.data('cards'), function (i, skill) {
            skill.addClass('player');
          });
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
    game.message.text(game.data.ui.library);
    if (hero) game.states.choose.selectHero(hero, 'force');
    else game.states.choose.selectFirst('force');
  },
  select: function (card, force) { 
    var hero = card.data('hero'),
        heroSkills,
        disabled;
    if (force || hero !== $('.choose .card.selected').data('hero')) {
      disabled = card.hasClass('dead');
      $('.slot .card.skills').appendTo(game.library.skills);
      heroSkills = $('.library.skills .card.'+hero);
      $('.slot').each(function (i) {
        var skill = $(heroSkills[i]); 
        if (disabled) skill.addClass('dead');
        skill.appendTo(this);
      });
      game.states.choose.pickedbox.hide().fadeIn('slow');
      $('.slot:empty').hide();
      if (!card.data('disable')) {
        game.library.hero = card.data('hero');
        localStorage.setItem('choose', game.library.hero);
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
    game.states.table.skip.attr('disabled', true).show();
    game.states.table.discard.attr('disabled', true).show();
    game.states.table.enableUnselect();
    game.player.kills = 0;
    game.enemy.kills = 0;
    game.turn.build(6);
    game.timeout(400, function () {
      game.skill.build('player', 'single');
      game.skill.build('enemy');
      $('.map .player.card.'+game.library.hero).select();
      game.player.buyCreeps(true);
      game.library.buildHand();
      game.library.startPlayerTurn();
    });
  },
  showIntro: function () {
    var hero = game.library.hero,
        link = game.data.heroes[hero].intro;
    if (link && !$(this).attr('disabled')) game.states.choose.playVideo(link);
  },
  startPlayerTurn: function () {
    game.turn.beginPlayer(function () {
      game.tower.attack('enemy');
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
  action: function () {
    game.timeout(400, function () {
      if ( game.turn.noAvailableMoves() ) {
        game.library.endPlayerTurn();
      }
    });
  },
  skip: function () {
    if ( game.isPlayerTurn() ) {
      game.library.endPlayerTurn();
    }
  },
  endPlayerTurn: function () {
    game.states.table.el.removeClass('turn');
    game.turn.end('player-turn', game.library.startEnemyTurn);
  },
  startEnemyTurn: function () {
    game.turn.beginEnemy(function () {
      game.enemy.buyHand();
      game.tower.attack('player');
      game.library.endEnemyTurn();
    });
  },
  endEnemyTurn: function () {
    game.turn.end('enemy-turn', game.library.startPlayerTurn);
  },
  clear: function () {
    game.seed = 0;
    game.id = null;
    game.moves = [];
  }
};
