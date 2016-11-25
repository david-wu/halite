// const _ = require('lodash')
// const log = require('./log.js')

class Location {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}

class Move {
	constructor(loc = new Location(), direction = STILL) {
		this.loc = loc;
		this.direction = direction;
	}
}


module.exports = {
	Move,
};
