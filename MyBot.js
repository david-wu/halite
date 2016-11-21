const {
  Move,
} = require('./hlt');

const log = require('./log.js')

const Networking = require('./networking');

const network = new Networking('MyJavaScriptBot');

network.on('map', (gameMap, id) => {
  const moves = [];

  for (let y = 0; y < gameMap.height; y++) {
    for (let x = 0; x < gameMap.width; x++) {
      const loc = { x, y };
      const site = gameMap.getSite(loc);

      if (site.owner === id && site.strength>3) {
        moves.push(new Move(loc, Math.floor(Math.random() * 5)));
      }
    }
  }

  network.sendMoves(moves);
});
