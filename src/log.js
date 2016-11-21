const fs = require('fs')
const path = require('path')
const logFilePath = path.resolve(__dirname, '../debug.log')


const log = function(text){
  return new Promise(function(resolve, reject){
  	if(typeof text === 'object'){
  		text = JSON.stringify(text, null, '    ');
  	}
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
	promise = promise.then(function(){
		log(text)
	})
}
module.exports = logSync