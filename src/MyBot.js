const _ = require('lodash');
const Move = require('./hlt').Move;
const Networking = require('./networking');


const network = new Networking('6_1');
const log = require('./log.js')
const inspect = require('util').inspect;


const constants = {
	baseTileValue: 1,
}


let turnCount = 0;
network.on('map', function(gameMap){
	setStatsBefore(gameMap, turnCount++);
	setSiteFronts(gameMap);
	setStatsAfter(gameMap);

	const moves = [];
	gameMap.eachMySites(function(site){
		if(site.isSmall(1)){return}
		site.getMove(moves);
	})
	network.sendMoves(moves);
});

function setStatsBefore(gameMap, seed){
	gameMap.eachSite(function(site, x, y){
		site.number = seed+x+y;
	})
}

function setSiteFronts(gameMap){
	_.times(4, function(){
		setXFronts(gameMap);
		setYFronts(gameMap);
	})
}

function setStatsAfter(gameMap){
	gameMap.eachSite(function(site){
		site.cacheStats();
	})
}

function setFrontState(front={}, site={}, direction){
		setFrontBaseStats(front, site)
		setFrontCanCapture(front, site)
		setFrontDistanceToHostile(front, site)
		setFrontEfficiency(front, site)
		_.extend(site.fronts[direction], front)

		setToMostEfficientFront(front, site)

		return front;
}
function setFrontBaseStats(front, site){
		if(site.isMine){
			front.frontProductionLostOnTheWay += front.production;
			front.producedOnTheWay += front.productionTo
			front.productionTo += site.production
			front.strengthTo += site.strength
			front.distanceTo += 1
		}else{
			front.frontProductionLostOnTheWay = 0;
			front.producedOnTheWay = 0;
			front.productionTo = 0
			front.strengthTo = 0
			front.distanceTo = 0

			front.site = site
			front.strength = site.strength
			front.production = site.production
		}

		front.strengthOnArrival = front.strengthTo + front.producedOnTheWay;
}
function setFrontCanCapture(front, site){
	if(!front.site){
		return front.canCapture = false;
	}
	if(front.site.isHostile){
		return front.canCapture = true
	}

	front.canCapture = front.strengthOnArrival > front.strength
	front.alreadyCanCapture = (front.strengthOnArrival-site.strength) > front.strength
}

function setFrontDistanceToHostile(front, site){
		if(site.isHostile){
			front.distanceToHostile = 0
		}else{
			front.distanceToHostile++;
		}

		if(_.isUndefined(site.distanceToHostile) || front.distanceToHostile<site.distanceToHostile){
			site.distanceToHostile = front.distanceToHostile
		}else{
			front.distanceToHostile = site.distanceToHostile
		}
}

function setFrontEfficiency(front, site){
	if(!site.isMine){return;}

	const frontValue = front.production + constants.baseTileValue

	const pressureToStayLocal = 0;
	const frontCost = front.strength + front.productionTo + front.frontProductionLostOnTheWay + pressureToStayLocal
	front.efficiency = frontValue/frontCost
}

function setToMostEfficientFront(front, site){
	if(!site.isMine){return;}
	// if(front.alreadyCanCapture){return;}
	if(!site.mostEfficientFront || front.efficiency>site.mostEfficientFront.efficiency){
		site.mostEfficientFront = _.clone(front);
	}else{
		_.extend(front, site.mostEfficientFront);
	}
}


const defaultFrontState = {
	frontProductionLostOnTheWay: 0,
	producedOnTheWay: 0,
	productionTo: 0,
	strengthTo: 0,
	distanceTo: Infinity,
	distanceToHostile: Infinity,
	strengthOnArrival: 0,
	path: [],
};

// Double loop in all directions
// First loop sets closest gray square Location (if any)
// Second lop sets distance to gray square
function setXFronts(gameMap){
	let site;
	const doubleWidth = gameMap.width*2;

	let frontState;
	for(let y=0; y<gameMap.height; y++){

		frontState = _.clone(defaultFrontState);
		for(let x=0; x<doubleWidth; x++){
			site = gameMap.getSite({x,y});
			setFrontState(frontState, site, 'west');
		}

		frontState = _.clone(defaultFrontState);
		for(let x=doubleWidth-1; x>=0; x--){
			site = gameMap.getSite({x,y});
			setFrontState(frontState, site, 'east');
		}
	}
}

function setYFronts(gameMap){
	let site;
	const doubleHeight = gameMap.height*2;

	let frontState;
	for(let x=0; x<gameMap.width; x++){

		frontState = _.clone(defaultFrontState);
		for(let y=0; y<doubleHeight; y++){
			site = gameMap.getSite({x,y});
			setFrontState(frontState, site, 'north');
		}

		frontState = _.clone(defaultFrontState);
		for(let y=doubleHeight-1; y>=0; y--){
			site = gameMap.getSite({x,y});
			setFrontState(frontState, site, 'south');
		}
	}
}







