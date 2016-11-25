const _ = require('lodash')


const directionIndices = {
	north: 1,
	east: 2,
	south: 3,
	west: 4
};

class Site {

	constructor(options){
		_.extend(this, options);
		_.extend(this, {
			isMine: this.gameMap.myId===this.owner,
			willBeMovedHere: [],
		})
		_.extend(this, {
			isHostile: !this.isMine && this.owner>0,
			fronts: {
				north: {
					key: 'north',
					index: 1,
					reverseIndex: 3,
				},
				east: {
					key: 'east',
					index: 2,
					reverseIndex: 4,
				},
				south: {
					key: 'south',
					index: 3,
					reverseIndex: 1,
				},
				west: {
					key: 'west',
					index: 4,
					reverseIndex: 2
				},
			},
		})
	}

	hostileNeighbors(){
		return _.filter(this.neighbors(), function(neighbor){
			return neighbor.isHostile
		})
	}


	moveTo(site){
		const direction = _.indexOf(this.neighbors(), site)+1
		return {
			loc: {
				x: this.x,
				y: this.y,
			},
			direction: direction
		}
	}

	// directionsTo(site){
	// 	const neighbors = this.neighbors();
	// 	return _.indexOf(this.neighbors, site)+1
	// }

	bfTraverse(iteratee, levels=1, visited={}){
		if(levels<=0){
			return;
		}
		_.set(visited, this.pos(), true)

		const stack = [];
		_.each(this.neighbors(), function(neighbor){
			if(_.get(visited, neighbor.pos())){return}
			iteratee(neighbor);
			_.set(visited, neighbor.pos(), true)
			stack.push(neighbor)
		})

		_.each(stack, function(neighbor){
			neighbor.bfTraverse(iteratee, levels-1, visited);
		})
	}

	eachNeighbor(iteratee){
		_.each(this.neighbors(), function(neighbor){
			iteratee(neighbor);
		})
	}

	neighbors(){
		return [
			this.neighbor('north'),
			this.neighbor('east'),
			this.neighbor('south'),
			this.neighbor('west'),
		]
	}

	neighbor(direction){
		return this.gameMap.getSite(this, directionIndices[direction])
	}

	pos(){
		return [this.x, this.y]
	}

}


module.exports = Site;