game.states.campaign = {
  build: function () {
    this.stage = localStorage.getItem('stage') || 1;
    this.map = $('<div>').addClass('campaign-map');
    this.desc = $('<div>').addClass('campaign-box box');
    game.states.loading.json('campaign', this.stageOne);
    this.startStage = $('<div>').addClass('stages start enabled blink').appendTo(this.map);
    this.et = $('<div>').addClass('stages easy top').appendTo(this.map);
    this.em = $('<div>').addClass('stages easy mid').appendTo(this.map);
    this.eb = $('<div>').addClass('stages easy bot').appendTo(this.map);
    this.ru = $('<div>').addClass('stages rune').appendTo(this.map);
    this.ro = $('<div>').addClass('stages roshan').appendTo(this.map);
    this.sh = $('<div>').addClass('stages shop').appendTo(this.map);
    this.nm = $('<div>').addClass('stages normal mid').appendTo(this.map);
    this.ht = $('<div>').addClass('stages hard top').appendTo(this.map);
    this.hm = $('<div>').addClass('stages hard mid').appendTo(this.map);
    this.hb = $('<div>').addClass('stages hard bot').appendTo(this.map);
    this.fi = $('<div>').addClass('stages final').appendTo(this.map);
    this.ot = $('<div>').addClass('stages optional top').appendTo(this.map);
    this.om = $('<div>').addClass('stages optional mid').appendTo(this.map);
    this.ob = $('<div>').addClass('stages optional bot').appendTo(this.map);
    this.buttonbox = $('<div>').addClass('buttonbox');
    this.back = $('<div>').addClass('back button').text(game.data.ui.back).on('mouseup touchend', this.backClick).appendTo(this.buttonbox);
    this.toChoose = $('<div>').addClass('campaign-play button highlight').text(game.data.ui.battle).on('mouseup touchend', this.toChoose).appendTo(this.buttonbox);
    this.el.append(this.map).append(this.desc).append(this.buttonbox);
  },
  start: function (recover) {
    this.clear();
    this.createStartPaths();
    game.message.text(game.data.ui.campaign);
    if (recover && game.mode == 'online') {
      game.states.changeTo('log');
    } else {
      if (this.stage == 2) this.stageTwoShow();
    }
  },
  stageOne: function () {
    $('.blink').removeClass('blink');
    game.states.campaign.startStage.addClass('blink');
    game.states.campaign.stage = 1;
    game.states.campaign.buildDesc(game.data.campaign.start);
  },
  stageTwo: function () {
    $('.blink').removeClass('blink');
    $(this).addClass('blink');
    game.states.campaign.stage = 2;
    game.states.campaign.buildDesc(game.data.campaign.easy);
  },
  stageTwoShow: function () {
    this.startStage.removeClass('blink').on('mouseup touchend', this.stageOne).addClass('done');
    $('.campaign-path').css('opacity', 1);
    $('.stages.easy').addClass('enabled blink').on('mouseup touchend', this.stageTwo);
    this.createPath(this.et, this.nm, 'et-ru');
    this.createPath(this.em, this.nm, 'em-ru');
    this.createPath(this.eb, this.nm, 'eb-ru');
    this.createPath(this.et, this.ot, 'et-ru');
    this.createPath(this.em, this.om, 'em-ru');
    this.createPath(this.eb, this.ob, 'eb-ru');
    this.buildDesc(game.data.campaign.easy);
  },
  buildDesc: function (data) {
    this.desc.html('');
    game.ai.mode = data.ai;
    $('<h2>').text(data.name).appendTo(this.desc);
    $('<div>').addClass('campaign-img '+data.img).appendTo(this.desc);
    $('<p>').text(data.title).appendTo(this.desc);
    $(data.desc).each(function (i, txt) {
      $('<p>').addClass('achieve').text(txt).appendTo(game.states.campaign.desc);
    });
    var ch = $('<div>').addClass('campaign-heroes').appendTo(this.desc);
    game.enemy.picks = data.picks;
    localStorage.setItem('enemydeck', data.picks);
    game.enemy.picks = data.picks;
    for (var i = 0; i < game.enemy.picks.length; i++) {
      var hero = game.enemy.picks[i];
      $('<div>').addClass('heroes '+ hero).attr({title: hero}).append($('<div>').addClass('img')).appendTo(ch);
    }
  },
  createStartPaths: function () {
    if (!this.pathsCreated) {
      this.pathsCreated = true;
      this.createPath(this.startStage, this.et, 'et');
      this.createPath(this.startStage, this.em, 'em');
      this.createPath(this.startStage, this.eb, 'eb');
    }
  },
  createPath: function (source, target, cl) {
    var dash = 18, size = 4;
    var s = source.position(), t = target.position();
    var sourcesize = source.width() / 2;
    s.left += (sourcesize - size);
    s.top += (sourcesize - size) * 1.2;
    var targetsize = target.width() / 2;
    t.left += (targetsize - size);
    t.top += (targetsize - size) * 1.2;
    var mx = t.left - s.left, 
        my = t.top - s.top;
    var a = Math.atan2(my, mx);
    var d = Math.pow( Math.pow(mx,2) + Math.pow(my,2) , 1/2);
    var toff = sourcesize + dash;
    d -= toff;
    var n = Math.floor(d/dash) - 1, x, y;
    for (var i = 0; i < n; i++) {
      x = s.left + (toff * Math.cos(a)) + (i * dash * Math.cos(a));
      y = s.top + (toff * Math.sin(a)) + (i * dash * Math.sin(a));
      $('<div>').addClass('campaign-path '+cl).css({left: x, top: y}).appendTo(game.states.campaign.map);
    }
  },
  clearPaths: function () {
    $('.campaign-path', game.states.campaign.map).hide();
  },
  toChoose: function () {
    if (game.states.campaign.stage == 1) {
      game.ai.mode = 'very-easy';
      game.enemy.name = 'Stage 1';
    }
    if (game.states.campaign.stage == 2) {
      game.ai.mode = 'hard';
      game.enemy.name = 'Stage 2';
      game.alert('More stages coming soon! Visit our discord server to leave your feedback');
    }
    game.states.changeTo('choose');
  },
  backClick: function () {
    game.clear();
    game.states.changeTo('menu');
  },
  clear: function () {
    $('.stage', game.states.campaign.el).removeClass('enabled');
    this.startStage.addClass('enabled');
  },
  end: function () {
  }
};
