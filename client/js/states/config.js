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
    this.createTitle = $('<h1>').addClass('createTitle').text(game.data.ui.create).appendTo(this.el);
    this.joinTitle = $('<h1>').addClass('joinTitle').text(game.data.ui.chooseonline).appendTo(this.el);
    this.one = $('<div>').addClass('one button clickSize').text('1v1').on('mouseup touchend', this.clickSize).appendTo(this.buttonbox);
    this.three = $('<div>').addClass('three button clickSize').text('3v3').on('mouseup touchend', this.clickSize).appendTo(this.buttonbox);
    this.five = $('<div>').addClass('five button clickSize').text('5v5').on('mouseup touchend', this.clickSize).appendTo(this.buttonbox);
    this.listTitle = $('<div>').addClass('listTitle').text(game.data.ui.loading);
    this.list = $('<div>').addClass('onlineList');
    this.list.append(this.listTitle);
    this.el.append(this.list);
    this.back = $('<div>').addClass('back button alert').text(game.data.ui.back).on('mouseup touchend', this.backClick).appendTo(this.buttonbox);
    this.el.append(this.buttonbox);
  },
  start: function () {
    if (!game.mode) {
      game.states.changeTo('menu');
    }
    game.message.text(game.player.name+' Config '+game.mode);
    this.title.addClass('show');
    if (game.mode === 'online') {
      game.online.updateList();
    }
  },
  enable: function () { //console.log('en')
    $('.config .button.clickSize').attr('disabled', false);
  },
  disable: function () {// console.trace('dis')
    $('.config .button.clickSize').attr('disabled', true);
  },
  validSizes: ['s1v1', 's3v3', 's5v5'],
  size: function(size, recover) {
    if (size && game.states.config.validSizes.indexOf(size) >= 0) {
      game.states.config.clearSize();
      game.size = size;
      game.setData('size', size);
      game.container.addClass(size);
    }
  },
  clearSize: function () {
    game.size = 's5v5';
    game.container.removeClass(game.states.config.validSizes.join(' '));
  },
  clickSize: function () {
    var bt = $(this);
    if (!bt.attr('disabled')) {
      if (bt.hasClass('one')) {
        game.states.config.size('s1v1');
      } else if (bt.hasClass('three')) {
        game.states.config.size('s3v3');
      } else game.states.config.size('s5v5');
      if (game.mode == 'online') game.online.create();
      if (game.mode == 'library') game.states.changeTo('vs');
      if (game.mode != 'online' && game.mode != 'library') 
        game.states.changeTo('choose');
    }
  },
  backClick: function () {
    if (!$(this).attr('disabled')) {
      if (game.mode == 'library') {
        game.states.changeTo('choose');
      } else {
        game.clear();
        game.states.changeTo('menu');
      }
    }
    return false;
  },
  end: function () {
    this.title.removeClass('show');
  }
};

