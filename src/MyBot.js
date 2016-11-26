const _ = require('lodash');
const Move = require('./hlt').Move;
const Networking = require('./networking');


const network = new Networking('6_0');
// const log = require('./log.js')


const constants = {
  // If combining tiles will waste this much, don't move
  maxWaste: 20,
  // Tiles with 0 production still have some value (allows getting to tiles with production)
  baseTileValue: 2,
  // Don't move unless strength is big enough
  minFarmTime: 3,
}


const Coordinator = require('./Coordinator.js');
const coordinator = new Coordinator();


network.on('map', function(gameMap){
  coordinator.reset(gameMap);
  const moves = getMoves(gameMap, coordinator);
  network.sendMoves(moves);
});



function getMoves(gameMap, coordinator){
  const moves = [];

  setSiteFronts(gameMap);

  gameMap.eachMySites(function(site){
    if(site.strength === 0){return;}
    if(site.strength < constants.minFarmTime*site.production){return}


    const hostileFront = _.find(site.fronts, 'hostile');
    if(hostileFront){

      _.each(site.neighborsByHostility(), function(targetSite){
        if(coordinator.getWastedStrength(site, targetSite) > constants.maxWaste){
          return;
        }

        if(!targetSite.hostileNeighbors().length){
          targetSite = hostileFront.site
        }
        coordinator.declareMove(site, targetSite)
        moves.push(site.moveTo(targetSite));
        return false;
      })

    }else{

      _.each(site.frontsByEfficiency(), function(front){

        if(!front.canCapture){
          return false;
        }

        const targetSite = gameMap.getSite(site, front.index);

        const wastedStrength = coordinator.getWastedStrength(site, targetSite);
        if(wastedStrength > constants.maxWaste){
          return site.strength > 100 ? undefined : false;
        }

        // wait for longer production if already being captured
        if(front.strength < front.productionTo+front.strengthTo-site.strength && site.strength<site.production*8) {
          return;
        }

        coordinator.declareMove(site, targetSite)
        moves.push(site.moveTo(targetSite));
        return false;

      })
    }

  })

  return moves;
}



function setFrontState(front={}, site={}){
    // setFrontDeltas(front, site)
    setFrontBaseStats(front, site)
    setFrontEfficiency(front, site)
    setFrontCanCapture(front, site)
    setFrontHostility(front, site)
    front.lastSite = site;
    return front;
}
// Capturing points that lead to more valuable points is more efficient
// function setFrontDeltas(front, site){
//     if(_.isEmpty(site)){
//       front.deltaStrength = 0;
//       front.deltaProduction = 0;
//     }else if(site.isMine){

//     }else{
//       front.deltaStrength = front.strength-site.strength;
//       front.deltaProduction = front.production-site.production;
//     }
// }
function setFrontBaseStats(front, site){
    if(site.isMine){
      front.productionTo += (site.production*front.distanceTo);
      front.distanceTo += 1;
      front.strengthTo += site.strength;
    }else{
      front.distanceTo = 0
      front.strengthTo = 0
      front.productionTo = 0
      front.strength = _.isUndefined(site.strength) ? Infinity : site.strength;
      front.production = site.production || 0
      front.pos = {
        x: site.x,
        y: site.y,
      }
      front.site = site;
    }
}
function setFrontEfficiency(front, site){
  const tileValue = front.production+constants.baseTileValue// + (front.deltaProduction)
  const tileCost = front.strength + Math.pow(front.distanceTo, 2)
  front.efficiency = tileValue/tileCost;
}
function setFrontCanCapture(front, site){
  if(!site.isMine && site.owner>0){
    return true;
  }
  const strengthAtFront = front.productionTo+front.strengthTo;
  front.canCapture = strengthAtFront > front.strength;
}
function setFrontHostility(front, site){
    if(site.isMine){
      if(front.distanceTo > 1){
        front.hostile = false;
      }
    }else{
      if(site.owner > 0){
        front.hostile = true;
      // neutral space with strength over 20
      }else if(site.strength > 0){
        front.hostile = false;
      }
    }
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







