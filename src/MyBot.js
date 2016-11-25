const _ = require('lodash');
const Move = require('./hlt').Move;
const Networking = require('./networking');



const network = new Networking('MyBot');
const log = require('./log.js')



const constants = {
  // If combining tiles will waste this much, don't move
  maxWaste: 20,
  // Tiles with 0 production still have some value (allows getting to tiles with production)
  baseTileValue: 2,
  // Don't move unless strength is big enough
  minFarmTime: 3,


  // Having strength makes squares want to move
  itch: 3,
  // Only the strongest 10% of tiles may move?
  percentMovable: 0.1,
}



const Coordinator = require('./Coordinator.js');
const coordinator = new Coordinator();

network.on('map', function(gameMap){
  // gameMap.initSites();
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


    let frontsByEfficiency;
    const hostileFront = _.find(site.fronts, 'hostile');
    if(hostileFront){

      const neighborsSortedByHostility = _.sortBy(site.neighbors(), function(neighbor){
        return neighbor.hostileNeighbors().length + (neighbor.isHostile?1:0)
      }).reverse()

      _.each(neighborsSortedByHostility, function(targetSite){
        if(coordinator.getWastedStrength(site, targetSite) > constants.maxWaste){
          return;
        }

        if(!targetSite.hostileNeighbors().length){
          targetSite = gameMap.getSite(site, hostileFront.index)
        }
        coordinator.declareMove(site, targetSite)
        moves.push(site.moveTo(targetSite));
        return false;
      })


      // const targetSite = _.last(neighborsSortedByHostility)//[3]

      // if(coordinator.getWastedStrength(site, targetSite) > constants.maxWaste){
      //   return;
      // }

      // const targetSite = site.neighbors()[2]

      // coordinator.declareMove(site, targetSite)
      // moves.push(site.moveTo(targetSite));
      // return false;


      // frontsByEfficiency = _.sortBy(site.fronts, function(front){
      //   return _.reduce(front.site.fronts, function(hostileFrontCount, secondFront){
      //     return hostileFrontCount + (secondFront.site.isHostile ? 1 : 0);
      //   }, 0)
      // }).reverse();
      // log(site)
      // frontsByEfficiency = [hostileFront];
    }else{

      // Stop reversing
      frontsByEfficiency = _.sortBy(site.fronts, 'efficiency').reverse();
      _.remove(frontsByEfficiency, function(front){
        return front.reverseIndex === frontsByEfficiency[0].index
      })
      // if(frontsByEfficiency[0].reverseIndex===frontsByEfficiency[1].index){
      //   frontsByEfficiency.splice(1, 1);
      // }
      frontsByEfficiency.length=2;
    }


    _.each(frontsByEfficiency, function(front){

      if(!front.canCapture){
        return false;
      }

      const targetSite = gameMap.getSite(site, front.index);

      const wastedStrength = coordinator.getWastedStrength(site, targetSite);
      if(wastedStrength > constants.maxWaste){
        return site.strength > 100 ? undefined : false;
      }



      // // wait for more strength if already being captured
      // if(front.strength < (front.productionTo+front.strengthTo-site.strength)){
      //   if(site.strength<50){
      //     return;
      //   }
      // }

      // wait for longer production if already being captured
      if (front.strength < front.productionTo + front.strengthTo - site.strength && site.strength < site.production * 5) {
        return;
      }



      coordinator.declareMove(site, targetSite)
      moves.push(new Move({x: site.x, y:site.y}, front.index));
      return false;

    })

  })

  return moves;
}

// function shouldMove(front, site){
//   const strengthAtFront = (front.productionTo+front.strengthTo)/front.strength

// }



function setSiteState(site){

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







