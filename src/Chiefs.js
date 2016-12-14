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
    if(!site.isMine){return;}
    if(site.inCommandZone){
      this.getMilitaryMove(site, moves)
    }else{
      this.getEconomicMove(site, moves)
    }
  }


  getMilitaryMove(site, moves=[]){
    let targetSites = site.trimMoves(site.neighborsByHostility());

    _.each(targetSites, (targetSite)=>{

      if(!targetSite.hostileNeighbors().length){
        targetSite = site.neighbor(site.closestHostileFront.key);
      }

      // TODO: remove duplicate block
      var expectedWaste = site.getWaste(targetSite)
      if(expectedWaste - targetSite.strength > 0){return}
      // Try to continue this move by pushing targetSite
      if(expectedWaste > 0){
        if(targetSite.moved){return}
        // prevent 2 sites from endlessly pushing each other
        if(targetSite.pushedBy===site){return}
        targetSite.pushedBy = site
        this.getMove(targetSite, moves)
        // failed to push targetSite, discontinue move
        if(!targetSite.moved){return}
      }
      site.moveTo(targetSite, moves)
      return false
      // TODO: remove duplicate block

    })
  }

  getEconomicMove(site, moves=[]){
    let targetFronts = site.trimMoves(site.frontsByEfficiency());

    _.each(targetFronts, (front)=>{

      if(!site.pushedBy){
        if(!front.canCapture){
          return false;
        }
        // consider other options if front is already being captured and site is too small
        if(front.strength<front.productionTo+front.strengthTo-site.strength && site.isSmall(8)){
          return;
        }
      }

      const targetSite = site.neighbor(front.key);

      // TODO: remove duplicate block
      var expectedWaste = site.getWaste(targetSite)
      if(expectedWaste - targetSite.strength > 0){return}
      // Try to continue this move by pushing targetSite
      if(expectedWaste > 0){
        if(targetSite.moved){return}
        // prevent 2 sites from endlessly pushing each other
        if(targetSite.pushedBy===site){return}
        targetSite.pushedBy = site
        this.getMove(targetSite, moves)
        // failed to push targetSite, discontinue move
        if(!targetSite.moved){return}
      }
      site.moveTo(targetSite, moves)
      return false
      // TODO: remove duplicate block

    })
  }

  reset(gameMap, turnCount){
    this.sites.length = 0
    this.gameMap = gameMap;
    this.turnCount = turnCount;
  }

}

module.exports = Chief;