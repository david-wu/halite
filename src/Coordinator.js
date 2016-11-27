const _ = require('lodash')

// Prevents tiles from going over 250
class Coordinator{

  constructor(options){
    _.extend(this, options);
  }

  reset(gameMap){
    this.gameMap = gameMap;
  }

  declareMove(site, targetSite){
    targetSite.willBeMovedHere.push(site);
    site.willBeVacated = true;
  }

  getWastedStrength(site, targetSite){
    const addedStrength = _.reduce(targetSite.willBeMovedHere, function(strength, movedSite){
      return strength+movedSite.strength
    }, site.strength)

    if(targetSite.willBeVacated){
      return addedStrength-250
    }

    if(targetSite.isMine){
      return (addedStrength + targetSite.strength)-250;
    }else{
      return addedStrength-250;
    }

  }
}

module.exports = Coordinator