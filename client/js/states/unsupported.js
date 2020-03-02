game.states.unsupported = {
  build: function () {
    this.box = $('<div>').addClass('box');
    this.logo = $('<div>').appendTo(this.box).addClass('logo slide');
    //this.title = $('<img>').appendTo(this.logo).attr({alt: 'DOTA', src: 'https://raw.githubusercontent.com/rafaelcastrocouto/dotacard/artwork/img/title.png'}).addClass('h1');
    //this.subtitle = $('<img>').appendTo(this.logo).attr({alt: 'CARD', src: 'https://raw.githubusercontent.com/rafaelcastrocouto/dotacard/artwork/img/subtitle.png'}).addClass('h2');
    this.h2 = $('<h1>').appendTo(this.box).html('DotaCard requires a <i>modern browser</i>');
    this.p = $('<p>').appendTo(this.box).html('<a href="http://whatbrowser.org/" rel="nofollow noopener">How can I get a <i>modern browser</i>?</a>');
    this.el.append(this.box);
  }
};