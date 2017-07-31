game.states.menu = {
  build: function () {
    this.menu = $('<div>').appendTo(this.el).addClass('menu box');
    //this.title = $('<h1>').appendTo(this.menu).text(game.data.ui.menu);
    this.tutorial = $('<div>').addClass('button highlight').appendTo(this.menu).attr({title: game.data.ui.choosetutorial}).text(game.data.ui.tutorial).on('mouseup touchend', function () {
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
    this.local = $('<div>').addClass('button').appendTo(this.menu).attr({ title: game.data.ui.chooselocal}).text(game.data.ui.local).on('mouseup touchend', function () {
      game.setMode('local');
      game.states.changeTo('choose');
    });
    this.library = $('<div>').addClass('button').appendTo(this.menu).attr({ title: game.data.ui.chooselibrary}).text(game.data.ui.library).on('mouseup touchend', function () {
      game.setMode('library');
      game.states.changeTo('choose');
    });
    this.credits = $('<a>').addClass('button alert').appendTo(this.menu).attr({title: game.data.ui.choosecredits, href: 'https://github.com/rafaelcastrocouto/dotacard/graphs/contributors', target: '_blank'}).html(game.data.ui.credits+' <span class="external">➔</span>');
    game.rank.build();
  },
  start: function () {
    game.clear();
    game.loader.removeClass('loading');
    game.triesCounter.text('');
    game.message.text(game.data.ui.welcome + ' ' + game.player.name + '!');
    game.states.log.out.show();
  }
};
