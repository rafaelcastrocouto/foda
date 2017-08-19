game.states.campaign = {
  build: function () {
    this.map = $('<div>').addClass('campaign-map');
    this.desc = $('<div>').addClass('campaign-box box');
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
    this.stage = localStorage.getItem('stage') || game.data.campaign.start;
    if (this[this.stage.name + ' Click']) this[this.stage.name + ' Click']();
  },
  start: function () {
    this.clear();
    this.createStartPaths();
    game.message.text(game.data.ui.campaign);
    if (this[this.stage.name + ' Show']) this[this.stage.name + ' Show']();
  },
  nextStage: function () {
    if (this.stage.name == 'Stage 1') this.stage = game.data.campaign.easy;
    if (this.stage.name == 'Stage 2') this.stage = game.data.campaign.normal;
    if (this.stage.name == 'Optional Stage') this.stage = game.data.campaign.optional;
  },
  "Stage 1 Click": function () {
    $('.blink').removeClass('blink');
    game.states.campaign.startStage.addClass('blink');
    game.states.campaign.buildDesc(game.data.campaign.start);
  },
  "Stage 2 Click": function () {
    $('.blink').removeClass('blink');
    $(this).addClass('blink');
    game.states.campaign.buildDesc(game.data.campaign.easy);
  },
  "Stage 2 Show": function () {
    this.startStage.removeClass('blink').on('mouseup touchend', this["Stage 1 Click"]).addClass('done');
    $('.campaign-path').css('opacity', 1);
    $('.stages.easy').addClass('enabled blink').on('mouseup touchend', this["Stage 2 Click"]);
    this.createPath(this.et, this.nm, 'et-nm');
    this.createPath(this.em, this.nm, 'em-nm');
    this.createPath(this.eb, this.nm, 'eb-nm');
    this.createPath(this.et, this.ot, 'et-ot');
    this.createPath(this.em, this.om, 'em-om');
    this.createPath(this.eb, this.ob, 'eb-ob');
    this.buildDesc(game.data.campaign.easy);
  },
  "Stage 3 Click": function () {
    $('.blink').removeClass('blink');
    $(this).addClass('blink');
    game.states.campaign.buildDesc(game.data.campaign.normal);
  },
  "Optional Click": function () {
    $('.blink').removeClass('blink');
    $(this).addClass('blink');
    game.states.campaign.buildDesc(game.data.campaign.optional);
  },
  "Stage 3 Show": function () {
    $('.stages.easy').removeClass('blink');
    $('.campaign-path').css('opacity', 1);
    $('.stages.normal').addClass('enabled blink').on('mouseup touchend', this["Stage 3 Click"]);
    $('.stages.optional').addClass('enabled blink').on('mouseup touchend', this["Optional Click"]);
    this.createPath(this.nm, this.ro, 'nm-ro');
    this.createPath(this.nm, this.ru, 'nm-ru');
    this.createPath(this.nm, this.sh, 'nm-sh');
    this.createPath(this.nm, this.ht, 'nm-ht');
    this.createPath(this.nm, this.hm, 'nm-hm');
    this.createPath(this.nm, this.hb, 'nm-hb');
    this.buildDesc(game.data.campaign.normal);
  },
  
  buildDesc: function (data) {
    game.states.campaign.stage = data;
    this.desc.html('');
    game.ai.mode = data.ai;
    game.enemy.name = "AI "+ game.ai.mode;
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
