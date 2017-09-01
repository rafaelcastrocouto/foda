game.fx = {
  addGif: function (name, target, time) {
    var img = $('<img>').attr({src: '/img/fx/'+name+'.gif'}).addClass(name + ' fx').appendTo(target);
    setTimeout(img.remove.bind(img), time);
  }
};