const _ = require('lodash')
const log = require('./log.js')

class Site {

	constructor(options){
		_.extend(this, options);
		_.extend(this, {
			isMine: this.gameMap.myId===this.owner,
		})
		_.extend(this, {
			isHostile: !this.isMine && this.owner>0,
			isNeutral: this.owner===0,
			willBeMovedHere: [],
			moved: false,
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

	frontsByEfficiency(){
		const frontsByEfficiency = _.sortBy(this.fronts, function(front){
			return -front.efficiency;
		});

		// prevent going back and forth
		_.remove(frontsByEfficiency, function(front){
			return front.reverseIndex === frontsByEfficiency[0].index
		})
		frontsByEfficiency.length = 2;

		return frontsByEfficiency;
	}

	// bestCombatNeighbors(){
	// 	return _.sortBy(this.neighbors(), function(neighbor){
	// 		return neighbor.expectedStrength();
	// 	})
	// }

	expectedStrength(){
		const addedStrength = _.reduce(this.willBeMovedHere, function(strength, movedSite){
			return strength+movedSite.strength
		}, this.strength)

		if(!this.isMine || this.moved){
			return addedStrength - this.strength;
		}else{
			return addedStrength;
		}
	}

	neighborsByAdjacentHostilesCount(){
		return _.sortBy(this.neighbors(), function(neighbor){
			const hostileSquares = (neighbor.isHostile ? 1 : 0) + neighbor.hostileNeighbors().length;
			const friendlySquares = neighbor.isMineNeighbors().length
			return -(hostileSquares - friendlySquares)
		})
	}

	// not exactly correct
	isMineNeighbors(){
		return _.filter(this.neighbors(), function(neighbor){
			return (neighbor.isMine && neighbor.strength>20) || neighbor.willBeMovedHere.length;
		})
	}

	hostileNeighbors(){
		return _.filter(this.neighbors(), function(neighbor){
			return neighbor.isHostile
		})
	}

	moveTo(targetSite){
		if(this.moved){
			log('already moved')
			return;
		}
		targetSite.willBeMovedHere.push(this);
		this.moved = true;
		const direction = _.indexOf(this.neighbors(), targetSite)+1
		if(!direction){
			log('should have dir')
			return;
		}
		return {
			loc: {
				x: this.x,
				y: this.y,
			},
			direction: direction || 0
		}
	}


	getWaste(targetSite){
		return this.strength + targetSite.expectedStrength()-255;
	}


	// bfTraverse(iteratee, levels=1, visited={}){
	// 	if(levels<=0){
	// 		return;
	// 	}
	// 	_.set(visited, this.pos(), true)

	// 	const stack = [];
	// 	_.each(this.neighbors(), function(neighbor){
	// 		if(_.get(visited, neighbor.pos())){return}
	// 		iteratee(neighbor)
	// 		_.set(visited, neighbor.pos(), true)
	// 		stack.push(neighbor)
	// 	})

	// 	_.each(stack, function(neighbor){
	// 		neighbor.bfTraverse(iteratee, levels-1, visited);
	// 	})
	// }

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


const directionIndices = {
	north: 1,
	east: 2,
	south: 3,
	west: 4
};


module.exports = Site;