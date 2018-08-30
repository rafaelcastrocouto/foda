game.map = {
  extendjQuery: function() {
    $.fn.extend({
      getX: game.map.getX,
      getY: game.map.getY,
      getSpot: game.map.getSpot,
      getDirectionObj: game.map.getDirectionObj,
      getDirectionStr: game.map.getDirectionStr,
      getDirSpot: game.map.getDirSpot,
      atRange: game.map.atRange,
      // at range border
      around: game.map.around,
      // in range exclude self
      inRange: game.map.inRange,
      // in range include self
      opponentsInRange: game.map.opponentsInRange,
      alliesInRange: game.map.alliesInRange,
      inAttackRange: game.map.inAttackRange,
      inMovementRange: game.map.inMovementRange,
      inCross: game.map.inCross,
      opponentsInCross: game.map.opponentsInCross,
      alliesInCross: game.map.alliesInCross,
      inLine: game.map.inLine,
      alliesInLine: game.map.alliesInLine,
      opponentsInLine: game.map.opponentsInLine,
      firstSpotInLine: game.map.firstSpotInLine,
      lastSpotInLine: game.map.lastSpotInLine,
      firstFreeSpotInLine: game.map.firstFreeSpotInLine,
      lastFreeSpotInLine: game.map.lastFreeSpotInLine,
      firstCardInLine: game.map.firstCardInLine,
      getPosition: game.map.getPosition,
      cardsInRange: game.map.cardsInRange,
      behindTarget: game.map.behindTarget
    });
  },
  lettersStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  build: function() {
    if (!game.map.letters) game.map.letters = game.map.lettersStr.split('');
    game.map.spots = [];
    var map = $('<div>').addClass('map').css({
      width: game.width * 212,
      height: game.height * 312
    }), w, h, tr;
    if (!!game.getData('flat-map')) map.addClass('flat');
    for (h = 0; h < game.height; h += 1) {
      game.map.spots[h] = [];
      tr = $('<div>').addClass('row ' + 'trow' + (h + 1)).appendTo(map);
      for (w = 0; w < game.width; w += 1) {
        game.map.spots[h][w] = $('<div>').attr({
          id: game.map.toPosition(w, h)
        }).addClass('free spot ' + 'row' + (h + 1) + ' col' + game.map.letters[w]).appendTo(tr).on('contextmenu', game.events.cancel);
        if (game.debug)
          game.map.spots[h][w].append($('<span>').addClass('debug').text(game.map.toPosition(w, h)));
      }
    }
    game.map.updateGrid();
    game.map.builded = true;
    game.map.el = map;
    return map;
  },
  updateGrid: function(phase) {
    game.map.grid = new PF.Grid(game.width,game.height);
    for (var h = 0; h < game.height; h += 1) {
      for (var w = 0; w < game.width; w += 1) {
        if (!game.map.spots[h][w].hasClass('free')) {
          if (phase) {
            var card = $('.card', game.map.spots[h][w]);
            if (card.hasClass('trees')) game.map.grid.setWalkableAt(w, h, false);
          } else {
            game.map.grid.setWalkableAt(w, h, false);
          }
        }
      }
    }
    game.map.finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });
  },
  toPosition: function(w, h) {
    if (w >= 0 && h >= 0 && w < game.width && h < game.height) {
      return game.map.letters[w] + (h + 1);
    }
  },
  getX: function(id) {
    if (!id)
      id = this;
    if (id && typeof id.attr == 'function')
      id = id.attr('id') || id.parent().attr('id');
    if (id) {
      var w = game.map.letters.indexOf(id[0]);
      if (w >= 0 && w < game.width) {
        return w;
      }
    }
  },
  getY: function(id) {
    if (!id)
      id = this;
    if (id && typeof id.attr == 'function')
      id = id.attr('id') || id.parent().attr('id');
    if (id) {
      var h = parseInt(id[1], 10) - 1;
      if (h >= 0 && h < game.height) {
        return h;
      }
    }
  },
  getSpot: function(w, h) {
    // console.log(w, h, this);
    if (w === undefined && this.closest)
      return this.closest('.spot');
    if (game.map.spots[h] && game.map.spots[h][w])
      return game.map.spots[h][w];
  },
  getDirectionObj: function(target) {
    var p1 = {
      x: game.map.getX(this),
      y: game.map.getY(this)
    }
      , p2 = {
      x: game.map.getX(target),
      y: game.map.getY(target)
    }
      , dir = {
      x: 0,
      y: 0
    };
    if (p1.y - p2.y > 0) {
      dir.y = -1;
    }
    if (p1.y - p2.y < 0) {
      dir.y = 1;
    }
    if (p1.x - p2.x > 0) {
      dir.x = -1;
    }
    if (p1.x - p2.x < 0) {
      dir.x = 1;
    }
    return dir;
  },
  getDirectionStr: function(target) {
    var dir = this.getDirectionObj(target);
    if (dir.x == 1)
      return 'right';
    if (dir.x == -1)
      return 'left';
    if (dir.y == 1)
      return 'bottom';
    if (dir.y == -1)
      return 'top';
  },
  getDirSpot: function(dir) {
    var sx = this.getX()
      , sy = this.getY();
    var x = sx
      , y = sy;
    var spot;
    if (dir == 'right')
      x++;
    if (dir == 'left')
      x--;
    if (dir == 'bottom')
      y++;
    if (dir == 'top')
      y--;
    return game.map.getSpot(x, y);
  },
  getPosition: function() {
    if (this.hasClass('spot')) {
      return this.attr('id');
    }
    return this.closest('.spot').attr('id');
  },
  mirrorPosition: function(pos) {
    var w = game.map.getX(pos)
      , h = game.map.getY(pos)
      , x = game.width - w - 1
      , y = game.height - h - 1;
    return game.map.toPosition(x, y);
  },
  invertDirection: function(str) {
    if (str == 'left')
      return 'right';
    if (str == 'right')
      return 'left';
    if (str == 'top')
      return 'bottom';
    if (str == 'bottom')
      return 'top';
  },
  rangeArray: [0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4],
  atRange: function(r, cb, filter) {
    // at range border
    var range = r;
    if (typeof (r) == 'string')
      range = game.map.getRangeInt(r);
    var spot = $(this).closest('.spot');
    if (range >= 0 && range <= game.map.rangeArray.length) {
      var radius, x, y, r2, l, t = [], fil = function(x, y) {
        var spot = game.map.getSpot(x, y);
        if (spot && t.indexOf(spot) < 0) {
          if (filter) {
            if (!spot.hasClasses(filter)) {
              cb(spot);
            }
          } else {
            cb(spot);
          }
          t.push(spot);
        }
      }, w = game.map.getX(spot), h = game.map.getY(spot);
      if (range === 0) {
        fil(w, h);
      } else {
        radius = game.map.rangeArray[range];
        r = Math.round(radius);
        r2 = radius * radius;
        l = Math.ceil(radius) * Math.cos(Math.PI / 4);
        fil(w, h + r);
        fil(w, h - r);
        fil(w - r, h);
        fil(w + r, h);
        if (range === 2 || range === 3) {
          for (x = 1; x <= l; x += 1) {
            y = Math.round(Math.sqrt(r2 - x * x));
            fil(w + x, h + y);
            fil(w + x, h - y);
            fil(w - x, h + y);
            fil(w - x, h - y);
          }
        } else if (range > 3) {
          for (x = 1; x <= l; x += 1) {
            y = Math.round(Math.sqrt(r2 - x * x));
            fil(w + x, h + y);
            fil(w + y, h + x);
            fil(w + x, h - y);
            fil(w + y, h - x);
            fil(w - x, h + y);
            fil(w - y, h + x);
            fil(w - x, h - y);
            fil(w - y, h - x);
          }
        }
      }
    }
  },
  around: function(r, cb) {
    // in range not self
    var spot = this
      , range = r;
    if (typeof (r) == 'string')
      range = game.map.getRangeInt(r);
    if (range === 3) {
      spot.atRange(game.map.getRangeStr(1), cb);
    }
    if (range === 4) {
      spot.atRange(game.map.getRangeStr(2), cb);
    }
    if (range === 5) {
      spot.atRange(game.map.getRangeStr(1), cb);
      spot.atRange(game.map.getRangeStr(3), cb);
    }
    if (range === 6) {
      spot.atRange(game.map.getRangeStr(2), cb);
      spot.atRange(game.map.getRangeStr(4), cb);
    }
    if (range === 7) {
      spot.atRange(game.map.getRangeStr(1), cb);
      spot.atRange(game.map.getRangeStr(3), cb);
      spot.atRange(game.map.getRangeStr(5), cb);
    }
    if (range === 8) {
      spot.atRange(game.map.getRangeStr(2), cb);
      spot.atRange(game.map.getRangeStr(4), cb);
      spot.atRange(game.map.getRangeStr(6), cb);
    }
    spot.atRange(range, cb);
  },
  inRange: function(range, cb) {
    // in range and self
    this.atRange(game.map.getRangeStr(0), cb);
    this.around(range, cb);
  },
  inAttackRange: function (target) {
    var inrange = false;
    this.around(this.data('range'), function(spot) {
      var enemyinrange = $('.card', spot);
      if (enemyinrange[0] == target[0]) inrange = true;
    });
    return inrange;
  },
  inCross: function(range, width, cb, offset) {
    var spot = $(this).closest('.spot');
    if (!offset)
      offset = 0;
    if (range >= 0) {
      var x, y, r, fil = function(x, y, cs) {
        var spot = game.map.getSpot(x, y);
        if (spot)
          cb(spot, cs);
      }, w = game.map.getX(spot), h = game.map.getY(spot);
      if (range === 0) {
        fil(w, h);
      } else {
        for (r = 1 + offset; r <= range; r += 1) {
          if (width >= 0) {
            fil(w, h + r, 'bottom');
            fil(w, h - r, 'top');
            fil(w - r, h, 'left');
            fil(w + r, h, 'right');
          }
          if (width >= 1) {
            fil(w - 1, h + r, 'bottom');
            fil(w + 1, h + r, 'bottom');
            fil(w - 1, h - r, 'top');
            fil(w + 1, h - r, 'top');
            fil(w - r, h - 1, 'left');
            fil(w - r, h + 1, 'left');
            fil(w + r, h - 1, 'right');
            fil(w + r, h + 1, 'right');
          }
        }
      }
    }
  },
  opponentsInCross: function(range, width, cb, offset) {
    var side = this.side();
    var opponent = game.opponent(side);
    this.inCross(range, width, cb, function(spot, cs) {
      var card = $('.card.' + opponent, spot);
      if (card.length)
        cb(card, cs);
    }, offset);
  },
  alliesInCross: function(range, width, cb, offset) {
    var side = this.side();
    source.inCross(range, width, cb, function(spot, cs) {
      var card = $('.card.' + side, spot);
      if (card.length)
        cb(card, cs);
    }, offset);
  },
  inLine: function(target, range, width, cb, offset) {
    var source = this;
    var direction = source.getDirectionStr(target);
    var x = target.getX()
      , y = target.getY();
    var start = {}
      , end = {};
    if (!offset)
      offset = 0;
    if (direction == 'top') {
      start.x = x - width;
      end.x = x + width;
      start.y = y - range + 1;
      end.y = y - offset;
    }
    if (direction == 'bottom') {
      start.x = x - width;
      end.x = x + width;
      start.y = y + offset;
      end.y = y + range - 1;
    }
    if (direction == 'left') {
      start.x = x - range + 1;
      end.x = x - offset;
      start.y = y - width;
      end.y = y + width;
    }
    if (direction == 'right') {
      start.x = x + offset;
      end.x = x + range - 1;
      start.y = y - width;
      end.y = y + width;
    }
    for (var i = start.x; i <= end.x; i++) {
      for (var j = start.y; j <= end.y; j++) {
        var spot = game.map.getSpot(i, j);
        if (spot) {
          cb(spot);
        }
      }
    }
    return this;
  },
  opponentsInLine: function(target, range, width, cb, offset) {
    var side = this.side();
    var opponent = game.opponent(side);
    this.inLine(target, range, width, function(spot) {
      var card = spot.find('.card.' + opponent);
      if (card.length)
        cb(card);
    }, offset);
    return this;
  },
  alliesInLine: function(target, range, width, cb, offset) {
    var side = this.side();
    this.inLine(target, range, width, function(spot) {
      var card = spot.find('.card.' + side);
      if (card.length)
        cb(card);
    }, offset);
    return this;
  },
  inMovementRange: function(speed, cb, filter) {
    var card = this;
    var range = speed || game.defaultSpeed;
    if (range >= 0 && range <= game.map.rangeArray.length) {
      var ox = game.map.getX(card)
        , oy = game.map.getY(card)
        , fil = function(x, y) {
        var spot = game.map.getSpot(x, y);
        if (spot) {
          if (filter) {
            if (!spot.hasClasses(filter)) {
              cb(spot);
            }
          } else {
            cb(spot);
          }
        }
      };
      card.around(range, function(spot) {
        var ex = game.map.getX(spot)
          , ey = game.map.getY(spot);
        if (range > 2) {
          game.map.updateGrid(card.hasClass('phased'));
          var path = game.map.finder.findPath(ox, oy, ex, ey, game.map.grid);
          if (path.length && (path.length - 1) <= Math.ceil(range / 2)) {
            fil(ex, ey);
          }
        } else fil(ex, ey);
      });
    }
  },
  getRangeInt: function(range) {
    if (typeof(range)=='number') return range;
    var r = 0;
    if (range === game.data.ui.small) {
      r = 1;
    }
    if (range === game.data.ui.melee) {
      r = 2;
    }
    if (range === game.data.ui.short) {
      r = 3;
    }
    if (range === game.data.ui.long) {
      r = 4;
    }
    if (range === game.data.ui.ranged) {
      r = 5;
    }
    if (range === game.data.ui.far) {
      r = 6;
    }
    if (range === game.data.ui.away) {
      r = 7;
    }
    if (range === game.data.ui.max) {
      r = 8;
    }
    if (range === game.data.ui.global) {
      r = 999;
    }
    return r;
  },
  getRangeStr: function(r) {
    if (typeof(r)=='string') return r;
    var range = '';
    if (r === 1) {
      range = game.data.ui.small;
    }
    if (r === 2) {
      range = game.data.ui.melee;
    }
    if (r === 3) {
      range = game.data.ui.short;
    }
    if (r === 4) {
      range = game.data.ui.long;
    }
    if (r === 5) {
      range = game.data.ui.ranged;
    }
    if (r === 6) {
      range = game.data.ui.far;
    }
    if (r === 7) {
      range = game.data.ui.away;
    }
    if (r === 9) {
      range = game.data.ui.max;
    }
    if (r === 999) {
      range = game.data.ui.global;
    }
    return range;
  },
  cardsInRange: function(range, cb) {
    this.inRange(range, function(spot) {
      var card = spot.find('.card');
      if (card.length)
        cb(card);
    });
  },
  opponentsInRange: function(range, cb) {
    var opponent = this.opponent();
    this.inRange(range, function(spot) {
      var card = $('.card.' + opponent, spot);
      if (card.length)
        cb(card);
    });
    return this;
  },
  alliesInRange: function(range, cb) {
    var side = this.side();
    this.inRange(range, function(spot) {
      var card = spot.find('.card.' + side);
      if (card.length)
        cb(card);
    });
    return this;
  },
  firstSpotInLine: function(target, range) {
    var source = this
      , dir = source.getDirectionObj(target);
    for (var i = 1; i <= range; i += 1) {
      var x = game.map.getX(source) + (i * dir.x)
        , y = game.map.getY(source) + (i * dir.y);
      var spot = game.map.getSpot(x, y);
      if (spot)
        return spot;
    }
  },
  firstFreeSpotInLine: function(target, range, limit) {
    var source = this
      , dir = source.getDirectionObj(target);
    for (var i = 1; i <= range; i += 1) {
      var x = game.map.getX(source) + (i * dir.x)
        , y = game.map.getY(source) + (i * dir.y);
      var spot = game.map.getSpot(x, y);
      if ((!limit || (x == limit.getX() && y == limit.getY())) || (spot && spot.hasClass('free') && !spot.hasClass('block')))
        return spot;
    }
  },
  lastSpotInLine: function(target, range) {
    var source = this
      , dir = source.getDirectionObj(target);
    for (var i = range; i > 0; i -= 1) {
      var x = game.map.getX(source) + (i * dir.x)
        , y = game.map.getY(source) + (i * dir.y);
      var spot = game.map.getSpot(x, y);
      if (spot)
        return spot;
    }
  },
  lastFreeSpotInLine: function(target, range) {
    var source = this
      , dir = source.getDirectionObj(target);
    for (var i = range; i > 0; i -= 1) {
      var x = game.map.getX(source) + (i * dir.x)
        , y = game.map.getY(source) + (i * dir.y);
      var spot = game.map.getSpot(x, y);
      if (spot && spot.hasClass('free') && !spot.hasClass('block'))
        return spot;
    }
  },
  firstCardInLine: function(target, range) {
    var source = this
      , dir = source.getDirectionObj(target);
    for (var i = 1; i <= range; i += 1) {
      var x = game.map.getX(source) + (i * dir.x)
        , y = game.map.getY(source) + (i * dir.y);
      var spot = game.map.getSpot(x, y);
      if (spot) {
        var card = spot.find('.card');
        if (card.length && !card.hasClass('cycloned'))
          return card;
      }
    }
  },
  behindTarget: function(target) {
    var source = this
      , dir = source.getDirectionObj(target);
    dir.x += target.getX();
    dir.y += target.getY();
    var behind = game.map.getSpot(dir.x, dir.y);
    if (behind) {
      var card = behind.children('.card');
      if (card.length && !card.hasClass('cycloned'))
        return card;
    }
  },
  clear: function() {
    game.highlight.clearMap();
    game.map.el.removeClass('night');
    $('.map .projectile').remove();
    $('.map .spot').removeClass('block playerarea enemyarea jungle cript').addClass('free');
  }
};
