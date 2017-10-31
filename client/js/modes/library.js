game.library = {
  build: function () {
    game.library.buildSkills();
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
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
      game.skill.build('enemy');
      game.skill.build('player', 0, function () {
        game.player.buyCreeps(true);
        game.library.buildHand();
        game.library.beginPlayerTurn();
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
  beginPlayerTurn: function () { 
    game.turn.beginPlayer(function () {
      game.tower.attack('enemy');
      if (game.player.turn > 1) game.player.buyHand();
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
    /*game.timeout(400, function () {
      if ( game.turn.noAvailableMoves() ) {
        game.library.endPlayerTurn();
      }
    });*/
  },
  skip: function () {
    if ( game.currentTurnSide == 'player' ) {
      game.library.endPlayerTurn();
    }
  },
  endPlayerTurn: function () {
    game.turn.end('player-turn', game.library.beginEnemyTurn);
  },
  beginEnemyTurn: function () {
    game.turn.beginEnemy(function () {
      game.loader.addClass('loading');
      game.enemy.buyHand();
      game.tower.attack('player');
      game.library.endEnemyTurn();
    });
  },
  endEnemyTurn: function () {
    game.turn.end('enemy-turn', game.library.beginPlayerTurn);
  },
  win: function () {
    game.states.table.clear();
    game.states.changeTo('choose');
  },
  clear: function () {
    game.seed = 0;
    game.id = null;
    game.moves = [];
  }
};
