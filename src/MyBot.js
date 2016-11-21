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
  let closestDistance = site.fronts.north.distance;

  _.each(site.fronts, function(front, key){
    if(front.distance < closestDistance){
      closestDistance = front.distance;
      closestFront = key;
    }
  })

  return frontIndices[closestFront];
}

function inBetweenSites(loc1, loc2){
  const inBetweenSites = [];
  
  return inBetweenSites;
}

function sumSiteStrengths(sites){
  return _.reduce(sites, function(memo, site){
    return memo + site.strength
  }, 0)
}


function initSites(gameMap, myId){
  let site;
  const {height, width} = gameMap;
  for (let y=0; y<height; y++){
    for (let x=0; x<width; x++){
      site = gameMap.contents[y][x];
      site.fronts = {
        north: {},
        east: {},
        south: {},
        west: {}
      }

      if(site.owner===myId){
        site.isMine = true;
      }
    }
  }
}

// Calculate distance of each front for each square
// First loop finds gray square Location
// Second lop finds distance to gray square
function setSiteFronts(gameMap, id){

  initSites(gameMap, id);
  setXFronts(gameMap);
  setYFronts(gameMap);
}


function setXFronts(gameMap){
  let site;
  let frontDist;
  const doubleHeight = gameMap.height*2;
  const doubleWidth = gameMap.width*2;

  for (let y = 0; y < doubleHeight; y++) {
    frontDist = Infinity;
    for (let x = 0; x < doubleWidth; x++) {
      site = getSite(gameMap, x, y);
      if(site.isMine){
        frontDist = frontDist+1;
      }else{
        frontDist = 0;
        frontStrength += site.strength;
      } 
      _.extend(site.fronts.west, {
        distance: frontDist,
        site: site,
        x: x,
        y: y
      });
    }
    frontDist = Infinity;
    for (let x = doubleWidth-1; x>=0; x--) {
      site = getSite(gameMap, x, y);
      frontDist = site.isMine ? frontDist+1 : 0;
      _.extend(site.fronts.east, {
        distance: frontDist,
        site: site,
        x: x,
        y: y
      });
    }
  }

}

function setYFronts(gameMap){
  let site;
  let frontDist;
  const doubleHeight = gameMap.height*2;
  const doubleWidth = gameMap.width*2;

  for (let x = 0; x < doubleWidth; x++) {
    frontDist = Infinity;
    for (let y = 0; y < doubleHeight; y++) {
      site = getSite(gameMap, x, y);
      frontDist = site.isMine ? frontDist+1 : 0;
      _.extend(site.fronts.north, {
        distance: frontDist,
        site: site,
        x: x,
        y: y
      });
    }
    frontDist = Infinity;
    for (let y = doubleHeight-1; y>=0; y--) {
      site = getSite(gameMap, x, y);
      frontDist = site.isMine ? frontDist+1 : 0;
      _.extend(site.fronts.south, {
        distance: frontDist,
        site: site,
        x: x,
        y: y
      });
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