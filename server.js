var http = require('http'),
  url = require('url'),
  fs = require('fs'),
  serveStatic = require('serve-static'),
  host = process.env.HOST,
  port = process.env.PORT || 5000,
  secret = process.env.SECRET || 'password',
  waiting = {id: 'none'},
  waitTimeout,
  chat = [],
  debug = false,
  waitLimit = 5,
  origin;

var db = {
  data: {},
  get: function(name, cb){ cb(db.data[name] || ''); },
  set: function(name, val, cb){ cb(db.data[name] = val); }
};

var mongo = {
  client: require('mongodb').MongoClient,
  url: 'mongodb://rafaelcastrocouto:'+process.env.SECRET+'@ds147905.mlab.com:47905/dotacard',
  connect: function (cb) { mongo.client.connect(mongo.url, function (err, db) { if (!err) cb(db); else console.log(err.message); });},
  get: function (name, cb) { mongo.connect(function(db) {
      db.collection('collection').findOne({document: 'dotacard'}, function(err, document) { cb(document[name] || ''); });
    });
  },
  set: function(name, val, cb) { var data = {}; data[name] = val; mongo.connect(function(db) {
      db.collection('collection').updateOne({ 'document': 'dotacard' }, { $set: data }, cb);
    });
  },
  poll: {},
  rank: {}, ranked: [],
  errors: ['Error Log']
};

var getRank = function () {
  mongo.get('rank', function (data) {
    mongo.rank = data;
    for (var item in data) { mongo.ranked.push({'name': item, 'points': parseInt(data[item])}); }
    mongo.ranked.sort(function (a,b) { return a.points - b.points; });
    if (mongo.ranked.length !== 5) setTimeout(getRank, 10000);
  });
};

if (secret !== 'password') {
  mongo.get('poll', function (data) { mongo.poll = data; });
  getRank();
  mongo.set('errors', mongo.errors);
}

var clientServer = serveStatic('client', {'index': ['index.html', 'index.htm']});
var rootServer = serveStatic(__dirname);

var allowed = [
  'foda-app.herokuapp.com',
  'rafaelcastrocouto.github.io'
];

var setHeaders = function (request, response) {
  var origin = request.headers.host;
  if (allowed.indexOf(origin) > -1) {
    response.setHeader('Access-Control-Allow-Origin', '*');
  }
};

var send = function(response, data){
  response.statusCode = 200;
  response.end( String(data) );
};

var clearWait = function () {
  clearTimeout(waitTimeout);
  waiting = {id: 'none'};
};

http.createServer(function(request, response) {
  setHeaders(request, response);
  var urlObj = url.parse(request.url, true); 
  var pathname = urlObj.pathname;
  if (pathname[0] === '/') { pathname = pathname.slice(1); }
  if (pathname === 'db') {
    response.setHeader('Content-Type', 'application/json');
    var query = urlObj.query;
    if (query.set){
      switch (query.set) {
        case 'waiting':
          if (query.data) {
            //console.log(query.data)
            if (waiting.id === 'none') {
              send(response, JSON.stringify(waiting));
              waiting.id = query.data;
              waitTimeout = setTimeout(clearWait, waitLimit * 1000);
            } else {
              send(response, JSON.stringify(waiting));
              clearWait();
            }
          }
          //console.log(waiting);
          return;
        case 'back':
          if (query.data == waiting.id) {
            db.data[waiting.id] = null;
            clearWait();
          }
          send(response, JSON.stringify(waiting));
          return;
        case 'chat':
          var msg = {
            data: query.data.substring(0, 36), 
            user: query.user.substring(0, 24),
            date: query.date
          };
          chat.unshift(msg);
          chat = chat.slice(0, 3);
          send(response, JSON.stringify({messages: chat, waiting: waiting}));
          return;
        case 'poll':
          if (secret !== 'password' && typeof(mongo.poll[query.data]) == 'number') {
            mongo.poll[query.data]++;
            mongo.set('poll', mongo.poll);
          }
          send(response, JSON.stringify(mongo.poll));
          return;
        case 'rank':
          if (secret !== 'password' && query.data) {
            var player = JSON.parse(query.data), i;
            player.points = parseInt(player.points);
            if (player.points > mongo.ranked[0].points) {
              if (mongo.rank[player.name] && player.points > mongo.rank[player.name]) {
                mongo.rank[player.name] = player.points;
              } else {
                mongo.ranked.push({name: player.name, points: player.points});
                mongo.ranked.sort(function (a,b) { return a.points - b.points; });
                mongo.ranked = mongo.ranked.slice(1, 6);
                mongo.rank = {};
                for (i=0; i<5; i++) { mongo.rank[mongo.ranked[i].name] = mongo.ranked[i].points; }
              }
              if (Object.keys(mongo.rank).length == 5) mongo.set('rank', mongo.rank);
            }
          }
          send(response, JSON.stringify(mongo.rank));
          return;
        case 'errors':
          if (mongo.errors.length) {
            mongo.errors.push(query.data);
            mongo.set('errors', mongo.errors);
          }
          return;
        default:
          db.set(query.set, query.data, function(data){
            send(response, data);
          });
          return;
      }
    } else if (query.get) {
      switch (query.get) {
        case 'server':
          send(response, JSON.stringify({status: 'online'}));
          return;
        case 'chat':
          send(response, JSON.stringify({messages: chat, waiting: waiting}));
          return;
        case 'lang':
          send(response, JSON.stringify({lang: request.headers['accept-language'] || ''})); 
          return;
        case 'waiting':
          send(response, waiting);
          return;
        case 'rank':
          send(response, JSON.stringify(mongo.rank));
          return;
        default:
          db.get(query.get, function(data) {
            send(response, data);
          });
          return;
      }
    } else {
      send(response, '{"msg": "FODA DataBase working!"}');
      return;
    }
  } else { //STATIC
    clientServer(request, response, function onNext(err) {
      rootServer(request, response, function onNext(err) {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html; charset=UTF-8');
        fs.createReadStream('client/404.html').pipe(response);
      });
    });
  }
}).listen(port, host);

console.log(new Date().toLocaleString() + ' FODA server running at: http://'+(host || 'localhost')+(port === '80' ? '/' : ':'+port+'/') );
