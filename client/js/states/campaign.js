game.states.campaign = {
  lane: ['m','m'],
  build: function () {
    this.map = $('<div>').addClass('campaign-map');
    this.desc = $('<div>').addClass('campaign-box box');
    this.st = $('<div>').attr('id','st').addClass('stages start blink').appendTo(this.map);
    this.et = $('<div>').attr('id','et').addClass('stages easy top').appendTo(this.map);
    this.em = $('<div>').attr('id','em').addClass('stages easy mid').appendTo(this.map);
    this.eb = $('<div>').attr('id','eb').addClass('stages easy bot').appendTo(this.map);
    this.ru = $('<div>').attr('id','ru').addClass('stages rune').appendTo(this.map);
    this.ro = $('<div>').attr('id','ro').addClass('stages roshan').appendTo(this.map);
    this.sh = $('<div>').attr('id','sh').addClass('stages shop').appendTo(this.map);
    this.nm = $('<div>').attr('id','nm').addClass('stages normal mid').appendTo(this.map);
    this.ht = $('<div>').attr('id','ht').addClass('stages hard top').appendTo(this.map);
    this.hm = $('<div>').attr('id','hm').addClass('stages hard mid').appendTo(this.map);
    this.hb = $('<div>').attr('id','hb').addClass('stages hard bot').appendTo(this.map);
    this.fi = $('<div>').attr('id','fi').addClass('stages final').appendTo(this.map);
    this.ot = $('<div>').attr('id','ot').addClass('stages optional top').appendTo(this.map);
    this.om = $('<div>').attr('id','om').addClass('stages optional mid').appendTo(this.map);
    this.ob = $('<div>').attr('id','ob').addClass('stages optional bot').appendTo(this.map);
    this.buttonbox = $('<div>').addClass('buttonbox');
    this.back = $('<div>').addClass('back button').text(game.data.ui.back).on('mouseup touchend', this.backClick).appendTo(this.buttonbox);
    this.toChoose = $('<div>').addClass('campaign-play button highlight').text(game.data.ui.battle).on('mouseup touchend', this.toChoose).appendTo(this.buttonbox);
    this.el.append(this.map).append(this.desc).append(this.buttonbox);
    this.buildDesc(game.data.campaign.start);
  },
  start: function () {
    this.clear();
    this.createStartPaths();
    game.message.text(game.data.ui.campaign);
  },
  nextStage: function () {
    switch(this.stage.name) {
      case 'Rune Stage':
        $('#ru').removeClass('blink enabled').addClass('done').off('mouseup touchend');
        this.stage = game.data.campaign.normal;
        break;
      case 'Shop Stage':
        $('#sh').removeClass('blink enabled').addClass('done').off('mouseup touchend');
        this.stage = game.data.campaign.normal;
        break;
      case 'Roshan Stage':
        $('#ro').removeClass('blink enabled').addClass('done').off('mouseup touchend');
        this.stage = game.data.campaign.normal;
        break;
      case 'Optional Stage':
        $('#o'+game.states.campaign.lane[0]).removeClass('blink enabled').addClass('done').off('mouseup touchend');
        this.stage = game.data.campaign.normal;
        break;
      case 'Stage 4':
        this.stage = game.data.campaign.last;
        break;
      case 'Stage 3':
        this.stage = game.data.campaign.hard; 
        break;
      case 'Stage 2':
        this.stage = game.data.campaign.normal; 
        break;
      default:
        this.stage = game.data.campaign.easy;
    }
    if (this[this.stage.name + ' Show']) this[this.stage.name + ' Show']();
  },
  "Stage 1 Click": function () {
    $('.campaign-path').css('opacity', 0.3);
    $('.blink').removeClass('blink');
    game.states.campaign.st.addClass('blink');
    game.states.campaign.buildDesc(game.data.campaign.start);
  },
  "Stage 2 Click": function () {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.easy);
  },
  "Stage 2 Show": function () {
    this.st.removeClass('blink').on('mouseup touchend', this["Stage 1 Click"]).addClass('done');
    $('.campaign-path').css('opacity', 0.7);
    $('.stages.easy').addClass('enabled blink').on('mouseup touchend', this["Stage 2 Click"]);
    this.createPath(this.et, this.nm, 'et-nm');
    this.createPath(this.et, this.ot, 'et-ot');
    this.createPath(this.et, this.ro, 'et-ro');
    this.createPath(this.em, this.nm, 'em-nm');
    this.createPath(this.em, this.om, 'em-om');
    this.createPath(this.em, this.sh, 'em-sh');
    this.createPath(this.eb, this.nm, 'eb-nm');
    this.createPath(this.eb, this.ob, 'eb-ob');
    this.createPath(this.eb, this.ru, 'eb-ru');
    this.buildDesc(game.data.campaign.easy);
  },
  "Stage 3 Click": function () {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.normal);
  },
  "Optional Stage Click": function () {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.optional);
  },
  "Stage 3 Show": function () {
    $('.stages.easy').removeClass('blink enabled').addClass('done').off('mouseup touchend');
    $('#e'+game.states.campaign.lane[0]).addClass('enabled').on('mouseup touchend', this["Stage 2 Click"]);
    this.nm.addClass('enabled blink').on('mouseup touchend', this["Stage 3 Click"]);
    var opt = $('#o'+game.states.campaign.lane[0]);
    opt.addClass('enabled').on('mouseup touchend', this["Optional Stage Click"]);   
    if (!opt.hasClass('done')) opt.addClass('blink');
    $('.campaign-path').css('opacity', 0.3);
    if (game.states.campaign.lane[0] == 't') {
      this.ro.addClass('enabled').on('mouseup touchend', this["Roshan Stage Click"]);
      $('.campaign-path.et-ro').css('opacity', 0.7);
      if (!this.ro.hasClass('done')) this.ro.addClass('blink');
    }
    if (game.states.campaign.lane[0] == 'm') {
      this.sh.addClass('enabled').on('mouseup touchend', this["Shop Stage Click"]);
      $('.campaign-path.em-sh').css('opacity', 0.7);
      if (!this.sh.hasClass('done')) this.sh.addClass('blink');
    }
    if (game.states.campaign.lane[0] == 'b') {
      this.ru.addClass('enabled').on('mouseup touchend', this["Rune Stage Click"]);
      $('.campaign-path.eb-ru').css('opacity', 0.7);
      if (!this.ru.hasClass('done')) this.ru.addClass('blink');
    }
    $('.campaign-path.e'+game.states.campaign.lane[0] +'-nm').css('opacity', 0.7);
    $('.campaign-path.e'+game.states.campaign.lane[0] +'-o'+game.states.campaign.lane[0]).css('opacity', 0.7);
    $('.campaign-path.st-e'+game.states.campaign.lane[0]).css('opacity',1);
    this.createPath(this.nm, this.ht, 'nm-ht');
    this.createPath(this.nm, this.hm, 'nm-hm');
    this.createPath(this.nm, this.hb, 'nm-hb');
    this.buildDesc(game.data.campaign.normal);
  },
  "Stage 4 Click": function () {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.hard);
  },
  "Roshan Stage Click": function () {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.roshan);
  },
  "Rune Stage Click": function () {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.rune);
  },
  "Shop Stage Click": function () {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.shop);
  },
  "Stage 4 Show": function () {
    $('#nm').removeClass('blink').addClass('done');
    $('.stages.hard').addClass('enabled blink').on('mouseup touchend', this["Stage 4 Click"]);
    $('.stages.optional, #ro, #ru, #sh').removeClass('blink').addClass('done');
    $('.campaign-path').css('opacity', 0.3);
    $('.campaign-path.nm-ht').css('opacity', 0.7);
    $('.campaign-path.nm-hm').css('opacity', 0.7);
    $('.campaign-path.nm-hb').css('opacity', 0.7);
    $('.campaign-path.st-e'+game.states.campaign.lane[0]).css('opacity',1);
    $('.campaign-path.e'+game.states.campaign.lane[0] +'-nm').css('opacity',1);
    this.createPath(this.nm, this.ht, 'nm-ht');
    this.createPath(this.nm, this.hm, 'nm-hm');
    this.createPath(this.nm, this.hb, 'nm-hb');
    this.buildDesc(game.data.campaign.hard);
  },
  "Last Stage Click": function () {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.last);
  },
  "Last Stage Show": function () {
    $('.stages.hard').removeClass('blink enabled').addClass('done').off('mouseup touchend');
    $('#h'+game.states.campaign.lane[1]).addClass('enabled').on('mouseup touchend', this["Stage 4 Click"]);
    $('#fi').addClass('enabled blink').on('mouseup touchend', this["Last Stage Click"]);
    $('.campaign-path').css('opacity', 0.3);
    $('.campaign-path.ht-fi').css('opacity', 0.7);
    $('.campaign-path.hm-fi').css('opacity', 0.7);
    $('.campaign-path.hb-fi').css('opacity', 0.7);
    $('.campaign-path.st-e'+game.states.campaign.lane[0]).css('opacity',1);
    $('.campaign-path.e'+game.states.campaign.lane[0] +'-nm').css('opacity',1);
    $('.campaign-path.nm-h'+game.states.campaign.lane[1]).css('opacity',1);
    this.createPath(this.ht, this.fi, 'ht-fi');
    this.createPath(this.hm, this.fi, 'hm-fi');
    this.createPath(this.hb, this.fi, 'hb-fi');
    $('.campaign-path.h'+game.states.campaign.lane[1]+'-fi').css('opacity',1);
    this.buildDesc(game.data.campaign.last);
  },
  buildDesc: function (data) {
    if (!data) data = this.stage;
    else this.stage = data;
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
    for (var i = game.enemy.picks.length-1; i > -1; i--) {
      var hero = game.enemy.picks[i];
      var portrait = $('<div>').addClass('portrait').append($('<div>').addClass('img'));
      $('<div>').addClass('heroes '+ hero).append(portrait).appendTo(ch);
    }
  },
  createStartPaths: function () {
    if (!this.pathsCreated) {
      this.pathsCreated = true;
      this.createPath(this.st, this.et, 'st-et');
      this.createPath(this.st, this.em, 'st-em');
      this.createPath(this.st, this.eb, 'st-eb');
    }
  },
  createPath: function (source, target, cl) {
    var dash = 18, size = 4;
    var s = source.position(), t = target.position();
    var sourcesize = source.width() / 2;
    s.left += (sourcesize - size);
    s.top += (sourcesize - size);
    var targetsize = target.width() / 2;
    t.left += (targetsize - size);
    t.top += (targetsize - size);
    var mx = t.left - s.left, 
        my = t.top - s.top;
    var a = Math.atan2(my, mx);
    var d = Math.pow( Math.pow(mx,2) + Math.pow(my,2) , 1/2);
    var toff = sourcesize + (dash/2);
    d -= toff + (dash/2);
    var n = Math.floor(d/dash) - 1, x, y;
    for (var i = 0; i < n; i++) {
      x = s.left + (toff * Math.cos(a)) + (i * dash * Math.cos(a));
      y = s.top + (toff * Math.sin(a)) + (i * dash * Math.sin(a));
      $('<div>').addClass('campaign-path '+cl).css({left: x, top: y}).appendTo(game.states.campaign.map);
    }
  },
  pathHighlight: function (target) {
    $('.campaign-path').css('opacity', 0.3);
    if (target.attr('id')[0] == 'e') {
      game.states.campaign.lane[0] = target.attr('id')[1];
      $('.campaign-path.st-'+target.attr('id')).css('opacity', 1);
    }
    var l = game.states.campaign.lane[0];
    if (target.attr('id')[0] == 'o') {
      $('.campaign-path.st-e'+l).css('opacity', 1);
      $('.campaign-path.e'+l+'-o'+l).css('opacity', 1);
    }
    if (target.attr('id') == 'ro') {
      $('.campaign-path.st-e'+l).css('opacity', 1);
      $('.campaign-path.e'+l+'-ro').css('opacity', 1);
    }
    if (target.attr('id') == 'sh') {
      $('.campaign-path.st-e'+l).css('opacity', 1);
      $('.campaign-path.e'+l+'-sh').css('opacity', 1);
    }
    if (target.attr('id') == 'ru') {
      $('.campaign-path.st-e'+l).css('opacity', 1);
      $('.campaign-path.e'+l+'-ru').css('opacity', 1);
    }
    if (target.attr('id') == 'nm') {
      $('.campaign-path.st-e'+l).css('opacity', 1);
      $('.campaign-path.e'+l+'-nm').css('opacity', 1);
    }
    if (target.attr('id')[0] == 'h') {
      game.states.campaign.lane[1] = target.attr('id')[1];
      $('.campaign-path.st-e'+l).css('opacity', 1);
      $('.campaign-path.e'+l+'-nm').css('opacity', 1);
      $('.campaign-path.nm-h'+target.attr('id')[1]).css('opacity', 1);
    }
    var l1 = game.states.campaign.lane[1];
    if (target.attr('id') == 'fi') {
      $('.campaign-path.st-e'+l).css('opacity', 1);
      $('.campaign-path.e'+l+'-nm').css('opacity', 1);
      $('.campaign-path.nm-h'+l1).css('opacity', 1);
      $('.campaign-path.h'+l1+'-fi').css('opacity', 1);
    }
  },
  clearPaths: function () {
    $('.campaign-path', game.states.campaign.map).hide();
  },
  toChoose: function () {
    if (game.states.campaign.stage.name == 'Stage 1') {
      game.states.changeTo('choose');
    } else {
      game.states.changeTo('vs');
    }
  },
  backClick: function () {
    game.clear();
    game.states.changeTo('menu');
  },
  clear: function () {
    $('.stage', game.states.campaign.el).removeClass('enabled');
    this.st.addClass('enabled');
  },
  end: function () {
  }
};
