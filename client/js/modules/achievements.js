game.achievements = {
  build: function() {
    this.el = $('<div>').addClass('achievements').appendTo(game.container).on('mouseup tap touchend', this.clear.bind(this));
  },
  update: function(achievement) {
    var title = $('<h1>').text('★ '+achievement.title);
    var content = $('<p>').text(achievement.description);
    this.el.html('').append(title, content).addClass('slide');
    setTimeout(this.clear.bind(this), 4000);
  },
  clear: function() {
    this.el.removeClass('slide');
  }
};
