game.states.campaign = {
  lane: ['m', 'm'],
  build: function() {
    for (var stage in game.data.campaign) {
      game.data.campaign[stage].id = stage;
    }
    this.map = $('<div>').addClass('campaign-map');
    this.desc = $('<div>').addClass('campaign-box box');
    this.buttonbox = $('<div>').addClass('buttonbox');
    this.back = $('<div>').addClass('back button').text(game.data.ui.back).on('mouseup touchend', this.backClick).appendTo(this.buttonbox);
    this.toChoose = $('<div>').addClass('campaign-play button highlight').text(game.data.ui.battle).on('mouseup touchend', this.toChoose).appendTo(this.buttonbox);
    this.el.append(this.map).append(this.desc).append(this.buttonbox);
    this.buildDesc(game.data.campaign.start);
    this.buildStages();
    this.buildPaths();
  },
  buildStages: function() {
    this.st = $('<div>').attr('id','st').data('id','start').addClass('stages start blink').appendTo(this.map);
    this.et = $('<div>').attr('id','et').data('id','easy').addClass('stages easy top').appendTo(this.map);
    this.em = $('<div>').attr('id','em').data('id','easy').addClass('stages easy mid').appendTo(this.map);
    this.eb = $('<div>').attr('id','eb').data('id','easy').addClass('stages easy bot').appendTo(this.map);
    this.ru = $('<div>').attr('id','ru').data('id','rune').addClass('stages rune').appendTo(this.map);
    this.ro = $('<div>').attr('id','ro').data('id','roshan').addClass('stages roshan').appendTo(this.map);
    this.sh = $('<div>').attr('id','sh').data('id','shop').addClass('stages shop').appendTo(this.map);
    this.nm = $('<div>').attr('id','nm').data('id','normal').addClass('stages normal mid').appendTo(this.map);
    this.ht = $('<div>').attr('id','ht').data('id','hard').addClass('stages hard top').appendTo(this.map);
    this.hm = $('<div>').attr('id','hm').data('id','hard').addClass('stages hard mid').appendTo(this.map);
    this.hb = $('<div>').attr('id','hb').data('id','hard').addClass('stages hard bot').appendTo(this.map);
    this.fi = $('<div>').attr('id','fi').data('id','last').addClass('stages last').appendTo(this.map);
    this.ot = $('<div>').attr('id','ot').data('id','optional').addClass('stages optional top').appendTo(this.map);
    this.om = $('<div>').attr('id','om').data('id','optional').addClass('stages optional mid').appendTo(this.map);
    this.ob = $('<div>').attr('id','ob').data('id','optional').addClass('stages optional bot').appendTo(this.map);
  },
  buildPaths: function() {
    this.el.css({
      display: 'block',
      visibility: 'hidden'
    });
    this.createPath(this.st, this.et, 'st-et', true);
    this.createPath(this.st, this.em, 'st-em', true);
    this.createPath(this.st, this.eb, 'st-eb', true);
    this.createPath(this.et, this.nm, 'et-nm');
    this.createPath(this.et, this.ot, 'et-ot');
    this.createPath(this.et, this.ro, 'et-ro');
    this.createPath(this.em, this.nm, 'em-nm');
    this.createPath(this.em, this.om, 'em-om');
    this.createPath(this.em, this.sh, 'em-sh');
    this.createPath(this.eb, this.nm, 'eb-nm');
    this.createPath(this.eb, this.ob, 'eb-ob');
    this.createPath(this.eb, this.ru, 'eb-ru');
    this.createPath(this.nm, this.ht, 'nm-ht');
    this.createPath(this.nm, this.hm, 'nm-hm');
    this.createPath(this.nm, this.hb, 'nm-hb');
    this.createPath(this.ht, this.fi, 'ht-fi');
    this.createPath(this.hm, this.fi, 'hm-fi');
    this.createPath(this.hb, this.fi, 'hb-fi');
    this.el.css({
      display: 'none',
      visibility: ''
    });
  },
  start: function() {
    this.clear();
    if (!game.mode) {
      game.setMode('single');
    }
    game.message.text(game.data.ui.campaign);
    if (game.nextStage) {
      game.states.campaign.nextStage();
      game.nextStage = false;
    }
  },
  nextStage: function() {
    switch (this.stage.id) {
    case 'last':
      game.overlay.alert('Congratulation, you beat our Campaign! Thanks a lot for participating in our beta test!');
      this.done = true;
      game.setData('campaignDone', true);
      this.enableAllStages();
      break;
    case 'hard':
      this.stage = game.data.campaign.last;
      break;
    case 'rune':
      if (!this.done) $('#ru').removeClass('blink enabled').addClass('done').off('mouseup touchend');
      this.stage = game.data.campaign.normal;
      break;
    case 'shop':
      if (!this.done) $('#sh').removeClass('blink enabled').addClass('done').off('mouseup touchend');
      this.stage = game.data.campaign.normal;
      break;
    case 'roshan':
      if (!this.done) $('#ro').removeClass('blink enabled').addClass('done').off('mouseup touchend');
      this.stage = game.data.campaign.normal;
      break;
    case 'optional':
      if (!this.done) $('#o' + game.states.campaign.lane[0]).removeClass('blink enabled').addClass('done').off('mouseup touchend');
      this.stage = game.data.campaign.normal;
      break;
    case 'normal':
      this.stage = game.data.campaign.hard;
      break;
    case 'easy':
      this.stage = game.data.campaign.normal;
      break;
    default: //start 
      this.stage = game.data.campaign.easy;
    }
    game.setData('stage', this.stage.id);
    game.setData('lane', this.lane);
    if (this[this.stage.id + 'Show'] && !this.done)
      this[this.stage.id + 'Show']();
  },
  startClick: function() {
    $('.campaign-path').css('opacity', 0.2);
    $('.blink').removeClass('blink');
    game.states.campaign.st.addClass('blink');
    game.states.campaign.buildDesc(game.data.campaign.start);
  },
  easyClick: function() {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.easy);
  },
  easyShow: function() {
    this.st.removeClass('blink').on('mouseup touchend', this.startClick).addClass('done');
    $('.campaign-path').css('opacity', 0.2);
    $('.stages.easy').addClass('enabled blink').on('mouseup touchend', this.easyClick);
    $('.campaign-path.et-nm').removeClass('hidden');
    $('.campaign-path.et-ot').removeClass('hidden');
    $('.campaign-path.et-ro').removeClass('hidden');
    $('.campaign-path.em-nm').removeClass('hidden');
    $('.campaign-path.em-om').removeClass('hidden');
    $('.campaign-path.em-sh').removeClass('hidden');
    $('.campaign-path.eb-nm').removeClass('hidden');
    $('.campaign-path.eb-ob').removeClass('hidden');
    $('.campaign-path.eb-ru').removeClass('hidden');
    $('.campaign-path.st-et').css('opacity', 0.6);
    $('.campaign-path.st-em').css('opacity', 0.6);
    $('.campaign-path.st-eb').css('opacity', 0.6);
    $('.campaign-path.st-e' + game.states.campaign.lane[0]).css('opacity', 1);
    this.buildDesc(game.data.campaign.easy);
  },
  normalClick: function() {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.normal);
  },
  optionalClick: function() {
    var target = $(this);
    game.states.campaign.lane[0] = 'm';
    if (target.hasClass('top')) game.states.campaign.lane[0] = 't';
    if (target.hasClass('bot')) game.states.campaign.lane[0] = 'b';
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.optional);
  },
  normalShow: function() {
    $('.stages.easy').removeClass('blink enabled').addClass('done').off('mouseup touchend');
    $('#e' + game.states.campaign.lane[0]).addClass('enabled').on('mouseup touchend', this.easyClick);
    this.nm.addClass('enabled blink').on('mouseup touchend', this.normalClick);
    var opt = $('#o' + game.states.campaign.lane[0]);
    opt.addClass('enabled').on('mouseup touchend', this.optionalClick);
    if (!opt.hasClass('done'))
      opt.addClass('blink');
    $('.campaign-path').css('opacity', 0.2);
    $('.campaign-path.nm-ht').removeClass('hidden');
    $('.campaign-path.nm-hm').removeClass('hidden');
    $('.campaign-path.nm-hb').removeClass('hidden');
    if (game.states.campaign.lane[0] == 't') {
      this.ro.addClass('enabled').on('mouseup touchend', this.roshanClick);
      $('.campaign-path.et-ro').css('opacity', 0.6);
      if (!this.ro.hasClass('done'))
        this.ro.addClass('blink');
    }
    if (game.states.campaign.lane[0] == 'm') {
      this.sh.addClass('enabled').on('mouseup touchend', this.shopClick);
      $('.campaign-path.em-sh').css('opacity', 0.6);
      if (!this.sh.hasClass('done'))
        this.sh.addClass('blink');
    }
    if (game.states.campaign.lane[0] == 'b') {
      this.ru.addClass('enabled').on('mouseup touchend', this.runeClick);
      $('.campaign-path.eb-ru').css('opacity', 0.6);
      if (!this.ru.hasClass('done'))
        this.ru.addClass('blink');
    }
    $('.campaign-path.e' + game.states.campaign.lane[0] + '-nm').css('opacity', 0.6);
    $('.campaign-path.e' + game.states.campaign.lane[0] + '-o' + game.states.campaign.lane[0]).css('opacity', 0.6);
    $('.campaign-path.st-e' + game.states.campaign.lane[0]).css('opacity', 1);
    this.buildDesc(game.data.campaign.normal);
  },
  hardClick: function() {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.hard);
  },
  roshanClick: function() {
    var target = $(this);
    game.states.campaign.lane[0] = 't';
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.roshan);
  },
  runeClick: function() {
    var target = $(this);
    game.states.campaign.lane[0] = 'b';
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.rune);
  },
  shopClick: function() {
    var target = $(this);
    game.states.campaign.lane[0] = 'm';
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.shop);
  },
  hardShow: function() {
    $('#nm').removeClass('blink').addClass('done');
    $('.stages.hard').addClass('enabled blink').on('mouseup touchend', this.hardClick);
    $('.stages.optional, #ro, #ru, #sh').removeClass('blink').addClass('done');
    $('.campaign-path').css('opacity', 0.2);
    $('.campaign-path.ht-fi').removeClass('hidden');
    $('.campaign-path.hm-fi').removeClass('hidden');
    $('.campaign-path.hb-fi').removeClass('hidden');
    $('.campaign-path.nm-ht').css('opacity', 0.6);
    $('.campaign-path.nm-hm').css('opacity', 0.6);
    $('.campaign-path.nm-hb').css('opacity', 0.6);
    $('.campaign-path.st-e' + game.states.campaign.lane[0]).css('opacity', 1);
    $('.campaign-path.e' + game.states.campaign.lane[0] + '-nm').css('opacity', 1);
    this.buildDesc(game.data.campaign.hard);
  },
  lastClick: function() {
    var target = $(this);
    $('.blink').removeClass('blink');
    target.addClass('blink');
    game.states.campaign.pathHighlight(target);
    game.states.campaign.buildDesc(game.data.campaign.last);
  },
  lastShow: function() {
    $('.stages.hard').removeClass('blink enabled').addClass('done').off('mouseup touchend');
    $('#h' + game.states.campaign.lane[1]).addClass('enabled').on('mouseup touchend', this.hardClick);
    $('#fi').addClass('enabled blink').on('mouseup touchend', this.lastClick);
    $('.campaign-path').css('opacity', 0.2);
    $('.campaign-path.st-e' + game.states.campaign.lane[0]).css('opacity', 1);
    $('.campaign-path.e' + game.states.campaign.lane[0] + '-nm').css('opacity', 1);
    $('.campaign-path.nm-h' + game.states.campaign.lane[1]).css('opacity', 1);
    $('.campaign-path.h' + game.states.campaign.lane[1] + '-fi').css('opacity', 1);
    this.buildDesc(game.data.campaign.last);
  },
  enableAllStages: function() {
    game.states.campaign.stage = game.data.campaign.start;
    $('.stages').removeClass('done');
    $('.campaign-path').removeClass('hidden').css('opacity', 1);
    $('.stages').addClass('enabled blink').each(function () {
      var stage = $(this);
      stage.on('mouseup touchend', game.states.campaign[stage.data('id')+'Click']);
    });
    $('.stages.start').removeClass('blink');
    this.buildDesc(game.data.campaign.start);
  },
  buildDesc: function(data) {
    if (!data)
      data = this.stage;
    else
      this.stage = data;
    this.desc.html('');
    game.ai.mode = data.ai;
    game.enemy.name = "AI " + game.ai.mode;
    $('<h2>').text(data.name).appendTo(this.desc);
    $('<div>').addClass('campaign-img ' + data.img).appendTo(this.desc);
    $('<p>').text(data.title).appendTo(this.desc);
    $(data.achievements).each(function(i, achievement) {
      $('<p>').addClass('achieve').text(achievement.name + ' - ' + achievement.description).appendTo(game.states.campaign.desc);
    });
    var ch = $('<div>').addClass('campaign-heroes').appendTo(this.desc);
    game.single.enemypicks = data.picks;
    for (var i = game.single.enemypicks.length - 1; i > -1; i--) {
      var hero = game.single.enemypicks[i];
      var portrait = $('<div>').addClass('portrait').append($('<div>').addClass('img'));
      $('<div>').addClass('heroes ' + hero).append(portrait).appendTo(ch);
    }
  },
  createPath: function(source, target, cl, show) {
    var scale = Number(game.screen.scale);
    if (!scale) scale = 1;
    var dash = 18;
    var dotsize = 4;
    var s = source.position();
    var t = target.position();
    var sourcesize = (source.width() / scale) / 2;
    s.left /= scale;
    s.top /= scale;
    t.left /= scale;
    t.top /= scale;
    s.left += (sourcesize - dotsize);
    s.top += (sourcesize - dotsize);
    var targetsize = (target.width() / scale) / 2;
    t.left += (targetsize - dotsize);
    t.top += (targetsize - dotsize);
    var mx = t.left - s.left;
    var my = t.top - s.top;
    var a = Math.atan2(my, mx);
    var d = Math.pow(Math.pow(mx, 2) + Math.pow(my, 2), 1 / 2);
    var toff = sourcesize + (dash / 2);
    d -= toff + (dash / 2);
    var n = Math.floor(d / dash) - 1, x, y;
    for (var i = 0; i < n; i++) {
      x = s.left + (toff * Math.cos(a)) + (i * dash * Math.cos(a));
      y = s.top + (toff * Math.sin(a)) + (i * dash * Math.sin(a));
      cl = 'campaign-path ' + cl;
      if (!show)
        cl += ' hidden';
      $('<div>').addClass(cl).css({
        left: x,
        top: y
      }).appendTo(game.states.campaign.map);
    }
  },
  pathHighlight: function(target) {
    $('.campaign-path').css('opacity', 0.2);
    if (target.attr('id')[0] == 'e') {
      game.states.campaign.lane[0] = target.attr('id')[1];
      $('.campaign-path.st-' + target.attr('id')).css('opacity', 1);
    }
    var l = game.states.campaign.lane[0];
    if (target.attr('id')[0] == 'o') {
      $('.campaign-path.st-e' + l).css('opacity', 1);
      $('.campaign-path.e' + l + '-o' + l).css('opacity', 1);
    }
    if (target.attr('id') == 'ro') {
      $('.campaign-path.st-e' + l).css('opacity', 1);
      $('.campaign-path.e' + l + '-ro').css('opacity', 1);
    }
    if (target.attr('id') == 'sh') {
      $('.campaign-path.st-e' + l).css('opacity', 1);
      $('.campaign-path.e' + l + '-sh').css('opacity', 1);
    }
    if (target.attr('id') == 'ru') {
      $('.campaign-path.st-e' + l).css('opacity', 1);
      $('.campaign-path.e' + l + '-ru').css('opacity', 1);
    }
    if (target.attr('id') == 'nm') {
      $('.campaign-path.st-e' + l).css('opacity', 1);
      $('.campaign-path.e' + l + '-nm').css('opacity', 1);
    }
    if (target.attr('id')[0] == 'h') {
      game.states.campaign.lane[1] = target.attr('id')[1];
      $('.campaign-path.st-e' + l).css('opacity', 1);
      $('.campaign-path.e' + l + '-nm').css('opacity', 1);
      $('.campaign-path.nm-h' + target.attr('id')[1]).css('opacity', 1);
    }
    var l1 = game.states.campaign.lane[1];
    if (target.attr('id') == 'fi') {
      $('.campaign-path.st-e' + l).css('opacity', 1);
      $('.campaign-path.e' + l + '-nm').css('opacity', 1);
      $('.campaign-path.nm-h' + l1).css('opacity', 1);
      $('.campaign-path.h' + l1 + '-fi').css('opacity', 1);
    }
    game.setData('lane', game.states.campaign.lane);
  },
  clearPaths: function() {
    $('.campaign-path', game.states.campaign.map).hide();
  },
  toChoose: function() {
    if (game.states.campaign.stage.name == 'Stage 1') {
      game.states.changeTo('choose');
    } else {
      game.states.changeTo('vs');
    }
  },
  backClick: function() {
    game.clear();
    game.states.changeTo('menu');
  },
  clear: function() {
    $('.stage', game.states.campaign.el).removeClass('enabled');
    this.st.addClass('enabled');
  },
  end: function() {}
};
