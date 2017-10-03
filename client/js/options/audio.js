game.audio = {
  defaultVolume: 0.5,
  defaultSounds: 0.25,
  defaultMusic: 0.5,
  build: function () {
    game.audio.context = new AudioContext();
    game.audio.volumeNode = game.audio.context.createGain();
    game.audio.volumeNode.connect(game.audio.context.destination);
    game.audio.soundsNode = game.audio.context.createGain();
    game.audio.soundsNode.connect(game.audio.volumeNode);
    game.audio.musicNode = game.audio.context.createGain();
    game.audio.musicNode.connect(game.audio.volumeNode);
    game.audio.setVolume('volume', game.audio.defaultVolume);
    game.audio.setVolume('sounds', game.audio.defaultSounds);
    game.audio.setVolume('music', game.audio.defaultMusic);
    game.audio.loadMusic();
    game.audio.loadSounds();
  },
  buffers: {},
  load: function (name, cb) {
    var ajax = new XMLHttpRequest();
    ajax.open('GET', game.dynamicHost + 'audio/' + name + '.mp3', /*async*/true);
    ajax.responseType = 'arraybuffer';
    ajax.onload = function () {
      game.audio.context.decodeAudioData(ajax.response, function (buffer) {
        game.audio.buffers[name] = buffer;
        if (cb) { cb(); }
      });
    };
    ajax.send();
  },
  sounds: [
    'activate',
    'crit',
    'horn',
    'battle',
    'pick',
    'move',
    'tower/attack',
    'tutorial/axehere',
    'tutorial/axebattle',
    'tutorial/axemove',
    'tutorial/axeattack',
    'tutorial/axetime',
    'tutorial/axewait',
    'tutorial/axeah',
    'am/attack',
    'am/burn',
    'am/blink',
    'am/ult',
    'cat/attack',
    'cat/leap',
    'cat/arrow',
    'cat/star',
    'cat/ult',
    'com/attack',
    'com/aoe',
    'com/heal',
    'com/counter',
    'com/ult',
    'com/ultvictory',
    'cm/attack',
    'cm/freeze',
    'cm/slow',
    'cm/ult',
    'en/attack',
    'en/curse',
    'en/heal',
    'en/ult',
    'ld/attack',
    'ld/summon',
    'ld/roar',
    'ld/cry',
    'ld/rabid',
    'ld/bearreturn',
    'ld/transform',
    'ld/ult',
    'kotl/attack',
    'kotl/illuminate',
    'kotl/illuminaterelease',
    'kotl/leak',
    'kotl/mana',
    'kotl/recall',
    'kotl/recallend',
    'kotl/ult',
    'kotl/blind',
    'nyx/attack',
    'nyx/stun',
    'nyx/burn',
    'nyx/spike',
    'nyx/ult',
    'nyx/ultattack',
    'bear/attack',
    'bear/entangle',
    'pud/attack',
    'pud/hook',
    'pud/rot',
    'pud/ult',
    'pud/ult-channel',
    'wk/attack',
    'wk/stun',
    'wk/ult',
    'lina/attack',
    'lina/fire',
    'lina/stun',
    'lina/ult',
    'venge/attack',
    'venge/corruption',
    'venge/stun',
    'venge/ult',
    'wind/attack',
    'wind/run',
    'wind/stun',
    'wind/stunhit',
    'wind/arrow',
    'wind/ult',
    'crit'
  ],
  loadSounds: function () {
    $(game.audio.sounds).each(function (a, b) {
      game.audio.load(b);
    });
  },
  loadMusic: function () {
    game.audio.song = 'SneakyAdventure';
    game.audio.load(game.audio.song);
    game.audio.load('RandomEncounter');
  },
  loopSong: function () {
    if (!game.audio.loopingSong) {
      game.audio.loopingSong = true;
      game.audio.play(game.audio.song, 'loop', 'music');
    }
  },
  sources: [],
  play: function (name, loop, music) { //console.trace(name);
    if (game.audio.context && 
        game.audio.context.createBufferSource &&
        game.audio.buffers[name] &&
        game.audio.buffers[name].duration) {
      var audio = game.audio.context.createBufferSource();
      //console.log(name, game.audio.buffers[name]);
      audio.buffer = game.audio.buffers[name];
      if (music) {
        if (name === game.audio.song) game.audio.songSource = audio;
        audio.connect(game.audio.musicNode);
      } else {
        audio.connect(game.audio.soundsNode);
      }
      game.audio.sources[name] = audio;
      audio.loop = loop;
      audio.start();
      return audio;
    }
  },
  stopSong: function () {
    if (game.audio.songSource && game.audio.loopingSong) {
      game.audio.loopingSong = false;
      game.audio.songSource.stop();
    }
  },
  mute: function () {
    var vol = game.audio.unmutedvolume || game.audio.volumeNode.gain.value || game.audio.defaultVolume;
    if (this.checked) { vol = 0; }
    game.audio.setVolume('volume', vol);
  },
  setVolume: function (target , v) {
    if (v === undefined || v === null) {
      v = game.audio.defaultVolume;
      if (target == 'music') v = game.audio.defaultMusic;
      if (target == 'sound') v = game.audio.defaultSound;
    }
    var vol = parseFloat(v);
    if (vol <= 0) {
      vol = 0;
      if (target === 'volume') game.options.muteinput.prop('checked', true);
    } else {
      if (target === 'volume') {
        game.audio.unmutedvolume = vol;
        game.options.muteinput.prop('checked', false);
      }
    }
    if (vol > 1) { vol = 1; }
    if (game.audio[target + 'Node']) {
      //game.audio[target + 'Node'].gain.value = vol;
      game.audio[target + 'Node'].gain.setTargetAtTime(vol, game.audio.context.currentTime + 1, 0.5);
      game.options[target + 'control'].css('transform', 'scale(' + vol + ')');
      localStorage.setItem(target, vol);
    }
  },
  rememberVolume: function () {
    var volume = localStorage.getItem('volume') || game.audio.defaultVolume;
    game.audio.setVolume('volume', volume);
    var music = localStorage.getItem('music') || game.audio.defaultMusic;
    game.audio.setVolume('music', music);
    var sounds = localStorage.getItem('sounds') || game.audio.defaultSound;
    game.audio.setVolume('sounds', sounds);
  },
  volumeMouseDown: function (event) {
    var target = $(event.target).closest('.volume').attr('id');
    game.audio.volumetarget = target;
    game.audio.volumeMouseMove(event);
    game.options[target + 'input'].on('mousemove.volume', game.audio.volumeMouseMove);
  },
  volumeMouseUp: function () {
    if (game.audio.volumetarget) {
      game.options[game.audio.volumetarget + 'input'].off('mousemove.volume');
      game.audio.volumetarget = false;
    }
  },
  volumeMouseMove: function (event) {
    var w = 100 * game.screen.scale;
    //console.log(w);
    var x = event.clientX - game.options.volumecontrol.offset().left,
        v = parseInt(x / game.screen.scale, 10) / 100;
    //console.log(x, v)
    game.audio.setVolume(game.audio.volumetarget, v);
  },
  volumeControl: function (name) {
    game.options[name+'control'] = $('<div>').addClass('volumecontrol');
    game.options[name+'input'] = $('<div>').addClass('volume').attr('id', name).append(game.options[name+'control']);
    $('<label>').appendTo(game.options.audio).append($('<span>').text(game.data.ui[name])).append(game.options[name+'input']);
  }
};
