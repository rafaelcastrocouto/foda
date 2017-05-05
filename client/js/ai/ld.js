game.heroesAI.ld = {
  move: {
    default: 'offensive'
  },
  action: {
    default: 'cast'
  },
  play: function (card, cardData) {
    cardData['has-instant-attack-buff'] = true;
    card.data('ai', cardData);
    // bear strats (siege)
    // use return if bear is low hp
    // use roar if low hp and enemy in range
    // ult if enemy in melee range or low hp
  },
  defend: function (ld) {
    //console.log('defend-from-ld');
    //if bear in player area path block tower
  }
};