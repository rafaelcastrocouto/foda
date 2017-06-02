game.poll = {
  addButton: function () {
    var sweet = $('.sweet-confirm');
    game.poll.showBt = sweet.clone().addClass('vote').text(game.data.ui.votenexthero).on('mouseup touchend', game.poll.build);
    sweet.before(game.poll.showBt);
  },
  build: function () {
    var sweet = $('.sweet-alert');
    game.poll.voteBox = sweet.clone().addClass('vote').html('');
    game.poll.title = $('<h2>').text(game.data.ui.votenexthero).appendTo(game.poll.voteBox);
    var p = $('<p>').appendTo(game.poll.voteBox);
    //game.poll.lina = $('<label>').appendTo(p).append($('<img>').attr({src:'img/poll/lina.jpg'})).append($('<p>').append($('<input>').attr({type: 'radio', name: 'nexthero', value: 'lina'})).append($('<span>').text('Lina'))).on('mouseup touchend', game.poll.enableVote);
    game.poll.mirana = $('<label>').appendTo(p).append($('<img>').attr({src:'img/poll/mirana.jpg'})).append($('<p>').append($('<input>').attr({type: 'radio', name: 'nexthero', value: 'mirana'})).append($('<span>').text('Mirana'))).on('mouseup touchend', game.poll.enableVote);
    game.poll.wind = $('<label>').appendTo(p).append($('<img>').attr({src:'img/poll/wind.jpg'})).append($('<p>').append($('<input>').attr({type: 'radio', name: 'nexthero', value: 'wind'})).append($('<span>').text('Wind'))).on('mouseup touchend', game.poll.enableVote);
    game.poll.voteBt = $('<div>').addClass('button voteBt').appendTo(game.poll.voteBox).attr({title: game.data.ui.vote, disabled: true}).text(game.data.ui.vote).on('mouseup touchend', game.poll.vote);
    game.poll.closeBt = $('<div>').addClass('button sweet-confirm').appendTo(game.poll.voteBox).attr({title: game.data.ui.close}).text(game.data.ui.close).on('mouseup touchend', game.poll.close);
    sweet.hide();
    sweet.after(game.poll.voteBox);
  },
  enableVote: function () {
    var label = $(this);
    if (!label.attr('disabled')) {
      $('label', game.poll.voteBox).removeClass('vote');
      label.addClass('vote');
      game.poll.voteBt.attr({disabled: false}).addClass('.vote');
    } 
  },
  vote: function () {
    var label = $(this);
    if (!game.poll.voteBt.attr('disabled')) {
      $('label, input', game.poll.voteBox).attr('disabled', true);
      game.poll.voteBt.attr('disabled', true);
      var inputEl = $('input[name=nexthero]:checked', '.vote');
      game.poll.votedHero =  inputEl.val();
      game.db({
        'set': 'poll',
        'data': game.poll.votedHero
      }, game.poll.voted);
    }
  },
  voted: function (poll) {
    localStorage.setItem('voted', game.poll.votedHero);
    game.poll[game.poll.votedHero].addClass('voted');
    game.poll.title.text(game.data.ui.thanksvote);
    if (poll.lina) {
      $('span', game.poll.lina).after($('<span>').addClass('votes').text(poll.lina));
      $('span', game.poll.mirana).after($('<span>').addClass('votes').text(poll.mirana));
      $('span', game.poll.wind).after($('<span>').addClass('votes').text(poll.wind));
    }
  },
  clear: function () {
    if (game.poll.showBt) game.poll.showBt.remove();
    if (game.poll.voteBox) game.poll.voteBox.remove();
  },
  close: function () {
    $('.sweet-confirm').click();
  }
};