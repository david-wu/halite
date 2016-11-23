const STILL = 0;
const NORTH = 1;
const EAST  = 2;
const SOUTH = 3;
const WEST  = 4;

const DIRECTIONS = [STILL, NORTH, EAST, SOUTH, WEST];
const CARDINALS = [NORTH, EAST, SOUTH, WEST];

const ATTACK = 0;
const STOP_ATTACK = 1;

class Location {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Site {
  constructor(owner = 0, strength = 0, production = 0) {
    this.owner = owner;
    this.strength = strength;
    this.production = production;
  }
  pos(){
    return [this.x, this.y]
  }

}

class Move {
  constructor(loc = new Location(), direction = STILL) {
    this.loc = loc;
    this.direction = direction;
  }
}

class GameMap {
  constructor(myId, width=0, height=0, numberOfPlayers=0) {
    this.myId = myId;
    this.width = width;
    this.height = height;
    this.numberOfPlayers = numberOfPlayers;
    this.contents = [];

    for(let y = 0; y < this.height; y++){
      const row = [];
      for(let x = 0; x < this.width; x++){
        row.push(new Site(0, 0, 0));
      }
      this.contents.push(row);
    }

    // this.initSites();
  }

  initSites(){
    let site;
    for(let y=0; y<this.height; y++){
      for(let x=0; x<this.width; x++){
        site = this.contents[y][x];
        site.x = x;
        site.y = y;
        site.isMine = site.owner===this.myId;
        site.fronts = {
          north: {key: 'north', index:1},
          east: {key: 'east', index:2},
          south: {key: 'south', index:3},
          west: {key: 'west', index:4}
        }
        site.gameMap = this;
      }
    }
  }

  eachMySites(iteratee){
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const site = this.getSite({x,y});
        if(site.isMine){
          iteratee(site);
        }
      }
    }
  }

  inBounds(l) {
    return l.x >= 0 && l.x < this.width && l.y >= 0 && l.y < this.height;
  }

  getDistance(l1, l2) {
    let dx = Math.abs(l1.x - l2.x);
    let dy = Math.abs(l1.y - l2.y);

    if (dx > (this.width / 2)) {
      dx = this.width - dx;
    }

    if (dy > (this.height / 2)) {
      dy = this.height - dy;
    }

    return dx + dy;
  }

  getAngle(l1, l2) {
    let dx = l2.x - l1.x;
    let dy = l2.y - l1.y;

    if (dx > (this.width - dx)) {
      dx -= this.width;
    } else if (-dx > (this.width + dx)) {
      dx += this.width;
    }

    if (dy > (this.height - dy)) {
      dy -= this.height;
    } else if (-dy > (this.height + dy)) {
      dy += this.height;
    }

    return Math.atan2(dy, dx);
  }

  getSite(l, direction = STILL) {
    const { x, y } = this.getLocation(l, direction);
    return this.contents[y][x];
  }

  getLocation(loc, direction) {
    let { x, y } = loc;
    if (direction === STILL) {
      // nothing
    } else if (direction === NORTH) {
      y -= 1;
    } else if (direction === EAST) {
      x += 1;
    } else if (direction === SOUTH) {
      y += 1;
    } else if (direction === WEST) {
      x -= 1;
    }

    if (x < 0) {
      x = this.width - 1;
    } else {
      x %= this.width;
    }

    if (y < 0) {
      y = this.height - 1;
    } else {
      y %= this.height;
    }

    while(x >= this.width){
      x = x-this.width;
    }
    while(y >= this.height){
      y = y-this.height;
    }

    return { x, y };
  }

}

module.exports = {
  STILL,
  NORTH,
  EAST,
  SOUTH,
  WEST,
  DIRECTIONS,
  CARDINALS,
  ATTACK,
  STOP_ATTACK,
  Location,
  Site,
  Move,
  GameMap
};
