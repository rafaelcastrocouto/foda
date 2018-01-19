game.states.menu = {
  build: function () {
    //this.menu = $('<div>').appendTo(this.el).addClass('menu box');
    //this.title = $('<h1>').appendTo(this.menu).text(game.data.ui.menu);
    this.sky = $('<div>').appendTo(this.el).addClass('menu paralax sky');
    this.stars = $('<div>').appendTo(this.el);
    for (var s=0; s<10; s++) {
      var star = $('<div>').appendTo(this.stars).addClass('menu paralax star');
    }
    this.sun = $('<div>').appendTo(this.el).addClass('menu paralax sun');
    this.cloud = $('<div>').appendTo(this.el).addClass('menu paralax cloud');
    this.mountains = $('<div>').appendTo(this.el).addClass('menu paralax mountains');
    this.boom = $('<div>').appendTo(this.mountains).addClass('menu boom map').on('mouseup touchend', this.boomClick);
    this.amdoll = $('<div>').appendTo(this.el).addClass('menu paralax amdoll');
    this.cmdoll = $('<div>').appendTo(this.el).addClass('menu paralax cmdoll');
    this.fire = $('<div>').appendTo(this.el).addClass('menu paralax fire hidden').on('mouseup touchend', function () {
      $(this).toggleClass('hidden');
    });
    this.ground = $('<div>').appendTo(this.el).addClass('menu paralax ground');
    this.bush = $('<div>').appendTo(this.el).addClass('menu paralax bush');
    this.tutorial = $('<div>').addClass('tutorial icon').appendTo(this.el).attr({title: game.data.ui.choosetutorial}).append($('<span>').text(game.data.ui.tutorial)).on('mouseup touchend', function () {
      game.setMode('tutorial');
      game.states.changeTo('choose');
    });
    this.campaign = $('<div>').addClass('campaign icon').appendTo(this.el).attr({title: game.data.ui.choosecampaign}).append($('<span>').text(game.data.ui.campaign)).on('mouseup touchend', function () {
      game.setMode('single');
      game.states.changeTo('campaign');
    });
    this.online = $('<div>').addClass('online icon').appendTo(this.el).attr({title: game.data.ui.chooseonline}).append($('<span>').text(game.data.ui.online)).on('mouseup touchend', function () {
      game.setMode('online');
      game.states.changeTo('choose');
    });
    if (!localStorage.getItem('tutorial')) this.tutorial.addClass('highlight');
    else if (!localStorage.getItem('campaign')) this.campaign.addClass('highlight');
    else this.online.addClass('highlight');
    this.local = $('<div>').addClass('local icon').appendTo(this.el).attr({ title: game.data.ui.chooselocal}).append($('<span>').text(game.data.ui.local)).on('mouseup touchend', function () {
      game.setMode('local');
      game.states.changeTo('choose');
    });
    this.library = $('<div>').addClass('library icon').appendTo(this.el).attr({ title: game.data.ui.chooselibrary}).append($('<span>').text(game.data.ui.library)).on('mouseup touchend', function () {
      game.setMode('library');
      game.states.changeTo('choose');
    });
    this.credits = $('<a>').addClass('credits icon').appendTo(this.el).attr({title: game.data.ui.choosecredits}).append($('<span>').text(game.data.ui.credits)).on('mouseup touchend', function () {
      var box = $('<div>').addClass('credits box');
      game.overlay.show().append(box);
      box.append($('<div>').addClass('doll1'));
      box.append($('<div>').addClass('doll2'));
      box.append($('<div>').addClass('doll3'));
      box.append($('<h1>').text(game.data.ui.credits));
      box.append($('<p>').html([
        'Author/Dev: <a target="_blank" href="https://github.com/rafaelcastrocouto/foda">Rafael</a>',
        'Artwork: <a target="_blank" href="https://www.youtube.com/user/dopatwo">Dopatwo</a>',
        'Special FX: <a target="_blank" href="https://twitter.com/DanielClarcO">Daniel Clarc</a>',
        'Audio: <a target="_blank" href="https://www.youtube.com/user/kmmusic">Kevin MacLeod</a>',
        'Introduction Videos: <a target="_blank" href="https://www.youtube.com/user/SkylentGames">Skylent</a>',
        'Language (TU): <a target="_blank" href="https://github.com/ahmetozalp">Ahmet</a>',
        'Hero (Venge): <a target="_blank" href="https://github.com/xinton">Washington</a>',
        'Help us: <a target="_blank" href="https://www.patreon.com/racascou">Become a Patreon</a>',
        'Hatcrafter<br>Milokot'].join('<br>')));
      box.append($('<div>').addClass('button').text(game.data.ui.ok).on('mouseup touchend', function () {
        game.overlay.hide();
        game.overlay.empty();
        return false;
      }));
    });
  },
  start: function () {
    game.clear();
    game.loader.removeClass('loading');
    game.triesCounter.text('');
    game.message.text(game.data.ui.welcome + ' ' + game.player.name + '!');
    game.states.log.out.show();
    game.rank.update(game.rank.data);
    game.audio.loopSong('SneakyAdventure');
    game.states.menu.boomCount = 0;
  },
  boomCount: 0,
  boomClick: function () {
    game.states.menu.boomCount++;
    var boom = $(this);
    if (!boom.hasClass('playing') && game.states.menu.boomCount > 9) {
      game.states.menu.boomCount = 0;
      var fx = $('<span>').addClass('fx lina-stun').on('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function () { this.remove(); });
      boom.addClass('playing').append(fx);
      clearTimeout(game.states.menu.boomTimeout);
      game.states.menu.boomTimeout = setTimeout(function () {
        game.states.menu.boom.removeClass('playing');
      }, 2000);
    }
  }
};
