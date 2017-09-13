game.states.loading = {
  updating: 0,
  totalUpdate: 7, // rank + language + campaign + ui + heroes + skills + package
  build: function () {
    this.box = $('<div>').addClass('box');   
    this.h2 = $('<p>').appendTo(this.box).addClass('loadtext').html('<span class="loader loading"></span><span class="message">Updating: </span><span class="progress">0%</span>');
    this.el.append(this.box);
  },
  start: function () {
    game.states.loading.ping();
    game.states.loading.package();
    if (window.AudioContext) game.audio.build();
    game.language.load(function () {
      game.states.loading.updated();
      game.states.loading.json('ui');
      game.states.loading.json('heroes');
      game.states.loading.json('campaign');
      game.states.loading.json('skills');
    });
    game.states.loading.rank();
    game.states.loading.progress();
  },
  progress: function () {
    var loading = parseInt(game.states.loading.updating / game.states.loading.totalUpdate * 100);
    $('.progress').text(loading + '%');
    if (game.states.loading.updating < game.states.loading.totalUpdate) {
      game.timeout(800, game.states.loading.progress);
    } else if (game.states.loading.updating === game.states.loading.totalUpdate) {
      game.states.loading.finished();
    }
  },
  updated: function () {
    game.states.loading.updating += 1;
  },
  finished: function () {
    game.options.build();
    game.container.append(game.topbar);
    game.states.build( function () {
      game.rank.build();
      if (game.debug) game.history.recover();
      else game.history.jumpTo('log');
    });
  },
  json: function (name, cb) {
    $.ajax({
      type: 'GET',
      url: game.dynamicHost + 'json/' + game.language.dir + name + '.json',
      complete: function (response) {
        game.states.loading.updated();
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
      game.states.loading.updated();
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
