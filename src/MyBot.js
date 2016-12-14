const _ = require('lodash');
const Move = require('./hlt').Move;
const Networking = require('./networking');


const network = new Networking('6_1');
const log = require('./log.js')


const constants = {
  // Tiles with 0 production still have some value (allows getting to tiles with production)
  baseTileValue: 2,
}


const Chief = require('./Chiefs.js')
const chief = new Chief();

let turnCount = 0;
network.on('map', function(gameMap){
  turnCount++;

  setSiteFronts(gameMap);
  chief.reset(gameMap, turnCount);

  gameMap.eachMySites(function(site){
    if(site.strength===0){return}
    site.inCommandZone = site.isInCommandZone();
    chief.addSite(site);
  })

  const moves = [];
  chief.getMoves(moves);
  network.sendMoves(moves);
});


const maxStrengthVision = 100;

function setFrontState(front={}, site={}){
    setFrontBaseStats(front, site)
    setFrontEfficiency(front, site)
    setFrontCanCapture(front, site)
    setFrontDistanceToHostile(front, site)
    // front.lastSite = site;
    return front;
}
function setFrontBaseStats(front, site){
    if(site.isMine){
      front.productionLostOnTheWay += front.production;
      front.producedOnTheWay += front.productionTo
      front.productionTo += site.production
      front.strengthTo += site.strength
      front.distanceTo += 1
    }else{
      front.productionLostOnTheWay = 0;
      front.producedOnTheWay = 0;
      front.productionTo = 0
      front.strengthTo = 0
      front.distanceTo = 0

      front.site = site
      front.strength = site.strength
      front.production = site.production
      front.pos = {
        x: site.x,
        y: site.y,
      }
    }
}
function setFrontEfficiency(front, site){
  const tileValue = front.production + constants.baseTileValue
  const tileCost = front.strength + front.productionLostOnTheWay
  front.efficiency = tileValue/tileCost
}
function setFrontCanCapture(front, site){
  if(site.isHostile){
    return front.canCapture = true
  }
  const strengthAtFront = front.producedOnTheWay + front.strengthTo

  // If front could already be captured on the previous site
  front.alreadyCanCapture = front.canCapture

  front.canCapture = strengthAtFront > front.strength
}
function setFrontDistanceToHostile(front, site){
    // If site is undefined (init) or 0, and strength>0
    if(!site.owner && site.strength>0){
      front.distanceToHostile = Infinity
      return;
    }
    if(site.isHostile){
      front.distanceToHostile = 0
      return;
    }

    front.distanceToHostile++;
    const mostHostileFront = _.minBy(site.fronts, 'distanceToHostile')
    if(!mostHostileFront){return;}

    const closestDistanceToHostile = mostHostileFront.distanceToHostile
    if(closestDistanceToHostile && front.distanceToHostile>closestDistanceToHostile){
      front.closestDistanceToHostile = closestDistanceToHostile;
      // front.distanceToHostile = site.distanceToHostile;
    }

}


const defaultFrontState = {
  productionTo: 0,
  producedOnTheWay: 0,
  distanceTo: Infinity,
  strengthTo: 0,
  site: undefined,
  strength: Infinity,
  production: 0
};

function setSiteFronts(gameMap){
  setXFronts(gameMap);
  setYFronts(gameMap);
}

// Double loop in all directions
// First loop sets closest gray square Location (if any)
// Second lop sets distance to gray square
function setXFronts(gameMap){
  let site;
  const doubleHeight = gameMap.height*2;
  const doubleWidth = gameMap.width*2;

  let frontState;
  for(let y=0; y<doubleHeight; y++){

    frontState = _.clone(defaultFrontState);
    for(let x=0; x<doubleWidth; x++){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.west, frontState);
    }

    frontState = _.clone(defaultFrontState);
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

  let frontState;
  for(let x=0; x<doubleHeight; x++){

    frontState = _.clone(defaultFrontState);
    for(let y=0; y<doubleWidth; y++){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.north, frontState);
    }

    frontState = _.clone(defaultFrontState);
    for (let y = doubleWidth-1; y>=0; y--) {
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site);
      _.extend(site.fronts.south, frontState);
    }
  }
}







