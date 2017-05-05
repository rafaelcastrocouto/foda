game.timeout = function (ms, cb, arg) {
  var t = setTimeout(function (arg) {
      cb(arg);
      game.timeoutArray.erase(t);
  }, ms, arg);
  game.timeoutArray.push(t);
  return t;
};

game.clearTimeouts = function () {
  for (var i=0; i < game.timeoutArray.length; i++) {
    clearTimeout(game.timeoutArray[i]);
  }
  game.timeoutArray = [];
};