if (process.env.NODE_ENV !== 'production') require('dotenv').config();

var nodeEnv = process.env.NODE_ENV || 'development'; 
var host = process.env.HOST;
var port = process.env.PORT || 5000;
var mongoConn = process.env.MONGO_CONN;

var http = require('http');
var url = require('url');
var fs = require('fs');
var serveStatic = require('serve-static');

var maxAge = '1w';

var servers = {
  rootServer: serveStatic(__dirname, {'maxAge': maxAge}),
  clientServer: serveStatic('client', {'maxAge': maxAge, 'index': ['index.html', 'index.htm']}),
  gzipServer: serveStatic('gzip', {'maxAge': maxAge, 'setHeaders': function(response) {
    response.setHeader('Content-Encoding', 'gzip');
  }}),
  staticServer: function (request, response) {
    servers.gzipServer(request, response, function onNext(err) {
      servers.clientServer(request, response, function onNext(err) {
        servers.rootServer(request, response, function onNext(err) {
          response.statusCode = 404;
          response.setHeader('Content-Type', 'text/html; charset=UTF-8');
          fs.createReadStream('client/404.html').pipe(response);
        });
      });
    });
  },
  allowed: [host + ':' + port, 'foda-app.herokuapp.com', 'rafaelcastrocouto.github.io', 'inspectlet.com'],
  setHeaders: function (request, response) {
    var origin = request.headers.origin;
    if (servers.allowed.indexOf(origin) > -1) {
      response.setHeader('Access-Control-Allow-Origin', origin);
    }
    response.setHeader('Cache-Control', 'max-age=31536000');
  },
  send: function (response, data) {
    response.statusCode = 200;
    response.end(String(data));
  }
};

var games = {
  data: {},
  dataLimit: 25, // minutes
  dataTimeout: {},
  waiting: {},
  waitLimit: 10, // seconds
  waitTimeout: {},
  get: function (name, cb) {
    cb(games.data[name] || '');
  },
  set: function (name, val, cb) {
    cb(games.data[name] = val);
    var clear = games.clear.bind(0, name);
    games.dataTimeout[name] = setTimeout(clear, 120 * games.dataLimit * 60 * 1000);
  },
  clear: function (name) {
    if (games.data[name]) delete games.data[name];
  },
  join: function (response, query) {
    if (query.data) {
      var data = JSON.parse(query.data);
      games.waiting[data.id] = {
        id: data.id,
        size: data.size,
        name: data.name
      };
      var clear = games.clearWait.bind(0, data.id);
      games.waitTimeout[data.id] = setTimeout(clear, games.waitLimit * 1000);
      servers.send(response, JSON.stringify(games.waiting));
    }
  },
  back: function (response, query) { 
    if (query.data) {
      games.clearWait(query.data);
    }
  },
  clearWait: function (id) {
    if (games.waiting[id]) delete games.waiting[id];
  }
};

var mongo = {
  start: function () {
    if (mongoConn) {
      mongo.connect(function (db) {
        mongo.db = db;
        mongo.collection = db.collection('collection');
        mongo.get('poll', function(data) { mongo.poll = data; });
        rank.get();
        errorLog.reset();
      });
    }
  },
  client: new require('mongodb').MongoClient(mongoConn, {
    useUnifiedTopology: true
  }),
  url: mongoConn,
  doc: { document: 'dotacard' },
  logError: function (str, cb, name) {
    return function (err, client) { 
      if (err) console.log('MongoDB '+str +': '+ err.message);
      else if (cb) {
        var data = client;
        if (client.db) data = client.db();
        cb(name ? (data[name] || '') : data); 
      }
    };
  },
  connect: function(cb) {
    mongo.client.connect(mongo.logError('connection fail', cb));
  },
  get: function(name, cb) {
    mongo.collection.findOne(mongo.doc, mongo.logError('get('+name+') fail', cb, name));
  },
  set: function(name, val, cb) {
    mongo.collection.updateOne(mongo.doc, { $set: { [name]: val } }, cb);
  },
  poll: {},
  pollSet: function (response, query) { //console.log('query', query)
    if (mongoConn && typeof (mongo.poll[query.data]) == 'number') {
      mongo.poll[query.data]++;
      mongo.set('poll', mongo.poll, mongo.logError('Poll error'));
    }
    servers.send(response, JSON.stringify(mongo.poll));
  },
  rank: {}, ranked: [],
  errors: ['Error Log']
};

