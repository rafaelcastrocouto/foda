game.states.loading = {
  updating: 0,
  totalUpdate: 10, // values + language + ui + heroes + skills + units + items + campaign + package + db
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
      game.states.loading.json('items', game.states.loading.updated, true);
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
  preloadimgs: [
    'log/sky.jpg',
    'log/towers.png',
    'log/title.png',
    'log/front.png',
    'menu/ground.png',
    'menu/sky.png',
    'menu/mountains.png',
    'menu/icons.png',
    'menu/bush.png',
    'menu/dolls.png'
  ],
  imgload: 0,
  finished: function () {
    game.states.loading.box.addClass('hidden');
    game.container.append(game.topbar);
    game.options.build();
    game.states.build( function () {
      game.rank.build();
      //preloadimgs
      $.each(game.states.loading.preloadimgs, function () {
        $('<img>').attr('src', '/img/'+this).on('load', function () {
          game.states.loading.imgload++;
          if (game.states.loading.imgload == game.states.loading.preloadimgs.length) {
            game.states.menu.el.addClass('loaded');
          }
        }).appendTo(game.hidden);
      });
      game.achievements.build();
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
