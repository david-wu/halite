const _ = require('lodash');
const Site = require('./Site.js')
// const log = require('./log.js')

const STILL = 0;
const NORTH = 1;
const EAST  = 2;
const SOUTH = 3;
const WEST  = 4;

class GameMap {

	constructor(options) {
		_.extend(this, options);
		this.initSites();
	}

	initSites(){
		this.eachSite((site, x, y)=>{
			site.gameMap = this;
			this.contents[y][x] = new Site(site);
		})
	}

	eachSite(iteratee){
		for(let y=0; y<this.height; y++) {
			for(let x=0; x<this.width; x++) {
				iteratee(this.getSite({x,y}), x, y);
			}
		}
	}

	eachMySites(iteratee){
		this.eachSite(function(site, x, y){
			if(site.isMine){
				iteratee(site, x, y)
			}
		})
	}

	getSite(l, direction = STILL) {
		const { x, y } = this.getLocation(l, direction);
		return this.contents[y][x];
	}

	getLocation(loc, direction) {
		let { x, y } = loc;
		if (direction === STILL) {
		} else if (direction === NORTH) {
			y -= 1;
		} else if (direction === EAST) {
			x += 1;
		} else if (direction === SOUTH) {
			y += 1;
		} else if (direction === WEST) {
			x -= 1;
		}

		while(x<0){
			x += this.width
		}
		while(y<0){
			y += this.height
		}
		return {
			x: x % this.width,
			y: y % this.height
		};
	}

}

module.exports = GameMap