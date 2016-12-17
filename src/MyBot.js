const _ = require('lodash');
const Move = require('./hlt').Move;
const Networking = require('./networking');


const network = new Networking('6_1');
const log = require('./log.js')
const inspect = require('util').inspect;


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


// const maxStrengthVision = 100;

function setFrontState(front={}, site={}, direction){
    front.path.push(site);

    setFrontBaseStats(front, site)
    setFrontEfficiency(front, site)
    setFrontCanCapture(front, site)
    setFrontDistanceToHostile(front, site)

    _.extend(site.fronts[direction], front)
    overrideFront(front, site)

    return front;
}
function setFrontBaseStats(front, site){
    if(site.isMine){
      front.frontProductionLostOnTheWay += front.production;
      front.producedOnTheWay += front.productionTo
      front.productionTo += site.production
      front.strengthTo += site.strength
      front.distanceTo += 1
    }else{
      front.frontProductionLostOnTheWay = 0;
      front.producedOnTheWay = 0;
      front.productionTo = 0
      front.strengthTo = 0
      front.distanceTo = 0

      front.site = site
      front.strength = site.strength
      front.production = site.production
    }
}
function setFrontEfficiency(front, site){
  if(!site.isMine){return;}
  const frontValue = front.production + constants.baseTileValue
  const frontCost = front.strength + front.productionTo + front.frontProductionLostOnTheWay
  front.efficiency = frontValue/frontCost
}

function overrideFront(front, site){
  if(!site.isMine){return;}
  if(!site.mostEfficientFront || front.efficiency > site.mostEfficientFront.efficiency){
    site.mostEfficientFront = _.clone(front);
  }else{
    _.extend(front, site.mostEfficientFront);
  }
}

function setFrontCanCapture(front, site){
  if(front.site && front.site.isHostile){
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
    }

}


const defaultFrontState = {
  frontProductionLostOnTheWay: 0,
  producedOnTheWay: 0,
  productionTo: 0,
  strengthTo: 0,
  distanceTo: Infinity,
  path: [],
};

function setSiteFronts(gameMap){
  setXFronts(gameMap);
  setYFronts(gameMap);
  setXFronts(gameMap);
  setYFronts(gameMap);
}

// Double loop in all directions
// First loop sets closest gray square Location (if any)
// Second lop sets distance to gray square
function setXFronts(gameMap){
  let site;
  const doubleWidth = gameMap.width*2;

  let frontState;
  for(let y=0; y<gameMap.height; y++){

    frontState = _.clone(defaultFrontState);
    for(let x=0; x<doubleWidth; x++){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site, 'west');
    }

    frontState = _.clone(defaultFrontState);
    for(let x=doubleWidth-1; x>=0; x--){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site, 'east');
    }
  }
}

function setYFronts(gameMap){
  let site;
  const doubleHeight = gameMap.height*2;

  let frontState;
  for(let x=0; x<gameMap.width; x++){

    frontState = _.clone(defaultFrontState);
    for(let y=0; y<doubleHeight; y++){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site, 'north');
    }

    frontState = _.clone(defaultFrontState);
    for(let y=doubleHeight-1; y>=0; y--){
      site = gameMap.getSite({x,y});
      setFrontState(frontState, site, 'south');
    }
  }
}







