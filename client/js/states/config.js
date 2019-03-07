game.states.config = {
  s1v1: {
    width: 9,
    height: 6,
    tower: 'B6',
    trees: 'A2 A3'
  },
  s3v3: {
    width: 11,
    height: 7,
    tower: 'B6',
    trees: 'A2 B3 A4'
  },
  s5v5: {
    width: 13,
    height: 8,
    tower: 'B7',
    trees: 'A2 A3 A4 B3 D8 J8'
  },
  build: function () {
    this.buttonbox = $('<div>').addClass('buttonbox');
    this.title = $('<h1>').addClass('title').text(game.data.ui.choose).appendTo(this.el);
    this.one = $('<div>').addClass('one button').text('1v1').on('mouseup touchend', this.toChoose).appendTo(this.buttonbox);
    this.three = $('<div>').addClass('three button').text('3v3').on('mouseup touchend', this.toChoose).appendTo(this.buttonbox);
    this.five = $('<div>').addClass('five button').text('5v5').on('mouseup touchend', this.toChoose).appendTo(this.buttonbox);
    this.back = $('<div>').addClass('back button').text(game.data.ui.back).on('mouseup touchend', this.backClick).appendTo(this.buttonbox);
    this.el.append(this.buttonbox);
  },
  start: function () {
    this.title.addClass('show');
  },
  toChoose: function () {
    var bt = $(this);
    if (bt.hasClass('one')) {
      game.setSize('s1v1');
    } else if (bt.hasClass('three')) {
      game.setSize('s3v3');
    } else game.setSize('s5v5');
    game.states.changeTo('choose');
  },
  backClick: function () {
    if (!$(this).attr('disabled')) {
      game.setData('mode', false);
      if (game.mode == 'online') {
        game.online.backClick();
      } if (game.mode == 'single') {
        game.states.changeTo('campaign');
      } else game.states.choose.toMenu();
    }
    return false;
  },
  end: function () {
    this.title.removeClass('show');
  }
};

