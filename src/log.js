const fs = require('fs')
const path = require('path')
const logFilePath = path.resolve(__dirname, '../debug.log')


module.exports = function(){}






function stringify(o){

  var cache = [];
  return JSON.stringify(o, function(key, value) {
      if (typeof value === 'object' && value !== null) {
        return;
          if (cache.indexOf(value) !== -1) {
              // Circular reference found, discard key
              return;
          }
          // Store value in our collection
          cache.push(value);
      }
      return value;
  });
}

const inspect = require('util').inspect;



if(__dirname){

  function log(text){
    return new Promise(function(resolve, reject){
      fs.appendFile(logFilePath, text+'\n', function(err){
        if(err){reject()}
        resolve();
      })
    })
  }

  let promise = new Promise(function(resolve, reject){
    fs.writeFile(logFilePath, '', function(err){
        if(err){reject()}
        resolve();
    })
  })

  const logSync = function(text){
    text = inspect(text)
    promise = promise.then(function(){
      log(text)
    })
  }
  module.exports = logSync


}
