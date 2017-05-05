game.heroesAI.kotl = {
  move: {
    default: 'defensive'
  },
  action: {
    default: 'cast'
  },
  play: function (kotl) {
    /*
    use ult immediately
    use illuminate to open way to the tower
    use mana if hand ain't full
    use leak and blind defensive
    use recall to save allies (combo am blink)
    */
  },
  defend: function (kotl) {
    //console.log('defend-from-kotl');
    /*
    avoid illuminate
    avoid moving if leak-buff
    avoid attacking if blind-buff
    */
  }
};