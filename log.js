
const fs = require('fs')

const log = function(text){
  return new Promise(function(resolve, reject){
    fs.appendFile('./log', text+'\n', function(err){
      if(err){reject()}
      resolve();
    })
  })
}

let promise = new Promise(function(resolve, reject){
	fs.writeFile('./log', '', function(err){
      if(err){reject()}
      resolve();
	})
})

const logSync = function(text){
	promise = promise.then(function(){
		log(text)
	})
}
module.exports = logSync