game.tree = {
  build: function (position, side) {
    var spot = $('#'+position);
    if (spot.hasClass('free')) {
      var tree = game.card.build({
        className: 'trees static neutral ' + side,
        name: game.data.ui.tree,
        attribute: game.data.ui.tree,
        description: game.data.ui.forest
      });
      tree.on('mousedown touchstart', game.card.select);
      tree.place(position);
      return tree;
    }
  },
  place: function () {
    var trees = 'A3 H5 I5';
    $.each(trees.split(' '), function () {
      game.tree.build(this, 'rad');
      game.tree.build(game.map.mirrorPosition(this), 'dire');
    });
  },
  destroy: function (tree) {
    tree.parent().addClass('free');
    tree.remove();
  }
};
