const {
  Move,
} = require('./hlt');

const _ = require('lodash');
const Networking = require('./networking');
const log = require('./log.js')

const network = new Networking('MyJavaScriptBot');

network.on('map', (gameMap, id) => {
  const moves = [];
  setSiteFronts(gameMap, id);

  for (let y = 0; y < gameMap.height; y++) {
    for (let x = 0; x < gameMap.width; x++) {
      const loc = { x, y };
      const site = gameMap.getSite(loc);


      if (site.owner === id && site.strength>5) {
        const front = closestFront(site)
        moves.push(new Move(loc, front));
      }
    }
  }

  network.sendMoves(moves);
});


const frontIndices = {
  north: 1,
  east: 2,
  south: 3,
  west: 4,
}
function closestFront(site){

  let closestFront = 'north';
  let closestDistance = site.fronts.north;

  _.each(site.fronts, function(value, key){
                log(value, closestDistance)

    if(value < closestDistance){
      closestDistance = value;
      closestFront = key;
    }
  })

  return frontIndices[closestFront];
}


// Calculate distance of each front for each square
function setSiteFronts(gameMap, id){
  let frontDist=0;
  let site;

  for (let y = 0; y < gameMap.height; y++) {
    frontDist = 0;
    for (let x = 0; x < gameMap.width; x++) {
      site = gameMap.contents[y][x];
      frontDist = site.owner===id ? frontDist+1 : 0;
      gameMap.contents[y][x].fronts = {west: frontDist}
    }

    frontDist = 0;
    for (let x = gameMap.width-1; x>=0; x--) {
      site = gameMap.contents[y][x];
      frontDist = site.owner===id ? frontDist+1 : 0;
      gameMap.contents[y][x].fronts.east = frontDist
    }
  }

  for (let x = 0; x < gameMap.width; x++) {
    frontDist = 0;
    for (let y = 0; y < gameMap.width; y++) {
      site = gameMap.contents[y][x];
      frontDist = site.owner===id ? frontDist+1 : 0;
      gameMap.contents[y][x].fronts.north = frontDist
    }

    frontDist = 0;
    for (let y = gameMap.width-1; y>=0; y--) {
      site = gameMap.contents[y][x];
      frontDist = site.owner===id ? frontDist+1 : 0;
      gameMap.contents[y][x].fronts.south = frontDist
    }

  }


}


function eachPerimeter(iteratee){

}