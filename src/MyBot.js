const {
  Move,
} = require('./hlt');

const _ = require('lodash');
const Networking = require('./networking');
// const log = require('./log.js')

const network = new Networking('MyBot');

network.on('map', (gameMap, id) => {
  const moves = [];

  gameMap.initSites();

  setSiteFronts(gameMap, id);

  gameMap.eachMySites(function(site){

    if(site.strength < 5*site.production){
      return;
    }

    _.each(site.fronts, function(front, key){
      front.key = key;

      front.efficiency = (front.production+1) / (front.strength + (10*front.distanceTo) );

      if(site.strength + front.productionTo > 200){
        front.canCapture = true;
      }else{
        front.canCapture = front.strength < (front.productionTo+front.strengthTo);
      }

    })


    const frontsByEfficiency = _.sortBy(site.fronts, 'efficiency')
    const mostEfficientFront = _.last(frontsByEfficiency);
    if(mostEfficientFront && mostEfficientFront.canCapture){
      const frontIndex = frontIndices[mostEfficientFront.key]
      moves.push(new Move({x: site.x, y:site.y}, frontIndex));
    }

  })

  network.sendMoves(moves);
});


const frontIndices = {
  north: 1,
  east: 2,
  south: 3,
  west: 4,
}
function closestFront(site){
  let closestFront = site.fronts.north;
  let closestDistance = site.fronts.north.distanceTo;
  _.each(site.fronts, function(front, key){
    if(front.distanceTo < closestDistance){
      closestDistance = front.distanceTo;
      closestFront = front;
    }
  })
  return closestFront;
}


// Double Iteration on all squares
// First loop finds gray square Location
// Second lop finds distance to gray square
function setSiteFronts(gameMap, id){
  setXFronts(gameMap);
  setYFronts(gameMap);
}

function setXFronts(gameMap){
  let site;
  const doubleHeight = gameMap.height*2;
  const doubleWidth = gameMap.width*2;

  const frontState = setFrontState();
  for(let y=0; y<doubleHeight; y++){

    setFrontState(frontState);
    frontState.distanceTo = gameMap.width;
    for(let x=0; x<doubleWidth; x++){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.west, frontState);
    }

    setFrontState(frontState);
    frontState.distanceTo = gameMap.width;
    for (let x = doubleWidth-1; x>=0; x--) {
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.east, frontState);
    }
  }
}

function setYFronts(gameMap){
  let site;
  const doubleHeight = gameMap.height*2;
  const doubleWidth = gameMap.width*2;

  const frontState = setFrontState();
  for(let x=0; x<doubleHeight; x++){

    setFrontState(frontState);
    frontState.distanceTo = gameMap.height;
    for(let y=0; y<doubleWidth; y++){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.north, frontState);
    }

    setFrontState(frontState);
    frontState.distanceTo = gameMap.height;
    for (let y = doubleWidth-1; y>=0; y--) {
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.south, frontState);
    }
  }
}

function setFrontState(frontState={}, site={}){
    if(site.isMine){
      frontState.distanceTo = frontState.distanceTo+1;
      frontState.strengthTo = frontState.strengthTo+site.strength;
      frontState.productionTo = frontState.productionTo+(site.production*(frontState.distanceTo-1));
    }else{
      frontState.strength = site.strength || 0
      frontState.production = site.production || 0
      frontState.pos = {
        x: site.x,
        y: site.y,
      }
      frontState.distanceTo = 0
      frontState.strengthTo = 0
      frontState.productionTo = 0
    }
    return frontState;
}


function eachPerimeter(iteratee){

}