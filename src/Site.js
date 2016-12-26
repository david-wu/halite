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

	getNeighborsByHostility(){
		return _.sortBy(this.getNeighbors(), function(neighbor){
			return neighbor.getHostility();
		})
	}

	getHostility(){
		return _.reduce(this.getNeighbors(), function(totalDistance, neighbor){
			return totalDistance + neighbor.distanceToHostile
		}, 0)
	}

	getFrontsByEfficiency(){
		return _.sortBy(this.fronts, function(front){
			return -front.efficiency;
		});
	}

	// smaller than minFarmTime
	isSmall(minFarmTime=3){
		return this.strength < minFarmTime*this.production;
	}

	moveTo(targetSite, moves=[]){
		const move = this.getMoveTo(targetSite);
		if(move){
			moves.push(move);
		}
		return move
	}

	getMoveTo(targetSite){
		targetSite.willBeMovedHere.push(this);
		this.moved = true;
		const directionIndex = _.indexOf(this.getNeighbors(), targetSite)+1

		if(!directionIndex){throw ('should have direction');}

		return {
			loc: {
				x: this.x,
				y: this.y,
			},
			direction: directionIndex || 0
		}
	}




	getMove(moves=[]){
		if(!this.isMine){return;}
		if(this.isSmall(2)){return;}
		if(this.distanceToHostile<=3){
			this.getMilitaryMove(moves)
		}else{
			this.getEconomicMove(moves)
		}
	}


	getMilitaryMove(moves=[]){
		let targetSites = this.getNeighborsByHostility();
		targetSites.length = 2;

		_.each(targetSites, (targetSite)=>{

			if(targetSite.number%2){return;}
			if(targetSite.isNeutral && targetSite.strength>=this.strength){return;}

			// TODO: remove duplicate block
			var expectedWaste = this.getExpectedWaste(targetSite)
			if(expectedWaste - targetSite.strength > 0){return}
			// Try to continue this move by pushing targetSite
			if(expectedWaste > 0){
				if(targetSite.moved){return}
				// prevent 2 sites from endlessly pushing each other
				if(targetSite.pushedBy===this){return}
				targetSite.pushedBy = this
				this.getMove(moves)
				// failed to push targetSite, discontinue move
				if(!targetSite.moved){return}
			}
			this.moveTo(targetSite, moves)
			return false
			// TODO: remove duplicate block
		})
	}

	getEconomicMove(moves=[]){
		let targetFronts = this.getFrontsByEfficiency();
		// targetFronts.length = 3;

		// if(!this.pushedBy){
		//   targetFronts.length=1;
		// }

		_.each(targetFronts, (front)=>{
			if(!this.pushedBy || this.strength<200){
				if(!front.canCapture){
					return false;
				}
			}
			// consider other options if front is already being captured and site is too small
			if(front.alreadyCanCapture && this.isSmall(5)){
				return;
			}

			const targetSite = this.getNeighbor(front.key);

			// TODO: remove duplicate block
			var expectedWaste = this.getExpectedWaste(targetSite)
			if(expectedWaste - targetSite.strength > 0){return}
			// Try to continue this move by pushing targetSite
			if(expectedWaste > 0){
				if(targetSite.moved){return}
				// prevent 2 sites from endlessly pushing each other
				if(targetSite.pushedBy===this){return}
				targetSite.pushedBy = this
				this.getMove(moves)
				// failed to push targetSite, discontinue move
				if(!targetSite.moved){return}
			}
			this.moveTo(targetSite, moves)
			return false
			// TODO: remove duplicate block
		})
  }



	getExpectedWaste(targetSite){
		return this.strength + targetSite.expectedStrength() - 255;
	}

	expectedStrength(){
		const addedStrength = _.reduce(this.willBeMovedHere, function(strength, movedSite){
			return strength+movedSite.strength
		}, 0)

		if(!this.isMine){
			return addedStrength - this.strength;
		}
		if(this.moved){
			return addedStrength;
		}
		return addedStrength + this.strength;
	}

	getNeighbors(){
		return [
			this.getNeighbor('north'),
			this.getNeighbor('east'),
			this.getNeighbor('south'),
			this.getNeighbor('west'),
		]
	}

	getNeighbor(direction){
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