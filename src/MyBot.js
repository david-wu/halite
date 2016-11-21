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


      if (site.owner === id && site.strength>50) {
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
    if(value < closestDistance){
      closestDistance = value;
      closestFront = key;
    }
  })

  return frontIndices[closestFront];
}


// Calculate distance of each front for each square
// First loop finds gray square Location
// Secon lop finds distance to gray square
function setSiteFronts(gameMap, id){
  let frontDist=0;
  let site;
  const doubleHeight = gameMap.height*2;
  const doubleWidth = gameMap.width*2;
  const {height, width} = gameMap;

  for (let y = 0; y < doubleHeight; y++) {
    frontDist = Infinity;
    for (let x = 0; x < doubleWidth; x++) {
      site = getSite(gameMap, x, y);
      frontDist = site.owner===id ? frontDist+1 : 0;
      site.fronts = {west: frontDist}
    }
    frontDist = Infinity;
    for (let x = doubleWidth-1; x>=0; x--) {
      site = getSite(gameMap, x, y);
      frontDist = site.owner===id ? frontDist+1 : 0;
      site.fronts.east = frontDist
    }
  }

  for (let x = 0; x < doubleWidth; x++) {
    frontDist = Infinity;
    for (let y = 0; y < doubleHeight; y++) {
      site = getSite(gameMap, x, y);
      frontDist = site.owner===id ? frontDist+1 : 0;
      site.fronts.north = frontDist
    }
    frontDist = Infinity;
    for (let y = doubleHeight-1; y>=0; y--) {
      site = getSite(gameMap, x, y);
      frontDist = site.owner===id ? frontDist+1 : 0;
      site.fronts.south = frontDist
    }
  }

}

// Wraps around
function getSite(gameMap, x, y){
  if(x >= gameMap.width){
    x = x-gameMap.width;
  }
  if(y >= gameMap.height){
    y = y-gameMap.height;
  }
  return gameMap.contents[y][x];
}

function eachPerimeter(iteratee){

}