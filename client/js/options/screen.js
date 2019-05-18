game.screen = {
  width: 970,
  height: 600,
  scale: 1,
  resolutions: ['auto', 'low', 'high', 'medium', 'default'],
  resize: function (event) {
    game.offset = game.container.offset();
    var scale = 1;
    var w = document.body.offsetWidth;//window.innerWidth;
    var h = document.body.offsetHeight;//window.innerHeight;
    var bodyRatio = w/h;
    var screenRatio = game.screen.width/game.screen.height;
    if (bodyRatio > screenRatio) {
      scale = h/game.screen.height;
    } else {
      scale = w/game.screen.width;
    }
    if (bodyRatio < 0.8) scale *= 1.26;
    //console.log(bodyRatio, screenRatio, bodyRatio - screenRatio);
    scale = (scale * 0.97).toFixed(2);
    if (scale < 0.5) scale = 0.5;
    game.screen.scale = scale;
    game.container.css('transform', 'translate3d(-50%, -50%, 0) scale('+scale+')');
  },
  rememberResolution: function () {
    var res, rememberedres = game.getData('resolution');
    if (rememberedres && game.screen.resolutions.indexOf(rememberedres) > -1) res = rememberedres;
    if (res) game.screen.setResotution(res);
    else game.screen.setResotution('default');
  },
  setResotution: function (res) {
    if (window.innerWidth < 970 * game.screen.scales[res]) res = 'auto';
    $('input[name=resolution][value='+res+']').attr('checked', true);
    game.screen.changeResolution(res);
  },
  scales: {
    high: 1.5,
    medium: 1.2,
    default: 1,
    low: 0.75
  },
  changeResolution: function (resolution) {
    if (!resolution || resolution.constructor.name !== 'String') {
      resolution = $('input[name=resolution]:checked', '.screenresolution').val() || 'default';
      game.screen.resolution = resolution;
    }
    if (resolution !== 'auto') game.screen.scale = game.screen.scales[resolution];
    game.container.removeClass(game.screen.resolutions.join(' ')).addClass(resolution);
    game.setData('resolution', resolution);
  },
  toggleFS: function () {
    if (BigScreen.enabled) {
      BigScreen.toggle();
    }
    else game.options.fullscreen.attr('disabled', true);
  },
  FSEvents: function () {
    if (BigScreen.enabled) game.options.fullscreen.attr('disabled', false);
    BigScreen.onenter = function () {
      game.options.fullscreen[0].checked = true;
    };
    BigScreen.onexit = BigScreen.onerror = function() {
      game.options.fullscreen[0].checked = false;
      //$(document.body).prepend(game.container);
    };
  },
  toggleSide: function () {
    var checked = $('.screenresolution input[name=side]').prop('checked');
    $(document.body).toggleClass('left-side', checked);
    game.setData('left-side', checked);
  },
  toggleFlat: function () {
    var checked = $('.screenresolution input[name=flat]').prop('checked');
    if (game.map.el && game.map.el.toggleClass) game.map.el.toggleClass('flat', checked);
    game.setData('flat-map', checked);
  }
};
