// asdfwconst _ = require('lodash')

// // Prevents tiles from going over 250
// class Coordinator{

//   constructor(options){
//     _.extend(this, options);
//   }

//   declareMove(site, targetSite){
//     targetSite.willBeMovedHere.push(site);
//     site.willBeVacated = true;
//   }

//   getWastedStrength(site, targetSite){
//     const addedStrength = _.reduce(targetSite.willBeMovedHere, function(strength, movedSite){
//       return strength+movedSite.strength
//     }, site.strength)

//     if(targetSite.willBeVacated){
//       return addedStrength-255
//     }

//     if(targetSite.isMine){
//       return (addedStrength + targetSite.strength)-255;
//     }else{
//       return addedStrength-255;
//     }

//   }
// }

// module.exports = Coordinator