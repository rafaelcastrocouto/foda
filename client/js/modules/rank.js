game.rank = {
  build: function () {
    game.rank.el = $('<div>').appendTo(game.states.menu.menu).addClass('rank box');
    game.db({'get': 'rank' }, game.rank.update);
  },
  send: function () {
    game.db({
      'set': 'rank',
      'data': {
        'name': game.player.name,
        'points': game.player.points || 0
      }
    }, game.rank.update);
  },
  update: function (results) {
    game.rank.el.html('');
    var ranked = [];
    $.each(results, function (name, points) {
      ranked.push({name: name, points: points});
    });
    ranked.sort(function (a,b) { return b.points - a.points; });
    $.each(ranked, function (i, player) {
      game.rank.el.append($('<p>').html('<span>'+player.name+':</span><span>'+player.points+'</span>'));
    });
  }
};
