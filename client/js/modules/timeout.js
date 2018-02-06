game.timeout = function (ms, cb, arg) {
  //if (ms !== 1000 && game.debug) return cb(arg);
  if (ms === 0 || game.recovering) return cb(arg);
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