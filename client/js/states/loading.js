game.states.loading = {
  updating: 0,
  totalUpdate: 9, // values + language + ui + heroes + skills + units + campaign + package + rank
  build: function () {
    //this.box = $('<div>').addClass('box');   
    //this.h2 = $('<p>').appendTo(this.box).addClass('loadtext').html('<span class="loader loading"></span><span class="message">Updating: </span><span class="progress">0%</span>');
    //this.el.append(this.box);
    this.el = $('.state.loading').removeClass('hidden');
    this.h2 = $('.state.loading .loadtext');
    this.box = $('.state.loading .box');
  },
  start: function () {
    if (game.debug) game.states.loading.ping();
    game.states.loading.package();
    game.language.load(function loadLanguage() { //console.log('lang', game.states.loading.updating)
      game.states.loading.updated();
      game.states.loading.json('values', game.states.loading.updated);
      game.states.loading.json('campaign', game.states.loading.updated);
      game.states.loading.json('units', game.states.loading.updated, true);
      game.states.loading.json('ui', game.states.loading.updated, true);
      game.states.loading.json('heroes', game.states.loading.updated, true);
      game.states.loading.json('skills', game.states.loading.updated, true);
    });
    game.states.loading.rank();
    game.states.loading.progress();
  },
  updated: function () { //console.trace(this)
    game.states.loading.updating += 1;
    game.states.loading.progress();
  },
  progress: function () {
    var loading = parseInt(game.states.loading.updating / game.states.loading.totalUpdate * 100);
    $('.progress').text(loading + '%');
    if (game.states.loading.updating >= game.states.loading.totalUpdate) {
      game.states.loading.finished();
    }
  },
  finished: function () {
    game.options.build();
    game.container.append(game.topbar);
    game.states.build( function () {
      game.rank.build();
      if ('AudioContext' in window) game.audio.build();
      $('<img>').attr('src', '/img/bkg/ground.png').on('load', function () {
        game.states.menu.ground.addClass('loaded');
      }).appendTo(game.hidden);
      game.timeout(400, game.history.recover);
    });
  },
  json: function (name, cb, translate) {
    var u = game.dynamicHost + 'json/' + name + '.json';
    if (translate) u = game.dynamicHost + 'json/' + game.language.dir + name + '.json';
    $.ajax({
      type: 'GET',
      url: u,
      complete: function (response) { //console.log(name, response, game.states.loading.updating)
        var data = JSON.parse(response.responseText);
        game.data[name] = data;
        if (cb) {
          cb(data);
        }
      }
    });
  },
  package: function () {
    $.ajax({
      type: 'GET',
      url: game.dynamicHost + 'package.json',
      complete: function (response) {
        game.states.loading.updated();
        var data = JSON.parse(response.responseText);
        $.each(data, function (name) {
          game[name] = this;
        });
      }
    });
  },
  ping: function (cb) {
    var start = new Date();
    $.ajax({
      type: 'GET',
      url: game.dynamicHost,
      complete: function (response) {
        game.ping = new Date() - start;
        if (response.readyState === 4 && location.host.search('localhost') < 0) {
          game.offline = false;
        } else { game.offline = true; }
        if (cb) { cb(); }
      }
    });
  },
  rank: function () {
    game.db({'get': 'rank' }, function (data) {
      if (!game.rank.db) game.states.loading.updated(); //console.log('rank', game.states.loading.updating)
      game.rank.db = true;
      var ranked = game.rank.sortData(data);
      if (ranked.length == 5) {
        game.rank.data = data;
        if (game.rank.el) game.rank.update(data);
      } else {
        setTimeout(game.states.loading.rank, 3000);
      }
    });
  }
};
