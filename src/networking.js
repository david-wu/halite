const EventEmitter = require('events');
const readline = require('readline');
const GameMap = require('./GameMap.js');

class Networking extends EventEmitter {
  constructor(botName) {
    super();

    this.messageCount = 0;
    this.width = 0;
    this.height = 0;
    this.productions = [];

    this.rl = readline.createInterface({
      input: process.stdin
    });

    this.rl.on('line', (line) => {
      switch (this.messageCount++) {
        case 0:
          // first line is the player ID
          this.id = parseInt(line, 10);
          break;
        case 1:
          // second line is the map dimensions
          this.deserializeMapSize(line);
          break;
        case 2:
          // third line is the productions
          this.deserializeProductions(line);
          break;
        case 3:
          // fourth line is the initial map
          break;
        default:
          // everything after is map updates
          return this.emit('map', this.deserializeMap(line, this.id), this.id);
      }
    });

    Networking.sendString(botName);
  }

  sendMoves(moves) {
    Networking.sendString(Networking.serializeMoveSet(moves));
  }

  deserializeMapSize(inputString) {
    [this.width, this.height] = splitToInts(inputString);
  }

  deserializeProductions(inputString) {
    const flatProductions = splitToInts(inputString);
    for (let i = 0; i < this.height; i++) {
      const start = i * this.width;
      const end = (i + 1) * this.width;
      this.productions.push(flatProductions.slice(start, end));
    }
  }

  deserializeMap(inputString, myId) {
    const flatMap = splitToInts(inputString);

    let x = 0;
    let y = 0;
    let counter = 0;
    let owner = 0;
    let rest = flatMap;


    const matrix = []
    for(let y = 0; y < this.height; y++){
      const row = [];
      for(let x = 0; x < this.width; x++){
        row.push({});
      }
      matrix.push(row);
    }


    while (y !== this.height) {
      [counter, owner, ...rest] = rest;
      for (let i = 0; i < counter; i++) {
        matrix[y][x].owner = owner;
        x += 1;
        if (x === this.width) {
          x = 0;
          y += 1;
        }
      }
    }

    for (y = 0; y < this.height; y++) {
      for (x = 0; x < this.width; x++) {
        matrix[y][x].x = x;
        matrix[y][x].y = y;
        matrix[y][x].strength = rest.shift();
        matrix[y][x].production = this.productions[y][x];
      }
    }

    return new GameMap({
      myId: myId,
      width: this.width,
      height: this.height,
      contents: matrix
    })
  }
}

Networking.sendString = function sendString(toBeSent) {
  process.stdout.write(`${toBeSent}\n`);
};

Networking.serializeMoveSet = function serializeMoveSet(moves) {
  return moves
    .map((move) => `${move.loc.x} ${move.loc.y} ${move.direction}`)
    .join(' ');
};

function splitToInts(inputString) {
  return inputString.split(' ').map((value) => parseInt(value, 10));
}

module.exports = Networking;
