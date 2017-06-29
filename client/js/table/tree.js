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
    var trees = 'A3 A5 H5 I5';
    $.each(trees.split(' '), function () {
      game.tree.build(this, 'rad');
      game.tree.build(game.map.mirrorPosition(this), 'dire');
    });
  },
  destroy: function (tree) {
    var spot = tree.parent();
    var position = spot.getPosition();
    spot.addClass('free');
    tree.data('spot', spot).data('reborn-count',2);
    tree.appendTo(game.states.table.treeDeck);
    game.player.tower.on('turnend.tree'+position, function () {
      var spot = this.data('spot');
      this.data('reborn-count', this.data('reborn-count') - 1);
      if (spot.hasClass('free') && this.data('reborn-count') < 1) {
        this.appendTo(spot);
        spot.removeClass('free');
        game.player.tower.off('turnend.tree'+position);
      }
    }.bind(tree));
  }
};
