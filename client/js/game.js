var game = {
  staticHost: 'http://rafaelcastrocouto.github.io/foda/client/',
  dynamicHost: 'https://foda-app.herokuapp.com/',
  container: $('.game-container'),
  loader: $('<span>').addClass('loader'),
  message: $('<span>').addClass('message'),
  triesCounter: $('<small>').addClass('triescounter'),
  timeToPick: 40,
  timeToPlay: 60,
  waitLimit: 60,
  connectionLimit: 30,
  dayLength: 12,
  deadLength: 4,
  ultTurn: 5,
  heroDeathDamage: 4,
  heroRespawnDamage: 1,
  creepDeathDamage: 1,
  width: 9,
  height: 5,
  tries: 0,
  seed: 0,
  id: null,
  timeoutArray: [],
  alertColor: 'rgba(255,255,255,1)',
  skills: {},
  data: {},
  //json {heroes, skills, ui}
  mode: '',
  //online, tutorial, campaign
  currentData: {},
  // game.currentData.moves should be a clone in online mode
  currentState: 'noscript',
  //unsupported, load, log, menu, options, choose, table
  heroesAI: {},
  start: function() {
    if (window.JSON && window.localStorage && window.btoa && window.atob && window.XMLHttpRequest) {
      if (!game.debug)
        game.debug = localStorage.getItem('debug');
      if (game.debug || location.hostname == 'localhost') {
        game.container.addClass('debug');
        game.staticHost = '';
        game.dynamicHost = '';
      }
      game.utils();
      game.events.build();
      game.history.build();
      game.sweet = $('.sweet-alert');
      game.topbar = $('<div>').addClass('topbar');
      game.topbar.append(game.loader, game.message, game.triesCounter);
      game.states.changeTo('loading');
    } else
      game.states.changeTo('unsupported');
  },
  newId: function() {
    game.newSeed();
    game.id = btoa(game.seed) + '|' + btoa(new Date().valueOf());
  },
  setId: function(id) {
    game.id = id;
    game.setSeed(id);
  },
  newSeed: function() {
    game.seed = Math.floor(Math.random() * 1E16);
    localStorage.setItem('seed', game.seed);
  },
  setSeed: function(id) {
    var n = id.split('|');
    game.seed = parseInt(atob(n[0]), 10);
    localStorage.setItem('seed', game.seed);
  },
  setData: function(item, data) {
    game.currentData[item] = data;
    localStorage.setItem('data', JSON.stringify(game.currentData));
  },
  isPlayerTurn: function() {
    return game.states.table.el.hasClass('turn');
  },
  opponent: function(side) {
    return (side == 'player') ? 'enemy' : 'player';
  },
  db: function(send, cb) {
    var server = game.dynamicHost + 'db';
    if (game.debug)
      server = '/db';
    if (typeof send.data !== 'string') {
      send.data = JSON.stringify(send.data);
    }
    $.ajax({
      async: true,
      type: 'GET',
      url: server,
      data: send,
      timeout: 4000,
      complete: function(receive) {
        var data;
        if (receive.responseText) {
          data = JSON.parse(receive.responseText);
        }
        if (cb) {
          cb(data || {});
        }
      }
    });
  },
  random: function() {
    game.seed += 1;
    return parseFloat('0.' + Math.sin(game.seed).toString().substr(6));
  },
  shake: function() {
    var state = game.states[game.currentState].el;
    state.addClass('shake');
    setTimeout(function() {
      this.removeClass('shake');
    }
    .bind(state), 220);
  },
  validModes: ['tutorial', 'online', 'library', 'single'],
  setMode: function(mode, recover) {
    if (mode && game[mode] && game[mode].build && game.validModes.indexOf(mode) >= 0) {
      game.mode = mode;
      localStorage.setItem('mode', mode);
      game.container.removeClass(game.validModes.join(' '));
      game.container.addClass(mode);
      game[mode].build(recover);
    }
  },
  clear: function() {
    game.message.html('');
    if (game.mode && game[game.mode] && game[game.mode].clear) {
      game[game.mode].clear();
    }
    game.states.choose.clear();
    game.states.vs.clear();
    game.states.table.clear();
    game.states.result.clear();
    game.container.removeClass(game.validModes.join(' '));
    game.mode = false;
    localStorage.removeItem('mode');
  },
  alert: function(txt, cb) {
    swal({
      title: game.data.ui.warning,
      text: txt,
      animation: false,
      type: 'warning',
      buttonsStyling: false,
      confirmButtonText: game.data.ui.ok,
      background: game.alertColor
    }).then(cb);
  },
  confirm: function(cb, text) {
    swal({
      title: text || game.data.ui.sure,
      animation: false,
      type: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: game.data.ui.yes,
      cancelButtonText: game.data.ui.no,
      background: game.alertColor
    }).then(cb);
  },
  error: function(cb) {
    swal({
      title: game.data.ui.error,
      text: game.data.ui.reload,
      animation: false,
      type: 'error',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: game.data.ui.yes,
      cancelButtonText: game.data.ui.no,
      background: game.alertColor
    }).then(cb);
  },
  reset: function() {
    game.error(function(confirmed) {
      if (confirmed) {
        game.clear();
        localStorage.setItem('state', 'menu');
        location.reload(true);
      }
    });
  },
  print: function() {
    game.states.choose.pickbox.css({
      left: 100,
      top: 130,
      transform: 'scale(2)',
      background: 'transparent'
    });
    $(document.body).css({
      'background': 'transparent',
      'box-shadow': 'none'
    });
    game.topbar.css('background', 'transparent');
    game.container.css('background', 'transparent');
    game.states.choose.pickedbox.css({
      opacity: 0
    });
    game.states.choose.buttonbox.css({
      right: 0
    });
    $('.library.skills .card').appendTo(game.states.choose.pickDeck).on('mousedown.choose touchstart.choose', game.states.choose.select);
  }
};
