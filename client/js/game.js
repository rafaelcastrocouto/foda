var game = {
  staticHost: 'http://rafaelcastrocouto.github.io/foda/client/',
  dynamicHost: 'https://foda-app.herokuapp.com/',
  container: $('.game-container'),
  loader: $('<span>').addClass('loader'),
  message: $('<span>').addClass('message'),
  triesCounter: $('<small>').addClass('triescounter'),
  timeToPick: 40,
  timeToPlay: 80,
  waitLimit: 5,
  connectionLimit: 30,
  dayLength: 12,
  deadLength: 4,
  ultTurn: 4,
  maxSkillCards: 10,
  creepTurn: 1,
  catapultTurn: 8,
  heroDeathDamage: 4,
  heroRespawnDamage: 1,
  creepDeathDamage: 1,
  treeRespawn: 4,
  width: 9,
  height: 5,
  tries: 0,
  seed: 0,
  id: null,
  timeoutArray: [],
  skills: {},
  data: {},//json {heroes, skills, ui, units, campaign}
  mode: '', //online, tutorial, single, library
  currentData: {}, // game.currentData.moves should be a clone in online mode
  currentState: 'noscript', //unsupported, loading, log, menu, campaign, choose, vs, table, results
  heroesAI: {}, // heroes default AI behaviour
  start: function() {
    if (window.JSON && window.localStorage && window.btoa && window.atob && window.XMLHttpRequest) {
      if (game.debug) {
        game.container.addClass('debug');
        game.staticHost = '';
        game.dynamicHost = '';
      }
      game.utils();
      game.events.build();
      game.history.build();
      game.hidden = $('<div>').addClass('hidden').appendTo(game.container);
      game.overlay = $('<div>').addClass('game-overlay').appendTo(game.container);
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
    console.log(id);
    if (id) {
      var n = id.split('|');
      if (n[0].length) {
        game.seed = parseInt(atob(n[0]), 10);
        localStorage.setItem('seed', game.seed);
      }
    }
  },
  setData: function(item, data) {
    game.currentData[item] = data;
    localStorage.setItem('data', JSON.stringify(game.currentData));
  },
  canPlay: function() {
    if (game.mode == 'local') return game.states.table.el.hasClasses('turn unturn');
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
    .bind(state), 320);
  },
  validModes: ['tutorial', 'online', 'library', 'single', 'local'],
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
    var box = $('<div>').addClass('box');
    game.overlay.show().append(box);
    box.append($('<h1>').text(game.data.ui.warning));
    box.append($('<p>').text(txt));
    box.append($('<div>').addClass('button').text(game.data.ui.ok).on('mouseup touchend', function () {
      game.overlay.hide();
      game.overlay.empty();
      if (cb) cb(true);
      return false;
    }));
  },
  confirm: function(cb, text) {
    var box = $('<div>').addClass('box');
    game.overlay.show().append(box);
    box.append($('<h1>').text(text || game.data.ui.sure));
    box.append($('<div>').addClass('button alert').text(game.data.ui.yes).on('mouseup touchend', function () {
      game.overlay.hide();
      game.overlay.empty();
      cb(true);
      return false;
    }));
    box.append($('<div>').addClass('button').text(game.data.ui.no).on('mouseup touchend', function () {
      game.overlay.hide();
      game.overlay.empty();
      return false;
    }));
  },
  error: function(details, cb) {
    var box = $('<div>').addClass('box');
    game.overlay.show().append(box);
    box.append($('<h1>').text(game.data.ui.error));
    box.append($('<p>').text(game.data.ui.reload));
    box.append($('<div>').addClass('button alert').text(game.data.ui.ok).on('mouseup touchend', function () {
      game.overlay.hide();
      game.overlay.empty();
      if (cb) cb(true);
      return false;
    }));
  },
  logError: function(details) {
    if (!game.debug) {
      if (typeof(details) !== 'string') details = JSON.stringify(details);
      game.db({
        'set': 'errors',
        'data': details
      });
    }
  },
  reset: function(details) {
    game.logError(details);
    game.error(details, function(confirmed) {
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
