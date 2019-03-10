game.poll = {
  heroes: {
    terr: 'Terror Blade',
    wd: 'Witch Doctor'
  },
  build: function () {
    game.poll.voteBox = game.overlay.children().first().addClass('vote').html('');
    game.poll.title = $('<h2>').text(game.data.ui.votenexthero).appendTo(game.poll.voteBox);
    game.poll.voteList = $('<p>').appendTo(game.poll.voteBox);
    for (var hero in game.poll.heroes) {
      game.poll.addVote(hero, game.poll.heroes[hero]);
    }
    game.poll.voteBt = $('<div>').addClass('button highlight').appendTo(game.poll.voteBox).attr({disabled: true}).text(game.data.ui.vote).on('mouseup touchend', game.poll.vote);
    game.poll.closeBt = $('<div>').addClass('button').appendTo(game.poll.voteBox).text(game.data.ui.close).on('mouseup touchend', game.poll.close);
  },
  showVotes: function () {
    game.poll.build();
    if (!game.states.log.input.val()) game.states.log.input.focus();
    return false;
  },
  addButton: function () {
  },
  addVote: function (hero, name) {
    game.poll[hero] = $('<label>').appendTo(game.poll.voteList).append($('<img>').attr({src:'img/poll/'+hero+'.jpg'})).append($('<p>').append($('<input>').attr({type: 'radio', name: 'nexthero', value: hero})).append($('<span>').text(name))).on('mouseup touchend', game.poll.enableVote).on('touchstart', function () { $(this).click(); });
  },
  enableVote: function () {
    var label = $(this);
    if (!label.attr('disabled')) {
      $('label', game.poll.voteBox).removeClass('voted');
      label.addClass('voted');
      game.poll.voteBt.attr({disabled: false}).addClass('voteBt');
    }
    return false;
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
    return false;
  },
  voted: function (pollResults) { //console.log(poll)
    game.setData('voted', game.poll.votedHero);
    if (game.poll[game.poll.votedHero]) game.poll[game.poll.votedHero].addClass('vote-send');
    game.poll.title.text(game.data.ui.thanksvote);
    if (pollResults) {
      $.each(pollResults, function (i, v) {
        if (game.poll[i]) $('span', game.poll[i]).after($('<span>').addClass('votes').text(v));
      });
    }
  },
  close: function () {
    game.overlay.addClass('hidden');
    game.overlay.empty();
    setTimeout(function () {
      game.states.log.box.fadeIn();
    }, 200);
    return false;
  }
};