game.heroesAI.wk = {
  move: {
    default: 'offensive'
  },
  action: {
    default: 'attack'
  },
  play: function (wk) {
    // keep stun to combo
    // dont stun under enemy tower
  },
  defend: function (wk) {
    //console.log('defend-from-wk');
    //dont focus if ult buff
  }
};