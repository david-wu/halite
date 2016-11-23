const _ = require('lodash')


// Prevents tiles from going over 250
// Bug, takenSites don't add in original tile's strength
class Coordinator{

  constructor(options){
    _.extend(this, options);
    _.defaults(this, {
      takenSites: {},
      vacatedSites: {},
    });
  }

  reset(gameMap){
  	this.gameMap = gameMap;
    this.takenSites = {};
    this.vacatedSites = {};
  }

  declareMove(site, targetSite){
    const targetPos = [targetSite.x, targetSite.y];
    _.set(this.takenSites, targetPos, site);
    _.set(this.vacatedSites, targetPos, site);
  }

  getWastedStrength(site, targetSite){
    const targetPos = targetSite.pos();

    const takenSite = _.get(this.takenSites, targetPos);
    if(takenSite){
      return this.calculateWastedStrength(site, takenSite);
    }

    const vacatedSite = _.get(this.vacatedSites, targetPos)
    if(vacatedSite){
      return 0;
    }

    return this.calculateWastedStrength(site, targetSite);
  }

  calculateWastedStrength(t1, t2){
    if(!t2.isMine){
      return 0;
    }else{
      return (t1.strength+t2.strength)-250
    }
  }
}

module.exports = Coordinator