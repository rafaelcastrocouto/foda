game.states.menu = {
  build: function () {
    this.menu = $('<div>').appendTo(this.el).addClass('menu box');
    //this.title = $('<h1>').appendTo(this.menu).text(game.data.ui.menu);
    this.tutorial = $('<div>').addClass('button').appendTo(this.menu).attr({title: game.data.ui.choosetutorial}).text(game.data.ui.tutorial).on('mouseup touchend', function () {
      game.setMode('tutorial');
      game.states.changeTo('choose');
    });
    this.campaign = $('<div>').addClass('button').appendTo(this.menu).attr({title: game.data.ui.choosecampaign}).text(game.data.ui.campaign).on('mouseup touchend', function () {
      game.setMode('single');
      game.states.changeTo('campaign');
    });
    this.online = $('<div>').addClass('button').appendTo(this.menu).attr({title: game.data.ui.chooseonline}).text(game.data.ui.online).on('mouseup touchend', function () {
      game.setMode('online');
      game.states.changeTo('choose');
    });
    if (!localStorage.getItem('tutorial')) this.tutorial.addClass('highlight');
    else if (!localStorage.getItem('campaign')) this.campaign.addClass('highlight');
    else this.online.addClass('highlight');
    this.local = $('<div>').addClass('button').appendTo(this.menu).attr({ title: game.data.ui.chooselocal}).text(game.data.ui.local).on('mouseup touchend', function () {
      game.setMode('local');
      game.states.changeTo('choose');
    });
    this.library = $('<div>').addClass('button').appendTo(this.menu).attr({ title: game.data.ui.chooselibrary}).text(game.data.ui.library).on('mouseup touchend', function () {
      game.setMode('library');
      game.states.changeTo('choose');
    });
    this.credits = $('<a>').addClass('button alert').appendTo(this.menu).attr({title: game.data.ui.choosecredits}).text(game.data.ui.credits).on('mouseup touchend', function () {
      var box = $('<div>').addClass('credits box');
      game.overlay.show().append(box);
      box.append($('<h1>').text(game.data.ui.credits));
      box.append($('<p>').html([
        'Author/Dev: <a href="https://github.com/rafaelcastrocouto/foda">rafaelcastrocouto</a>',
        'Artwork: <a href="https://www.youtube.com/user/dopatwo">Dopatwo</a>',
        'Audio: <a href="https://www.youtube.com/user/kmmusic">Kevin MacLeod</a>',
        'Language (TU): <a href="https://github.com/ahmetozalp">Ahmet</a>',
        'Introduction Videos: <a href="https://www.youtube.com/user/SkylentGames">Skylent</a>',
        'Hero (Venge): <a href="https://github.com/xinton">Washington</a>',
        'Contribute: <a href="https://github.com/rafaelcastrocouto/foda">Your name here</a>'].join('<br>')));
      box.append($('<div>').addClass('button').text(game.data.ui.ok).on('mouseup touchend', function () {
        game.overlay.hide();
        game.overlay.empty();
        return false;
      }));
    });
  },
  move: function (event) {
    clearTimeout(game.iddleTimeout);
    if (game.currentState == 'menu' ||  game.currentState == 'vs') {
      var s = 0.01;
      var p = { x: event.clientX, y: event.clientY };
      var w = { x: window.innerWidth, y: window.innerHeight };
      var offmiddle = { x: p.x - (w.x/2), y: p.y - (w.y/2) };
      var v = { x: 50 + (offmiddle.x * s), y: 50 + (offmiddle.y * s) };
      var str = ''+ v.x + '% ' + v.y + '%';
      game.states.el.removeClass('iddle').css('perspective-origin', str);
      game.iddleTimeout = setTimeout(function () { game.states.el.addClass('iddle'); }, 8000);
    }
  },
  orientation: function (event) {
    clearTimeout(game.iddleTimeout);
    if (game.currentState == 'menu' ||  game.currentState == 'vs') {
      var o = {
        x: -event.originalEvent.gamma,
        y: -event.originalEvent.beta
      };
      if (window.innerHeight < window.innerWidth) {
        o.x = event.originalEvent.beta;
        o.y = -event.originalEvent.gamma;
      }
      o.x = Math.min(Math.max(o.x, -90), 90);
      o.y = Math.min(Math.max(o.y, -90), 90);
      o.x = ((o.x + 90)/180)*100;
      o.y = ((o.y + 90)/180)*100;
      var min = 5, max = 95;
      o.x = Math.min(Math.max(o.x, min), max);
      o.y = Math.min(Math.max(o.y, min), max);
      var str = ''+ o.x + '% ' + o.y + '%';
      game.states.el.removeClass('iddle').css('perspective-origin', str);
      game.iddleTimeout = setTimeout(function () { game.states.el.addClass('iddle'); }, 8000);

    }
  },
  start: function () {
    game.clear();
    game.loader.removeClass('loading');
    game.triesCounter.text('');
    game.message.text(game.data.ui.welcome + ' ' + game.player.name + '!');
    game.states.log.out.show();
    game.rank.update(game.rank.data);
    game.audio.loopSong();
  }
};
