game.options = {
  build: function () {
    this.opt = $('<small>').addClass('opt').hide().text(game.data.ui.options + ' ⚙').appendTo(game.topbar).attr('title', game.data.ui.chooseoptions).on('mouseup touchend', game.options.show);
    this.box = $('<div>').addClass('box');
    this.title = $('<h1>').appendTo(this.box).text(game.data.ui.options);
    this.row = $('<div>').appendTo(this.box);
    //screen
    this.screen = $('<div>').appendTo(this.row).addClass('screenresolution').append($('<h2>').text(game.data.ui.screenres));
    this.fullscreen = $('<input>').attr({type: 'checkbox', name: 'fullscreen', disabled: true});
    $('<label>').appendTo(this.screen).append(this.fullscreen).append($('<span>').text(game.data.ui.fullscreen));
    //side
    this.side = $('<input>').attr({type: 'checkbox', name: 'side'});
    $('<label>').appendTo(this.screen).append(this.side).append($('<span>').text(game.data.ui.leftmode));
    if (game.getData('left-side') == 'true') {
      $(document.body).addClass('left-side');
      this.side.prop('checked', true);
    }
    //resolution
    this.auto = $('<label>').appendTo(this.screen).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'auto'})).append($('<span>').text(game.data.ui.auto));
    this.high = $('<label>').appendTo(this.screen).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'high'})).append($('<span>').text(game.data.ui.high + ' 1920x1080'));
    this.medium = $('<label>').appendTo(this.screen).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'medium'})).append($('<span>').text(game.data.ui.medium + ' 1366x768'));
    this.default = $('<label>').appendTo(this.screen).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'default'})).append($('<span>').text(game.data.ui['default'] + ' 1024x768'));
    this.low = $('<label>').appendTo(this.screen).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'low'})).append($('<span>').text(game.data.ui.low + ' 800x600'));
    // lang
    this.lang = $('<div>').appendTo(this.box).addClass('lang').attr({title: game.data.ui.lang}).append($('<h2>').text(game.data.ui.lang));
    this.langSelect = game.language.select().appendTo(this.lang);
    //audio
    this.audio = $('<div>').appendTo(this.row).addClass('audioconfig').append($('<h2>').text(game.data.ui.audioconfig));
    this.muteinput = $('<input>').attr({type: 'checkbox', name: 'mute'});
    $('<label>').appendTo(this.audio).append(this.muteinput).append($('<span>').text(game.data.ui.mute));
    game.audio.volumeControl('volume');
    game.audio.volumeControl('music');
    game.audio.volumeControl('sounds');
    $(document).on('mouseup.volume', game.audio.volumeMouseUp);
    //back
    this.back = $('<div>').addClass('back button').text(game.data.ui.back).on('mouseup touchend', this.backClick).appendTo(this.box);
     // start
    game.screen.rememberResolution();
    game.screen.FSEvents();
    if (window.AudioContext) game.audio.rememberVolume();
  },
  events: function () {
    //FS
    $('input[name=fullscreen]', '.screenresolution').on('change', game.screen.toggleFS);
    //SIDE
    $('input[name=side]', '.screenresolution').on('change', game.screen.toggleSide);
    //RES
    $('input[name=resolution]', '.screenresolution').on('change', game.screen.changeResolution);
    //Lang
    game.options.langSelect.on('change', game.language.click);
    //MUTE
    $('input[name=mute]', '.audioconfig').on('change', game.audio.mute);
    //VOL
    $('.volume', '.audioconfig').on('mousedown.volume touchstart.volume', game.audio.volumeMouseDown);
    $('.option-state .game-overlay .box').on('mousemove.volume touchmove.volume', game.audio.volumeMouseMove);
  },
  show: function () {
    game.overlay.removeClass('hidden');
    game.overlay.append(game.options.box);
    game.container.addClass('option-state');
    game.screen.rememberResolution();
    game.options.events();
    return false;
  },
  keyboard: function () {
    if (game.container.hasClass('option-state')) game.options.backClick();
    else if (game.overlay.hasClass('hidden')) game.options.show();
  },
  backClick: function () {
    game.overlay.addClass('hidden');
    game.options.box.appendTo(game.hidden);
    game.container.removeClass('option-state');
    return false;
  }
};
