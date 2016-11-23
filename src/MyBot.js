const Move = require('./hlt').Move;
const _ = require('lodash');
const Networking = require('./networking');
// const log = require('./log.js')

const network = new Networking('MyBot');

network.on('map', function(gameMap, id){
  const moves = getMoves(gameMap, id);
  network.sendMoves(moves);
});


function getMoves(gameMap){
  const moves = [];

  gameMap.initSites();

  setSiteFronts(gameMap);

  gameMap.eachMySites(function(site){
    if(site.strength < 3*site.production){
      return;
    }


    setFrontsStats(site);

    const frontsByEfficiency = _.sortBy(site.fronts, 'efficiency')
    const mostEfficientFront = _.last(frontsByEfficiency);
    if(mostEfficientFront && mostEfficientFront.canCapture){
      moves.push(new Move({x: site.x, y:site.y}, mostEfficientFront.index));
    }
  })

  return moves;
}


const constants = {

  // Tiles with 0 production still have some value (allows getting to tiles with production)
  baseTileValue: 5,

  maxTileStrength: 250,

}

const getFrontStats = {

  // Should return (overall production gained / strength spent)
  efficiency: function(front, site){
    return (front.production+constants.baseTileValue) / ((front.strength + Math.pow(front.distanceTo, 2))/2);
  },

  // If most efficient front, waits for canCapture
  canCapture: function(front, site){
    if(site.strength+front.strengthTo+front.productionTo >= constants.maxTileStrength){
      return true;
    }else{
      return front.strength < (front.productionTo+front.strengthTo);
    }
  }
}

function setFrontsStats(site){
  _.each(site.fronts, function(front){
    _.each(getFrontStats, function(getter, key){
      front[key] = getter(front, site);
    })
  })
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


// Double Iteration on all squares
// First loop sets gray square Location
// Second lop sets distance to gray square
function setSiteFronts(gameMap){
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
    frontState.distanceTo = Infinity;
    for(let x=0; x<doubleWidth; x++){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.west, frontState);
    }

    setFrontState(frontState);
    frontState.distanceTo = Infinity;
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
    frontState.distanceTo = Infinity;
    for(let y=0; y<doubleWidth; y++){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.north, frontState);
    }

    setFrontState(frontState);
    frontState.distanceTo = Infinity;
    for (let y = doubleWidth-1; y>=0; y--) {
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.south, frontState);
    }
  }
}


function eachPerimeter(iteratee){

}








