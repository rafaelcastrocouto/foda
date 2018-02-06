game.states.table = {
  build: function () {
    game.camera = $('<div>').addClass('camera');
    this.map = game.map.build().appendTo(game.camera);
    this.selectedArea = $('<div>').addClass('selectedarea');
    this.selectedCard = $('<div>').addClass('selectedcard').appendTo(this.selectedArea);
    this.cardBack = $('<div>').addClass('cardback').appendTo(this.selectedCard);
    this.treeDeck = $('<div>').appendTo(this.el).addClass('tree-deck');
    this.player = $('<div>').addClass('playerdecks player');
    this.enemy = $('<div>').addClass('enemydecks enemy');
    this.buttonbox = $('<div>').addClass('buttonbox');
    this.surrender = $('<div>').hide().appendTo(this.buttonbox).addClass('surrender button').text(game.data.ui.surrender).on('mouseup touchend', this.surrenderClick);
    this.back = $('<div>').hide().appendTo(this.buttonbox).addClass('back button').text(game.data.ui.back).on('mouseup touchend', this.backClick);
    this.discard = $('<div>').hide().appendTo(this.buttonbox).addClass('discard button').attr({disabled: true}).text(game.data.ui.discard).on('mouseup touchend', this.discardClick);
    this.skip = $('<div>').hide().appendTo(this.buttonbox).addClass('skip button highlight').attr({disabled: true, title: 'SPACE'}).text(game.data.ui.skip).on('mouseup touchend', this.skipClick);
    this.el.append(game.camera).append(this.selectedArea).append(this.buttonbox).append(this.player).append(this.enemy);
    this.ultfx = $('<div>').addClass('ultfx').appendTo(game.camera);
    for (var s=0; s<6; s++) {
      var star = $('<div>').appendTo(this.ultfx).addClass('ulfx star hide');
    }
  },
  start: function (recover) {
    if (game.turn.el) {
      game.turn.time.show();
      game.turn.msg.show();
    }
    if (game.mode && !game.states.table.setup) {
      game.states.table.setup = true;
      game.tower.place();
      game.tree.place();
      game.states.table.forestSpot();
      game.states.table.fountainSpot();
    }
    game.states.table.recover();
  },
  recover: function () {
    if (game.recovering && game.getData(game.player.type+'Deck')) {
      game.history.recoverMatch();
    } else {
      game[game.mode].setTable();
    }
  },
  music: function () {
    if (game.mode == 'library') game.audio.loopSong('Perspectives');
    else game.audio.loopSong('DeathandAxes');
  },
  enableUnselect: function () {
    game.states.table.el.on('mousedown touchstart', function (event) { 
      var target = $(event.target); 
      if (!target.closest('.button, .card, .movearea, .targetarea').length) {
        game.card.unselect();
        if (game.mode && game[game.mode].unselected) game[game.mode].unselected();
      }
    });
  },
  forestSpot: function () {
    var spot = 'A1';
    $('#' + spot + ', #' + game.map.mirrorPosition(spot)).addClass('jungle').attr({title: game.data.ui.jungle});
  },
  fountainSpot: function () {
    var spot = 'A7';
    $('#' + spot + ', #' + game.map.mirrorPosition(spot)).addClass('fountain').attr({title: game.data.ui.heal});

  },
  skipClick: function () {
    if (!game.states.table.skip.attr('disabled') && game.canPlay()) {
      game.states.table.skip.attr('disabled', true);
      game.turn.stopCount();
      if (game[game.mode].skip) game[game.mode].skip();
      game.highlight.clearMap();
      if (game.selectedCard) game.selectedCard.reselect();
    }
    return false;
  },
  surrenderClick: function () {
    //online && tutorial
    game.confirm(function(confirmed) {
      if (confirmed && game.mode && game[game.mode].surrender) {
        game[game.mode].surrender();
      }
    }, game.data.ui.leave);
    return false;
  },
  backClick: function () {
    //library only
    game.audio.stopSong();
    game.recovering = false;
    game.setData('matchData', false);
    game.states.table.clear();
    //game.setMode('library');
    game.states.changeTo('choose');
    return false;
  },
  discardClick: function () {
    if (!game.states.table.discard.attr('disabled') &&
        game.selectedCard &&
        game.selectedCard.hasClass('skills') && 
        game.canPlay() ) {
      game.highlight.clearMap();
      game[game.selectedCard.side()].discard(game.selectedCard);
      game.states.table.discard.attr('disabled', true);
    }
    return false;
  },
  clear: function () {
    if (this.selectedCard) this.selectedCard.removeClass('flip');
    game.states.table.setup = false;
    game.map.clear();
    game.card.clearSelection();
    game.fx.clear();
    game.audio.stopSong();
    $('.deck', game.states.table.el).remove();
    $('.card', game.states.table.el).remove();
    $('.card', game.hidden).remove();
    this.buttonbox.show().children().hide();
    this.el.removeClass('turn');
    if (game.turn.el) game.turn.el.removeClass('show');
    game.states.table.el.removeClass('turn');
    game.setData('seed', false);
    game.clearTimeouts();
  },
  end: function () {
    if (game.turn.el) {
      game.turn.el.removeClass('show');
      game.turn.msg.hide();
      game.turn.time.hide();
    }
  }
};
