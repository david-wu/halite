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
    return moves
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

  addSite(site){
    const hostileFronts = _.sortBy(site.fronts, 'distanceToHostile');
    site.closestHostileFront = hostileFronts[0]

    if(site.closestHostileFront.distanceToHostile<=3){
      this.sites.push(site);
      return true;
    }
  }


  getMoves(moves=[]){

    _.each(this.sites, (site)=>{
      if(site.moved){return;}

      _.each(site.neighborsByAdjacentHostilesCount(), (targetSite)=>{

        if(!targetSite.hostileNeighbors().length){
          targetSite = site.neighbor(site.closestHostileFront.key);
        }

        if(site.getWaste(targetSite) > targetSite.strength){return;}
        if(site.getWaste(targetSite) > maxWaste){
          if(targetSite.strength>site.strength || targetSite.moved || (targetSite.getWaste(site)-site.strength)>maxWaste){
            return;
          }
          moves.push(targetSite.moveTo(site));
        }

        // this.coordinator.declareMove(site, targetSite)
        moves.push(site.moveTo(targetSite));
        return false;
      })

    })

    return moves;
  }


}


class EconChief extends Chief{
  constructor(options){
    super(options)
  }

  getMoves(moves=[]){
    _.each(this.sites, (site)=>{
      if(site.moved){return;}
      if(site.strength < minFarmTime*site.production){return}

      _.each(site.frontsByEfficiency(), (front)=>{

        if(!front.canCapture){
          return false;
        }

        // wait for longer production if already being captured
        if(front.strength < front.productionTo+front.strengthTo-site.strength && site.strength<site.production*8) {
          return;
        }

        const targetSite = site.neighbor(front.key)
        if(site.getWaste(targetSite) > targetSite.strength){return;}
        if(site.getWaste(targetSite) > maxWaste){
          if(targetSite.strength>site.strength || targetSite.moved || (targetSite.getWaste(site)-site.strength)>maxWaste){
            return;
          }
          moves.push(targetSite.moveTo(site));
        }

        // this.coordinator.declareMove(site, targetSite)
        moves.push(site.moveTo(targetSite));
        return false;
      })
    })

    return moves;

  }

}

module.exports = {
  WarChief,
  EconChief,
}