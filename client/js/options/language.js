game.language = {
  current: 'en-US',
  available: ['en-US', 'pt-BR', 'es', 'tr-TR', 'ru'],
  names: ['English US', 'Português BR', 'Español ES', 'Türk TR', 'Pусский RU'],
  dir: '',
  load: function (cb) {
    var lang = game.getData('lang');
    if (lang) {
      game.language.set(lang);
      if (cb) { cb(); }
    } else game.db({ 'get': 'lang' }, function (data) {
      if (data.lang) {
        var language = data.lang.split(';')[0].split(',')[0],
            detectLanguage = game.language.available.indexOf(language);
        if (detectLanguage > 0) {
          var lang = game.language.available[detectLanguage];
          game.language.set(lang);
        }
      }
      if (cb) { cb(); }
    });
  },
  set: function (lang) {
    var detectLanguage = game.language.available.indexOf(lang);
    if (detectLanguage > 0) {
      game.language.current = lang;
      game.language.dir = lang + '/';
      game.setData('lang', lang);
    }
  },
  select: function () {
    var s = $('<select>').on('change', game.language.click);
    $(game.language.available).each(function (i, lang) {
      $('<option>').val(lang).text(game.language.names[i]).appendTo(s).attr('selected', lang == game.getData('lang'));
    });
    return s;
  },
  click: function () {
    var lang = $(this).val();
        detectLanguage = game.language.available.indexOf(lang);
    if (detectLanguage >= 0) game.setData('lang', lang);
    game.options.backClick();
    game.confirm(function (confirmed) { if (confirmed) location.reload(); });
  }
};