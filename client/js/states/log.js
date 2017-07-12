game.states.log = {
  remembername: true,
  build: function () {
    this.box = $('<div>').addClass('box').hide();
    this.logo = $('<div>').appendTo(this.el).addClass('logo slide');
    this.form = $('<form>').appendTo(this.box).on('submit', function (event) { event.preventDefault(); return false; });
    this.input = $('<input>').appendTo(this.form).attr({placeholder: game.data.ui.choosename/*game.data.ui.logtype*/, type: 'text', required: 'required', minlength: 3, maxlength: 24, tabindex: 1}).keydown(function (event) { if (event.which === 13) { game.states.log.login(); return false; } });
    this.button = $('<button>').addClass('button').appendTo(this.form).text(game.data.ui.log).attr({type: 'submit'}).on('mouseup touchend', this.login);
    this.rememberlabel = $('<label>').addClass('remembername').appendTo(this.form).append($('<span>').text(game.data.ui.remember));
    this.remembercheck = $('<input>').attr({type: 'checkbox', name: 'remember', checked: true}).change(this.remember).appendTo(this.rememberlabel);
    this.out = $('<small>').addClass('logout').hide().insertAfter(game.message).text(game.data.ui.logout).on('mouseup touchend', this.logout);
    var rememberedname = localStorage.getItem('name');
    if (rememberedname) { this.input.val(rememberedname); }
    this.el.append(this.box);
  },
  start: function () {
    game.states.log.out.hide();
    game.options.opt.show();
    game.loader.removeClass('loading');
    game.triesCounter.text('');
    game.clear();
    if (!game.states.log.alert) {
      game.states.log.alert = true;
      game.states.log.alertBox();
      if (!localStorage.getItem('voted')) game.poll.addButton();
    }
  },
  createBkgDeck: function () {
    if (!game.bkgDeck) {
      var div = $('<div>').addClass('bkgdeck');
      $('.pickbox .card.wk').clone().appendTo(div);
      $('.pickbox .card.cm').clone().appendTo(div);
      $('.pickbox .card.am').clone().appendTo(div);
      $('.pickbox .card.kotl').clone().appendTo(div);
      $('.pickbox .card.pud').clone().appendTo(div);
      $('.pickbox .card.ld').clone().appendTo(div);
      game.states.el.prepend(div).addClass('iddle');
      game.bkgDeck = div;
      $(window).on('mousemove', game.states.log.move);
    }
  },
  scale: 0.01,
  move: function (event) {
    clearTimeout(game.iddleTimeout);
    if (game.currentState == 'log' ||
        game.currentState == 'menu' ||
        game.currentState == 'options' ||
        game.currentState == 'vs') {
      var s = game.states.log.scale;
      var p = { x: event.clientX, y: event.clientY };
      var w = { x: window.innerWidth, y: window.innerHeight };
      var offmiddle = { x: p.x - (w.x/2), y: p.y - (w.y/2) };
      var v = { x: 50 + (offmiddle.x * s), y: 50 + (offmiddle.y * s) };
      var str = ''+ v.x + '% ' + v.y + '%';
      game.states.el.removeClass('iddle').css('perspective-origin', str);
      game.iddleTimeout = setTimeout(function () { game.states.el.addClass('iddle'); }, 3000);
    }
  },
  alertBox: function () {
    var box = $('<div>').addClass('log box');
    game.overlay.show().append(box);
    box.append($('<h1>').text(game.data.ui.warning));
    box.append($('<p>').html(game.data.ui.alphaalert + game.version + '</small>'));
    game.poll.button = $('<div>').hide().addClass('button voteBt large').text(game.data.ui.votenexthero).on('mouseup touchend', function () {
      game.poll.build();
      if (!game.states.log.input.val()) game.states.log.input.focus();
    });
    box.append(game.poll.button);
    box.append($('<div>').addClass('button').text(game.data.ui.close).on('mouseup touchend', game.poll.close));
    game.screen.resize();
  },
  login: function () {
    var valid = game.states.log.input[0].checkValidity(),
        name = game.states.log.input.val();
    if (name && valid) {
      game.player.name = name;
      if (game.states.log.remembername) {
        localStorage.setItem('name', name);
      } else {
        localStorage.removeItem('name');
      }
      localStorage.setItem('log', name);
      localStorage.setItem('logged', 'true');
      game.states.log.button.attr('disabled', true);
      game.chat.set(game.data.ui.joined);
      game.chat.build();
      game.chat.el.show();
      game.states.log.createBkgDeck();
      game.states.changeTo('menu');
    } else {
      game.states.log.input.focus();
    }
  },
  logout: function () {
    game.confirm(function (confirmed) {
      if (confirmed) {
        localStorage.setItem('logged', 'false');
        game.clear();
        game.chat.el.hide();
        game.states.changeTo('log');
      }
    });
  },
  remember: function () {
    game.states.log.remembername = !game.states.log.remembername;
  },
  end: function () {
    this.button.attr('disabled', false);
  }
};