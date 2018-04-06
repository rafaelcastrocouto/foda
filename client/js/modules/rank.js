game.rank = {
  min: 0,
  build: function () {
    this.el = $('<div>').appendTo(game.states.menu.el).addClass('rank');
    this.title = $('<h1>').appendTo(this.el).text('WANTED');
    this.list = $('<ol>').appendTo(this.el).addClass('hidden');
  },
  send: function () {
    if (!game.debug && game.player.points > game.rank.min) game.db({
      'set': 'rank',
      'data': {
        'name': game.player.name,
        'points': game.player.points
      }
    }, game.rank.update);
  },
  sortData: function (data) {
    var ranked = [];
    $.each(data, function (name, points) { ranked.push({name: name, points: points}); });
    ranked.sort(function (a,b) { return b.points - a.points; });
    if (ranked.length) game.rank.min = ranked[ranked.length-1].points;
    return ranked;
  },
  update: function (data) {
    var ranked = game.rank.sortData(data);
    if (ranked.length != 5) ranked = [
      { name: 'Player 1', points: 99 },
      { name: 'Player 2', points: 80 },
      { name: 'Player 3', points: 70 },
      { name: 'Player 4', points: 60 },
      { name: 'Player 5', points: 50 }
    ];
    game.rank.results = ranked;
    game.rank.list.html('').removeClass('hidden');
    $.each(ranked, function (i, player) {
      game.rank.list.append($('<li>').html('<span>'+player.name+' </span><span>'+player.points+'</span>'));
    });
    
  }
};