var rank = {
  sort: function(a, b) {
    return a.points - b.points;
  },
  get: function() {
    mongo.get('rank', function(data) {
      mongo.rank = data;
      for (var item in data) {
        mongo.ranked.push({
          'name': item,
          'points': parseInt(data[item])
        });
      }
      mongo.ranked.sort(rank.sort);
      if (mongo.ranked.length !== 5) {
        console.log('Not able to get rank');
        setTimeout(rank.get, 10000);
      }
    });
  },
  set: function (query) {
    if (mongoConn && query.data) {
      var player = JSON.parse(query.data), i;
      player.points = parseInt(player.points);
      if (player.points > mongo.ranked[0].points) {
        if (mongo.rank[player.name] && player.points > mongo.rank[player.name]) {
          mongo.rank[player.name] = player.points;
        } else {
          mongo.ranked.push({
            name: player.name,
            points: player.points
          });
          mongo.ranked.sort(rank.sort);
          mongo.ranked = mongo.ranked.slice(1, 6);
          mongo.rank = {};
          for (i = 0; i < 5; i++) {
            mongo.rank[mongo.ranked[i].name] = mongo.ranked[i].points;
          }
        }
        if (Object.keys(mongo.rank).length == 5)
          mongo.set('rank', mongo.rank, mongo.logError('set rank fail'));
      }
    }
    servers.send(response, JSON.stringify(mongo.rank));
  }
};

var errorLog = {
  reset: function () {
    mongo.set('errors', mongo.errors, mongo.logError('error log reset fail'));
  },
  set: function (query) {
    if (mongo.errors.length) {
      mongo.errors.push(query.data);
      mongo.set('errors', mongo.errors, mongo.logError('error log set fail'));
    }
  }
};

mongo.start();

http.createServer(function(request, response) {
  servers.setHeaders(request, response);
  var urlObj = url.parse(request.url, true);
  var query = urlObj.query;
  var pathname = urlObj.pathname;
  if (pathname[0] === '/') { pathname = pathname.slice(1); }
  if (pathname === 'db') {
    response.setHeader('Content-Type', 'application/json');
    if (query.set) {
      switch (query.set) {
        case 'join': games.join(response, query); return;
        case 'back': games.back(response, query); return;
        case 'poll': mongo.pollSet(response, query); return;
        case 'rank': rank.set(query); return;
        case 'errors': errorLog.set(query); return;
        default: games.set(query.set, query.data, function(data) { servers.send(response, data); }); return;
      }
    } else if (query.get) {
      switch (query.get) {
        case 'server': servers.send(response, JSON.stringify({ status: 'online' })); return;
        case 'lang': servers.send(response, JSON.stringify({ lang: request.headers['accept-language'] || ''})); return;
        case 'waiting': servers.send(response, JSON.stringify(games.waiting)); return;
        case 'rank':servers.send(response, JSON.stringify(mongo.rank)); return;
        default: games.get(query.get, function(data) { servers.send(response, data); }); return;
      }
    } else { servers.send(response, '{"msg": "FODA DataBase working!"}'); return; }
  } else servers.staticServer(request, response);
}).listen(port, host);

console.log(new Date().toLocaleString() + ' FODA server running at: http://' + (host || 'localhost') + (port === '80' ? '/' : ':' + port + '/'));

//setInterval(function () { console.log(games.data); }, 1000);
