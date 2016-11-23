const _ = require('lodash');
const Move = require('./hlt').Move;
const Networking = require('./networking');

const network = new Networking('MyBot');
// const log = require('./log.js')


const constants = {
  maxWaste: 50,
  // Tiles with 0 production still have some value (allows getting to tiles with production)
  baseTileValue: 5,
  // Don't move unless strength is big enough
  minFarmTime: 3,
  maxTileStrength: 250,
}



network.on('map', function(gameMap, id){
  gameMap.initSites();
  const moves = getMoves(gameMap, id);
  network.sendMoves(moves);
});



let takenSites = {};
let vacatedSites = {};
function getMoves(gameMap){
  takenSites = {};
  vacatedSites = {};
  const moves = [];

  setSiteFronts(gameMap);

  gameMap.eachMySites(function(site){
    if(site.strength < constants.minFarmTime*site.production){return}

    setFrontsStats(site);

    let frontsByEfficiency;
    const hostileFront = _.find(site.fronts, 'hostile');
    if(hostileFront){
      frontsByEfficiency = [hostileFront];
    }else{
      frontsByEfficiency = _.sortBy(site.fronts, 'efficiency')
      frontsByEfficiency.shift();
    }


    _.eachRight(frontsByEfficiency, function(front){

      if(!front.shouldCapture){
        return site.strength > 100 ? undefined : false;
      }

      const targetSite = gameMap.getSite(site, front.index);

      const wastedStrength = getWastedStrength(site, targetSite);
      if(wastedStrength > 20){
        return site.strength > 100 ? undefined : false;
      }

      _.set(takenSites, [targetSite.x, targetSite.y], site);
      _.set(vacatedSites, [targetSite.x, targetSite.y], site);
      moves.push(new Move({x: site.x, y:site.y}, front.index));
      return false;

    })

  })

  return moves;
}

function getWastedStrength(site, targetSite){
  const targetPos = [targetSite.x, targetSite.y];

  const takenSite = _.get(takenSites, targetPos);
  if(takenSite){
    return calculateWastedStrength(site, takenSite);
  }

  const vacatedSite = _.get(vacatedSites, targetPos)
  if(vacatedSite){
    return 0;
  }

  return calculateWastedStrength(site, targetSite);
}

function calculateWastedStrength(t1, t2){
  if(!t2.isMine){
    return 0;
  }else{
    return (t1.strength+t2.strength)-250
  }
}



const frontStatGetters = {

  // Should return (overall production gained / strength spent)
  efficiency: function(front, site){
    return (front.production+constants.baseTileValue) / ((front.strength + Math.pow(front.distanceTo, 2))/2);
  },

  // If most efficient front, waits for shouldCapture
  shouldCapture: function(front, site){
    if(site.strength >= constants.maxTileStrength){
      return true;
    }else{

      const strengthAtFront = front.productionTo+front.strengthTo;



      // const isAlreadyBeingCaptured = (strengthAtFront-site.strength) > front.strength;
      // if(isAlreadyBeingCaptured){

      //   if(site.strength < 100){
      //     return false
      //   }

      //   // A square 2 spaces ahead of it is already capturing
      //   const siteOneSpaceAhead = site.gameMap.getSite(site, front.index)
      //   if(!siteOneSpaceAhead.isMine){return true}
      //   const capturerIsAtLeastTwoSpacesAway = (strengthAtFront-site.strength-siteOneSpaceAhead.strength-siteOneSpaceAhead.production) > front.strength
      //   return capturerIsAtLeastTwoSpacesAway;
      // }


      const canCapture = (strengthAtFront) > front.strength;
      return canCapture
    }
  }
}

function setFrontsStats(site){
  _.each(site.fronts, function(front){
    _.each(frontStatGetters, function(statGetter, key){
      front[key] = statGetter(front, site);
    })
  })
}



function setFrontState(front={}, site={}){
    setFrontBaseStats(front, site)
    setFrontHostility(front, site)
    setFrontDeltas(front, site)
    return front;
}

function setFrontBaseStats(front, site){
    if(site.isMine){
      front.distanceTo = front.distanceTo+1;
      front.strengthTo = front.strengthTo+site.strength;
      front.productionTo = front.productionTo+(site.production*(front.distanceTo-1));
    }else{
      front.strength = _.isUndefined(site.strength) ? Infinity : site.strength;
      front.production = site.production || 0
      front.pos = {
        x: site.x,
        y: site.y,
      }
      front.distanceTo = 0
      front.strengthTo = 0
      front.productionTo = 0
    }
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
      }else if(site.strength > 20){
        front.hostile = false;
      }
    }
}

// Change in front strength/production is valuable
function setFrontDeltas(front, site){
    if(site.isMine){
    }else{
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


function eachPerimeter(iteratee){

}








