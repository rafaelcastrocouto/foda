game.rank = {
  build: function () {
    game.rank.el = $('<div>').appendTo(game.states.menu.menu).addClass('rank box').text('Loading');
  },
  start: function () {
    var p = parseInt(localStorage.getItem('points'));
    if ( typeof(p) == 'number') game.player.points = p;
    else game.player.points = 0;
  },
  send: function () {
    if (!game.debug) game.db({
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
    return ranked;
  },
  update: function (data) {
    var ranked = game.rank.sortData(data);
    if (ranked.length == 5) {
      game.rank.results = ranked;
      game.rank.el.html('').show();
      $.each(ranked, function (i, player) {
        game.rank.el.append($('<p>').html('<span>'+player.name+':</span><span>'+player.points+'</span>'));
      });
    }
  }
};
