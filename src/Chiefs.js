const _ = require('lodash')

const maxWaste = 0;
const minFarmTime = 3;
const log = require('./log.js');

class Chief{

  constructor(options){
    _.extend(options);
    _.defaults(this, {
      sites: [],
    })
  }

  addSite(site){
    this.sites.push(site);
    return true;
  }

  getMoves(moves=[]){
    _.each(this.sites, (site)=>{
      this.getMove(site, moves);
    })
    return moves
  }


  getMove(site, moves){
    if(site.isInCommandZone()){
      this.getMilitaryMove(site, moves)
    }else{
      this.getEconomicMove(site, moves);
    }
  }


  getMilitaryMove(site, moves=[]){
    if(site.moved){return;}
    if(site.strength < minFarmTime*site.production){return}

    _.each(site.neighborsByAdjacentHostilesCount(), (targetSite)=>{

      if(!targetSite.hostileNeighbors().length){
        targetSite = site.neighbor(site.closestHostileFront.key);
      }

      // TODO: remove duplicate
      if(site.getWaste(targetSite) - targetSite.strength > maxWaste){return;}
      if(site.getWaste(targetSite) > maxWaste){
        if(targetSite.moved){
          return;
        }
        targetSite.mustMove = true;
        this.getMove(targetSite, moves);
        if(!targetSite.moved){
          return;
        }
      }

      moves.push(site.moveTo(targetSite));
      return false;
    })
    return site.moved;
  }

  getEconomicMove(site, moves=[]){
    if(site.moved){return;}
    if(!site.mustMove && site.strength<minFarmTime*site.production){return}

    _.each(site.frontsByEfficiency(), (front)=>{

      if(!site.mustMove && !front.canCapture){
        return false;
      }

      // wait for longer production if already being captured
      if(!site.mustMove && front.strength < front.productionTo+front.strengthTo-site.strength && site.strength<site.production*8) {
        return;
      }

      const targetSite = site.neighbor(front.key)

      // TODO: remove duplicate
      if(site.getWaste(targetSite) - targetSite.strength > maxWaste){return;}
      if(site.getWaste(targetSite) > maxWaste){
        if(targetSite.moved){
          return;
        }
        targetSite.mustMove = true;
        this.getMove(targetSite, moves);
        if(!targetSite.moved){
          return;
        }
      }

      moves.push(site.moveTo(targetSite));
      return false;
    })
  }

  reset(gameMap, turnCount){
    this.sites.length = 0
    this.gameMap = gameMap;
    this.turnCount = turnCount;
  }

}


class WarChief extends Chief{

  constructor(options){
    super(options)
  }

  // addSite(site){
  //   const hostileFronts = _.sortBy(site.fronts, 'distanceToHostile');
  //   site.closestHostileFront = hostileFronts[0]

  //   if(site.closestHostileFront.distanceToHostile<=3){
  //     this.sites.push(site);
  //     return true;
  //   }
  // }

  // getMoves(moves=[]){
  //   _.each(this.sites, (site)=>{
  //     this.getMove(site, moves);
  //   })
  //   return moves;
  // }

}


class EconChief extends Chief{

  constructor(options){
    super(options)
  }

  // getMoves(moves=[]){
  //   _.each(this.sites, (site)=>{
  //     this.getEconomicMove(site, moves);
  //   })
  //   return moves;
  // }

}

module.exports = {
  WarChief,
  EconChief,
}