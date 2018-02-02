game.states.result = {
  build: function () {
    this.resultsbox = $('<div>').addClass('resultsbox box');
    this.title = $('<h1>').appendTo(this.resultsbox).addClass('resultTitle');
    this.sub = $('<div>').addClass('sub').appendTo(this.resultsbox);
    this.towers = $('<h1>').appendTo(this.sub);
    this.kills = $('<h1>').appendTo(this.sub);
    this.deaths = $('<h1>').appendTo(this.sub);
    this.turns = $('<h1>').appendTo(this.sub);
    this.playerResults = $('<div>').appendTo(this.resultsbox).addClass('results');
    this.enemyResults = $('<div>').appendTo(this.resultsbox).addClass('results enemy');
    $('<div>').addClass('button close').appendTo(this.resultsbox).text(game.data.ui.close).on('mouseup touchend', this.close);
    this.el.append(this.resultsbox);
  },
  playerHeroResult: function () {
    var hero = $(this), heroid = hero.data('hero'),
      img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
      text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
    $('<p>').data('hero', heroid).addClass(heroid+' heroes').append(text, img).appendTo(game.states.result.playerResults);
  },
  enemyHeroResult: function () {
    var hero = $(this), heroid = hero.data('hero'),
      img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
      text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
    $('<p>').data('hero', heroid).addClass(heroid+' heroes').append(img, text).appendTo(game.states.result.enemyResults);
  },
  start: function (recover) {
    this.update();
    if (recover) {
      this.close();
    }
  },
  update: function () {
    this.clear();
    game.rank.send();
    game.audio.stopSong();
    game.audio.loopSong('SneakyAdventure');
    if (game.mode == 'tutorial') game.tutorial.axe.addClass('show').appendTo(this.el);
    var message = game.data.ui.win;
    var winnerName = game.player.name;
    if (game.winner != game.player.type) {
      message = game.data.ui.lose;
      winnerName = game.enemy.name;
    }
    if (game.mode == 'local') message = game.data.ui.lose;
    var title = winnerName + ' ' + game.data.ui.victory;
    $(game.player.heroesDeck.data('cards')).each(this.playerHeroResult);
    $(game.enemy.heroesDeck.data('cards')).each(this.enemyHeroResult);
    var ch = game.states.result.playerResults.children();
    ch.sort(function (a,b) { 
      return game.player.picks.indexOf($(a).data('hero')) - game.player.picks.indexOf($(b).data('hero')); 
    });
    game.states.result.playerResults.append(ch);
    ch = game.states.result.enemyResults.children();
    ch.sort(function (a,b) { 
      return game.enemy.picks.indexOf($(b).data('hero')) - game.enemy.picks.indexOf($(a).data('hero')); 
    });
    game.states.result.enemyResults.append(ch);
    game.message.text(message);
    this.title.text(title);
    this.towers.text(game.data.ui.towers + ' HP: ' + game.player.tower.data('current hp') + '/' + game.enemy.tower.data('current hp'));
    this.kills.text(game.data.ui.kills + ': ' + game.player.kills + '/' + game.enemy.kills);
    this.deaths.text(game.data.ui.death + ': ' + game.player.deaths + '/' + game.enemy.deaths);
    this.turns.text(game.data.ui.turns + ': ' + game.player.turn + '/' + game.enemy.turn + ' (' + game.totalTurns + ')');
  },
  close: function () {
    if (game.mode == 'single') {
      game.single.started = false;
      game.states.table.clear();
      game.states.vs.clear();
      game.states.choose.clear();
      game.states.changeTo('campaign');
    }
    else {
      game.clear();
      game.states.changeTo('menu');
    }
    if (game.mode == 'tutorial') game.chat.set(game.data.ui.completedtutorial);
    return false;
  },
  clear: function () {
    $('.result .results .heroes').remove();
    this.title.text('');
    this.towers.text('');
    this.kills.text('');
    this.deaths.text('');
    this.turns.text('');
  }
};