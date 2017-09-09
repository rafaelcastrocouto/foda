game.utils = function () {
  if (!Number.prototype.map) { Number.prototype.map = function (a, b, c, d) { return c + (d - c) * ((this - a) / (b - a)); }; }
  if (!Number.prototype.limit) { Number.prototype.limit = function (a, b) { return Math.min(b, Math.max(a, this)); }; }
  if (!Number.prototype.round) { Number.prototype.round = function (a) { return Math.round(this); }; }
  if (!Number.prototype.floor) { Number.prototype.floor = function () { return Math.floor(this); }; }
  if (!Number.prototype.ceil) { Number.prototype.ceil = function () { return Math.ceil(this); }; }
  if (!Number.prototype.toRad) { Number.prototype.toRad = function () { return this / 180 * Math.PI; }; }
  if (!Number.prototype.toDeg) { Number.prototype.toDeg = function () { return 180 * this / Math.PI; }; }
  if (!Array.prototype.random) { Array.prototype.random = function () { return this[Math.floor(Math.random() * this.length)]; }; }
  if (!Array.prototype.smartRandom) { Array.prototype.smartRandom = function (n) { return this[Math.floor(Math.pow(Math.random(),n) * this.length)]; }; }
  if (!Array.prototype.shuffle) { Array.prototype.shuffle = function () {
      //Fisher-Yates (aka Knuth) Shuffle
      if (this.length) {
        var currentIndex = this.length, temporaryValue, randomIndex;
        while (currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = this[currentIndex];
          this[currentIndex] = this[randomIndex];
          this[randomIndex] = temporaryValue;
        }
        //jQuery.extend(Array.prototype, this);
      }
      return this;
    };
  }
  if (!Array.prototype.indexOf) { Array.prototype.indexOf = function(searchElement, fromIndex) {
      var k;
      if (this === null) { throw new TypeError('"this" is null or not defined'); }
      var o = Object(this);
      var len = o.length >>> 0;
      if (len === 0) { return -1; }
      var n = +fromIndex || 0;
      if (Math.abs(n) === Infinity) { n = 0; }
      if (n >= len) { return -1; }
      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      while (k < len) { if (k in o && o[k] === searchElement) { return k; } k++; }
      return -1;
    };
  }
  if (!Array.prototype.erase) {
    Array.prototype.erase = function (a) {
      var b;
      for (b = this.length - 1; b > -1; b -= 1) {
        if (this[b] === a) {
          this.splice(b, 1);
        }
      }
      return this;
    };
  }
  if (!Function.prototype.bind) {
    Function.prototype.bind = Function.prototype.bind || function (a) {
      var b = this;
      return function () {
        var c = Array.prototype.slice.call(arguments);
        return b.apply(a || null, c);
      };
    };
  }
  $.fn.hasClasses = function (list) {
    var classes = list.split(' '), i;
    for (i = 0; i < classes.length; i += 1) {
      if (this.hasClass(classes[i])) {
        return true;
      }
    }
    return false;
  };
  $.fn.hasAllClasses = function (list) {
    var classes = list.split(' '), i;
    for (i = 0; i < classes.length; i += 1) {
      if (!this.hasClass(classes[i])) {
        return false;
      }
    }
    return true;
  };
};
