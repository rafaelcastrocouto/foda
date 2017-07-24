game.map = {
  extendjQuery: function () {
    $.fn.extend({
      getX: game.map.getX,
      getY: game.map.getY,
      getSpot: game.map.getSpot,
      getDirectionObj: game.map.getDirectionObj,
      getDirectionStr: game.map.getDirectionStr,
      getDirSpot: game.map.getDirSpot,
      atRange: game.map.atRange, // at range border
      around: game.map.around, // in range exclude self
      inRange: game.map.inRange, // in range include self
      opponentsInRange: game.map.opponentsInRange,
      alliesInRange: game.map.alliesInRange,
      inMovementRange: game.map.inMovementRange,
      inCross: game.map.inCross,
      opponentsInCross: game.map.opponentsInCross,
      alliesInCross: game.map.alliesInCross,
      inLine: game.map.inLine,
      alliesInLine: game.map.alliesInLine,
      opponentsInLine: game.map.opponentsInLine,
      firstFreeSpotInLine: game.map.firstFreeSpotInLine,
      firstCardInLine: game.map.firstCardInLine,
      getPosition: game.map.getPosition,
      cardsInRange: game.map.cardsInRange,
      radialStroke: game.map.radialStroke,
      crossStroke: game.map.crossStroke,
      linearStroke: game.map.linearStroke,
      behindTarget: game.map.behindTarget
    });
  },
  lettersStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  build: function (opt) {
    game.map.letters = game.map.lettersStr.split('');
    game.map.spots = [];
    var map = $('<div>').addClass('map').css({width: game.width * 212, height: game.height * 312}), w, h, tr;
    for (h = 0; h < opt.height; h += 1) {
      game.map.spots[h] = [];
      tr = $('<div>').addClass('row ' + 'trow'+(h+1)).appendTo(map);
      for (w = 0; w < opt.width; w += 1) {
        game.map.spots[h][w] = $('<div>').attr({id: game.map.toPosition(w, h)}).addClass('free spot ' + 'row'+(h+1) + ' col'+game.map.letters[w]).appendTo(tr).on('contextmenu', game.events.cancel);
        if (game.debug) game.map.spots[h][w].append($('<span>').addClass('debug').text(game.map.toPosition(w, h)));
      }
    }
    if (game.debug) map.addClass('debug');
    game.map.builded = true;
    game.map.el = map;
    return map;
  },
  toPosition: function (w, h) {
    if (w >= 0 && h >= 0 && w < game.width && h < game.height) {
      return game.map.letters[w] + (h + 1);
    }
  },
  getX: function (id) {
    if (!id) id = this;
    if (id && typeof id.attr == 'function') id = id.attr('id') || id.parent().attr('id');
    if (id) {
      var w = game.map.letters.indexOf(id[0]);
      if (w >= 0 && w < game.width) { return w; }
    }
  },
  getY: function (id) {
    if (!id) id = this;
    if (id && typeof id.attr == 'function') id = id.attr('id') || id.parent().attr('id');
    if (id) {
      var h = parseInt(id[1], 10) - 1;
      if (h >= 0 && h < game.height) { return h; }
    }
  },
  getSpot: function (w, h) { // console.log(w, h, this);
    if (w === undefined && this.closest) return this.closest('.spot');
    if (game.map.spots[h] && game.map.spots[h][w]) return game.map.spots[h][w];
  },
  getDirectionObj: function (target) {
    var p1 =  { x: game.map.getX(this),   y: game.map.getY(this) },
        p2 =  { x: game.map.getX(target), y: game.map.getY(target) },
        dir = { x: 0, y: 0 };
    if (p1.y - p2.y > 0) { dir.y = -1; }
    if (p1.y - p2.y < 0) { dir.y =  1; }
    if (p1.x - p2.x > 0) { dir.x = -1; }
    if (p1.x - p2.x < 0) { dir.x =  1; }
    return dir;
  },
  getDirectionStr: function (target) {
    var dir = this.getDirectionObj(target);
    if (dir.x ==  1) return 'right';
    if (dir.x == -1) return 'left';
    if (dir.y ==  1) return 'bottom';
    if (dir.y == -1) return 'top'; 
  },
  getDirSpot: function (dir) {
    var sx = this.getX(), sy = this.getY();
    var x = sx, y = sy;
    var spot;
    if (dir == 'right') x++;
    if (dir == 'left') x--;
    if (dir == 'bottom') y++;
    if (dir == 'top') y--;
    return game.map.getSpot(x, y);
  },
  getPosition: function () {
    if (this.hasClass('spot')) { return this.attr('id'); }
    return this.closest('.spot').attr('id');
  },
  mirrorPosition: function (pos) {
    var w = game.map.getX(pos), h = game.map.getY(pos),
      x = game.width - w - 1, y = game.height - h - 1;
    return game.map.toPosition(x, y);
  },
  invertDirection: function (str) {
    if (str == 'left')   return 'right';
    if (str == 'right')  return 'left';
    if (str == 'top')    return 'bottom';
    if (str == 'bottom') return 'top';
  },
  rangeArray: [ 0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4 ],
  atRange: function (r, cb, filter) { // at range border
    var range = r;
    if ( typeof(r) == 'string' ) range = game.map.getRangeInt(r);
    var spot = $(this).closest('.spot');
    if (range >= 0 && range <= game.map.rangeArray.length) {
      var radius, x, y, r2, l, t = [],
        fil = function (x, y) {
          var spot = game.map.getSpot(x, y);
          if (spot && t.indexOf(spot) < 0) {
            if (filter) {
              if (!spot.hasClasses(filter)) { cb(spot); }
            } else { cb(spot); }
            t.push(spot);
          }
        },
        w = game.map.getX(spot),
        h = game.map.getY(spot);
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
  around: function (range, cb) { // in range not self
    var spot = this;
    spot.atRange(range, cb);
    var r = game.map.getRangeInt(range);
    if (r === 3) { 
      spot.atRange(game.map.getRangeStr(1), cb); 
    }
    if (r === 4) { 
      spot.atRange(game.map.getRangeStr(2), cb); 
    }
    if (r === 5) {
      spot.atRange(game.map.getRangeStr(1), cb);
      spot.atRange(game.map.getRangeStr(3), cb);
    }
    if (r === 6) {
      spot.atRange(game.map.getRangeStr(2), cb);
      spot.atRange(game.map.getRangeStr(4), cb);
    }
    if (r === 7) {
      spot.atRange(game.map.getRangeStr(1), cb);
      spot.atRange(game.map.getRangeStr(3), cb);
      spot.atRange(game.map.getRangeStr(5), cb);
    }
    if (r === 8) {
      spot.atRange(game.map.getRangeStr(2), cb);
      spot.atRange(game.map.getRangeStr(4), cb);
      spot.atRange(game.map.getRangeStr(6), cb);
    }
  },
  inRange: function (range, cb) {// in range and self
    this.atRange(game.map.getRangeStr(0), cb);
    this.around(range, cb);
  },
  inCross: function (range, width, cb, offset) {
    var spot = $(this).closest('.spot');
    if (!offset) offset = 0;
    if (range >= 0) {
      var x, y, r,
        fil = function (x, y, cs) {
          var spot = game.map.getSpot(x, y);
          if (spot) cb(spot, cs);
        },
        w = game.map.getX(spot),
        h = game.map.getY(spot);
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
            fil(w - 1, h + r, 'bottom'); fil(w + 1, h + r, 'bottom');
            fil(w - 1, h - r, 'top');    fil(w + 1, h - r, 'top');
            fil(w - r, h - 1, 'left');   fil(w - r, h + 1, 'left');
            fil(w + r, h - 1, 'right');  fil(w + r, h + 1, 'right');
          }
        }
      }
    }
  },
  opponentsInCross: function (range, width, cb, offset) {
    var side = this.side();
    var opponent = game.opponent(side);
    this.inCross(range, width, cb, function (spot, cs) {
      var card = $('.card.'+opponent, spot);
      if (card.length) cb(card, cs);
    }, offset);
  },
  alliesInCross: function (range, width, cb, offset) {
    var side = this.side();
    source.inCross(range, width, cb, function (spot, cs) {
      var card = $('.card.'+side, spot);
      if (card.length) cb(card, cs);
    }, offset);
  },
  inLine: function (target, range, width, cb, offset) {
    var source = this;
    var direction = source.getDirectionStr(target);
    var x = target.getX(), y = target.getY();
    var start = {}, end = {};
    if (!offset) offset = 0;
    if (direction == 'top') {
      start.x = x - width;     end.x = x + width;
      start.y = y - range + 1; end.y = y - offset;
    }
    if (direction == 'bottom') {
      start.x = x - width;     end.x = x + width;
      start.y = y + offset;    end.y = y + range - 1;
    }
    if (direction == 'left') {
      start.x = x - range + 1; end.x = x - offset;
      start.y = y - width;     end.y = y + width;
    }
    if (direction == 'right') {
      start.x = x + offset;    end.x = x + range - 1;
      start.y = y - width;     end.y = y + width;
    }
    for (var i=start.x; i<=end.x; i++) {
      for (var j=start.y; j<=end.y; j++) {
        var spot = game.map.getSpot(i,j);
        if (spot) {
          cb(spot);
        }
      }
    }
    return this;
  },
  opponentsInLine: function (target, range, width, cb, offset) {
    var side = this.side();
    var opponent = game.opponent(side);
    this.inLine(target, range, width, function (spot) {
      var card = spot.find('.card.'+opponent);
      if (card.length) cb(card);
    }, offset);
    return this;
  },
  alliesInLine: function (target, range, width, cb, offset) {
    var side = this.side();
    this.inLine(target, range, width, function (spot) {
      var card = spot.find('.card.'+side);
      if (card.length) cb(card);
    }, offset);
    return this;
  },
  inMovementRange: function (speed, cb, filter) {
    var card = this;
    var range = speed || 2;
    if (range >= 0 && range <= game.map.rangeArray.length) {
      var radius, x, y, r, r2, l, a, i, o, m, s, t, u,
        fil = function (x, y) {
          var spot = game.map.getSpot(x, y);
          if (spot) {
            if (filter) {
              if (!spot.hasClasses(filter)) { cb(spot); }
            } else { cb(spot); }
          }
        },
        pos = card.getPosition(),
        w = game.map.getX(pos),
        h = game.map.getY(pos);
      radius = game.map.rangeArray[range];
      r = Math.round(radius);
      r2 = radius * radius;
      l = Math.ceil(radius) * Math.cos(Math.PI / 4);
      fil(w, h + 1);
      fil(w, h - 1);
      fil(w - 1, h);
      fil(w + 1, h);
      if (range === 2 || range === 3) {
        for (x = 1; x <= l; x += 1) {
          y = Math.round(Math.sqrt(r2 - x * x));
          m = game.map.getSpot(w, h - y);
          s = game.map.getSpot(w - x, h);
          t = game.map.getSpot(w + x, h);
          u = game.map.getSpot(w, h + y);
          if (m) m = m.hasClass('free'); 
          if (s) s = s.hasClass('free'); 
          if (t) t = t.hasClass('free'); 
          if (u) u = u.hasClass('free'); 
          if (t || u) fil(w + x, h + y);
          if (t || m) fil(w + x, h - y);
          if (s || u) fil(w - x, h + y);
          if (s || m) fil(w - x, h - y);
        }
      }
      if (range === 3 && card.hasClass('phased')) {
        a = [{ a: w, b: h + 2 },
             { a: w, b: h - 2 },
             { a: w - 2, b: h },
             { a: w + 2, b: h }
          ];
        fil(o.a, o.b);
      } else if (range === 3 && !card.hasClass('phased')) {
        a = [{ a: w, b: h + 2, c: w, d: h + 1, e: w + 1, f: h + 1, g: w - 1, h: h + 1 },
             { a: w, b: h - 2, c: w, d: h - 1, e: w + 1, f: h - 1, g: w - 1, h: h - 1 },
             { a: w - 2, b: h, c: w - 1, d: h, e: w - 1, f: h + 1, g: w - 1, h: h - 1 },
             { a: w + 2, b: h, c: w + 1, d: h, e: w + 1, f: h + 1, g: w + 1, h: h - 1 }
          ];
        for (i = 0; i < a.length; i += 1) {
          o = a[i];
          m = game.map.getSpot(o.a, o.b);
          s = game.map.getSpot(o.c, o.d);
          if (s && s.hasClass('free') && m && m.hasClass('free')) {
            fil(o.a, o.b);
          }
        }
      }
    }
  },
  radialStroke: function (r, cl) { //console.log(r,cl)
    var spot = this, range = r, cls = 'left right top bottom';
    if ( typeof(r) == 'string' ) range = game.map.getRangeInt(r);
    var radius, x, y, r2, l,
      fil = function (x, y, border) {
        var spot = game.map.getSpot(x, y);
        if (spot) { spot.addClass(cl + ' stroke ' + border); }
      },
      w = game.map.getX(spot),
      h = game.map.getY(spot);
    if (range === 0) { return fil(w, h, 'left right top bottom'); }
    radius = game.map.rangeArray[range];
    r = Math.round(radius);
    r2 = radius * radius;
    l = Math.ceil(radius) * Math.cos(Math.PI / 4);
    if (range % 2 === 0) {
      fil(w, h + r, 'bottom');
      fil(w, h - r, 'top');
      fil(w - r, h, 'left');
      fil(w + r, h, 'right');
    } else if (range % 2 === 1) {
      fil(w, h + r, 'bottom left right');
      fil(w, h - r, 'top  left right');
      fil(w - r, h, 'left top bottom');
      fil(w + r, h, 'right top bottom');
    }
    if (range === 2 || range === 3) {
      for (x = 1; x <= l; x += 1) {
        y = 1;
        fil(w + x, h + y, 'right bottom');
        fil(w + x, h - y, 'right top');
        fil(w - x, h + y, 'left bottom');
        fil(w - x, h - y, 'left top');
      }
    } else if (range === 4 || range === 6 || range === 8) {
      for (x = 1; x <= l; x += 1) {
        y = Math.round(Math.sqrt(r2 - x * x));
        fil(w + x, h + y, 'right bottom');
        fil(w + y, h + x, 'right bottom');
        fil(w + x, h - y, 'right top');
        fil(w + y, h - x, 'right top');
        fil(w - x, h + y, 'left bottom');
        fil(w - y, h + x, 'left bottom');
        fil(w - x, h - y, 'left top');
        fil(w - y, h - x, 'left top');
      }
    } else if (range >= 5) {
      for (x = 1; x <= l; x += 1) {
        y = Math.round(Math.sqrt(r2 - x * x));
        fil(w + x, h + y, 'bottom');
        fil(w - x, h + y, 'bottom');
        fil(w + x, h - y, 'top');
        fil(w - x, h - y, 'top');
        fil(w - y, h + x, 'left');
        fil(w - y, h - x, 'left');
        fil(w + y, h - x, 'right');
        fil(w + y, h + x, 'right');
      }
    }
    if (range === 7) {
      fil(w + 3, h + 2, 'bottom');
      fil(w - 3, h + 2, 'bottom');
      fil(w + 3, h - 2, 'top');
      fil(w - 3, h - 2, 'top');
      fil(w - 2, h + 3, 'left');
      fil(w - 2, h - 3, 'left');
      fil(w + 2, h + 3, 'right');
      fil(w + 2, h - 3, 'right');
    }
  },
  crossStroke: function (range, width, cl) {
    var spot = this;
    var radius, x, y, r,
      fil = function (x, y, border) {
        var spot = game.map.getSpot(x, y);
        if (spot) { spot.addClass(cl + ' stroke ' + border); }
      },
      w = game.map.getX(spot),
      h = game.map.getY(spot);
    if (range === 0) { return fil(w, h, 'left right top bottom'); }

    fil(w, h + range, 'bottom');
    fil(w, h - range, 'top');
    fil(w - range, h, 'left');
    fil(w + range, h, 'right');

    if (width == 1) {
      fil(w + width, h + range, 'bottom'); fil(w - width, h + range, 'bottom'); 
      fil(w + width, h - range, 'top');    fil(w - width, h - range, 'top');
      fil(w - range, h + width, 'left');   fil(w - range, h - width, 'left');
      fil(w + range, h + width, 'right');  fil(w + range, h - width, 'right');
    }

    for (r = 1 + width; r <= range; r += 1) {
      fil(w - width, h + r, 'left');
      fil(w + width, h + r, 'right');
    }
    for (r = 1 + width; r <= range; r += 1) {
      fil(w - width, h - r, 'left');
      fil(w + width, h - r, 'right');
    }
    for (r = 1 + width; r <= range; r += 1) {
      fil(w + r, h - width, 'top');
      fil(w + r, h + width, 'bottom');
    }
    for (r = 1 + width; r <= range; r += 1) {
      fil(w - r, h - width, 'top');
      fil(w - r, h + width, 'bottom');
    }

  },
  linearStroke: function (range, width, cl) {
    var spot = this;
    var radius, x, y, r,
      fil = function (x, y, border) {
        var spot = game.map.getSpot(x, y);
        if (spot) { spot.addClass(cl + ' stroke ' + border); }
      },
      cw = game.map.getX(spot),
      ch = game.map.getY(spot),
      w = game.map.getX(game.skill.castsource),
      h = game.map.getY(game.skill.castsource);
    if (ch - h > 0) {
      fil(w, h + range, 'bottom');
      if (width == 1) {
        fil(w + 1, h + 1, 'top');
        fil(w - 1, h + 1, 'top');
        fil(w + 1, h + range, 'bottom');
        fil(w - 1, h + range, 'bottom');
      }
      for (r = 1; r <= range; r += 1) {
        fil(w - width, h + r, 'left');
        fil(w + width, h + r, 'right');
      }
    }
    else if (ch - h < 0) {
      fil(w, h - range, 'top');
      if (width == 1) {
        fil(w + 1, h - 1, 'bottom');
        fil(w - 1, h - 1, 'bottom');
        fil(w + 1, h - range, 'top');
        fil(w - 1, h - range, 'top');
      }
      for (r = 1; r <= range; r += 1) {
        fil(w - width, h - r, 'left');
        fil(w + width, h - r, 'right');
      }
    }
    else if (cw - w > 0) {
      fil(w + range, h, 'right');
      if (width == 1) {
        fil(w + 1, h - 1, 'left');
        fil(w + 1, h + 1, 'left');
        fil(w + range, h - 1, 'right');
        fil(w + range, h + 1, 'right');
      }
      for (r = 1; r <= range; r += 1) {
        fil(w + r, h - width, 'top');
        fil(w + r, h + width, 'bottom');
      }
    }
    else if (cw - w < 0) {
      fil(w - range, h, 'left');
      if (width == 1) {
        fil(w - 1, h - 1, 'right');
        fil(w - 1, h + 1, 'right');
        fil(w - range, h - 1, 'left');
        fil(w - range, h + 1, 'left');
      }
      for (r = 1; r <= range; r += 1) {
        fil(w - r, h - width, 'top');
        fil(w - r, h + width, 'bottom');
      }
    }
  },
  getRangeInt: function (range) {
    var r = 0;
    if (range === game.data.ui.small)  { r = 1; }
    if (range === game.data.ui.melee)  { r = 2; }
    if (range === game.data.ui.short)  { r = 3; }
    if (range === game.data.ui.ranged) { r = 4; }
    if (range === game.data.ui.long)   { r = 5; }
    if (range === game.data.ui.far)   { r = 6; }
    if (range === game.data.ui.max)   { r = 7; }
    return r;
  },
  getRangeStr: function (r) {
    var range = '';
    if (r === 1) { range = game.data.ui.small; }
    if (r === 2) { range = game.data.ui.melee; }
    if (r === 3) { range = game.data.ui.short; }
    if (r === 4) { range = game.data.ui.ranged; }
    if (r === 5) { range = game.data.ui.long; }
    if (r === 6) { range = game.data.ui.far; }
    if (r === 7) { range = game.data.ui.max; }
    return range;
  },
  clear: function () {
    game.highlight.clearMap();
    game.map.el.removeClass('night');
    $('.map .spot').removeClass('block playerarea enemyarea jungle cript').addClass('free');
  },
  cardsInRange: function (range, cb) {
    this.inRange(range, function (spot) {
      var card = spot.find('.card');
      if (card.length) cb(card);
    });
  },
  opponentsInRange: function (range, cb) {
    var side = this.side();
    var opponent = game.opponent(side);
    this.inRange(range, function (spot) {
      var card = spot.find('.card.'+opponent);
      if (card.length) cb(card);
    });
    return this;
  },
  alliesInRange: function (range, cb) {
    var side = this.side();
    this.inRange(range, function (spot) {
      var card = spot.find('.card.'+side);
      if (card.length) cb(card);
    });
    return this;
  },
  firstFreeSpotInLine: function (target, range) {
    var source = this,
        dir = source.getDirectionObj(target);
    for (var i = 1; i <= range; i += 1) {
      var x = game.map.getX(source) + (i * dir.x),
          y = game.map.getY(source) + (i * dir.y);
      var spot = game.map.getSpot(x, y);
      if (spot && spot.hasClass('free') && !spot.hasClass('block')) return spot;
    }
  },
  firstCardInLine: function (target, range) {
    var source = this,
        dir = source.getDirectionObj(target);
    for (var i = 1; i <= range; i += 1) {
      var x = game.map.getX(source) + (i * dir.x),
          y = game.map.getY(source) + (i * dir.y);
      var spot = game.map.getSpot(x, y);
      if (spot) {
        var card = spot.find('.card');
        if (card.length) return card;
      }
    }
  },
  behindTarget: function (target) {
    var source = this,
        dir = source.getDirectionObj(target);
    dir.x += target.getX(); 
    dir.y += target.getY();
    var behind = game.map.getSpot(dir.x, dir.y);
    if (behind) {
      var card = behind.children('.card');
      if (card.length) return card;
    }
  }
};
