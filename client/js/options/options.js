game.options = {
  build: function () {
    this.box = $('<div>');
    this.title = $('<h1>').appendTo(this.box).text(game.data.ui.options);
    this.row = $('<div>').appendTo(this.box);
    //screen
    this.resolution = $('<div>').appendTo(this.row).addClass('screenresolution').attr({title: game.data.ui.screenres}).append($('<h2>').text(game.data.ui.screenres));
    this.fullscreen = $('<input>').attr({type: 'checkbox', name: 'fullscreen'}).change(game.screen.toggleFS);
    $('<label>').appendTo(this.resolution).append(this.fullscreen).append($('<span>').text(game.data.ui.fullscreen));
    this.auto = $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', checked: true, value: 'auto'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.auto));
    this.high = $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'high'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.high + ' 1920x1080'));
    this.medium = $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'medium'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.medium + ' 1366x768'));
    this.default = $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'default'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui['default'] + ' 1024x768'));
    this.low = $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'low'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.low + ' 800x600'));
    //audio
    this.audio = $('<div>').appendTo(this.row).addClass('audioconfig').attr({title: game.data.ui.audioconfig}).append($('<h2>').text(game.data.ui.audioconfig));
    this.muteinput = $('<input>').attr({type: 'checkbox', name: 'mute'}).change(game.audio.mute);
    $('<label>').appendTo(this.audio).append(this.muteinput).append($('<span>').text(game.data.ui.mute));
    game.audio.volumeControl('volume');
    game.audio.volumeControl('music');
    game.audio.volumeControl('sounds');
    $(document).on('mouseup.volume', game.audio.volumeMouseUp);
    // lang
    this.lang = $('<div>').appendTo(this.box).addClass('lang').attr({title: game.data.ui.lang}).append($('<h2>').text(game.data.ui.lang));
    this.langSelect = game.language.select().appendTo(this.lang);
    this.opt = $('<small>').addClass('opt').hide().text(game.data.ui.options).appendTo(game.topbar).on('mouseup touchend', game.options.show);
    // start
    game.screen.resize();
    game.screen.rememberResolution();
    BigScreen.onenter = function () {
      $('input[name=fullscreen]', '.screenresolution')[0].checked = true;
    };
    BigScreen.onexit = BigScreen.onerror = function() {
      $('input[name=fullscreen]', '.screenresolution')[0].checked = false;
      $(document.body).prepend(game.container);
    };
    if (window.AudioContext) game.audio.rememberVolume();
  },
  events: function () {
    $('input[name=fullscreen]', '.screenresolution').change(game.screen.toggleFS);
    $('input[name=resolution]', '.screenresolution').change(game.screen.changeResolution);
    $('input[name=mute]', '.audioconfig').change(game.audio.mute);
    $('.volume', '.audioconfig').on('mousedown.volume', game.audio.volumeMouseDown);
    $('.volume', '.audioconfig').on('mousemove.volume', game.audio.volumeMouseMove);
  },
  show: function () {
    game.container.addClass('optionState');
    swal({
      buttonsStyling: false,
      confirmButtonText: game.data.ui.back,
      animation: false,
      customClass: 'options',
      width: 660,
      padding: 60
    }).then(function () {
      game.options.box.hide();
      game.container.removeClass('optionState');
    });
    game.screen.resize();
    var content = $('.sweet-content').empty();
    game.options.box.show();
    content.append(game.options.box).show();
    game.screen.rememberResolution();
    game.options.events();
    if (window.AudioContext) game.audio.rememberVolume();
  }
};
