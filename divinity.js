// Call event emitter (Node JS module)
// https://www.w3schools.com/nodejs/ref_events.asp
const EventEmitter = require('events');

class Divinity {
  // Ctor
  constructor(name, timeFactor) {
    // Given by user. If none give it a default value
    this.name_ = name || 'UNKDIVINITY';
    this.timeFactor_ = timeFactor || 1000;
    // Init other parameters : No corn no gold at start
    this.corn_ = 0;
    this.gold_ = 0;
    // Launch RNG \O/
    this.worldEvents_ = new EventEmitter();
  }

  // 'Kay lets start
  init() {
    // Repeat the following at each timeFactor
    this.gaiaInterval_ = setInterval(() => {
      // Emit a favor with 10% of divinity's current gold and corn ??
      this.worldEvents.emit('favor', {
        corn: this.corn * 0.1,
        gold: this.gold * 0.1
      });

      // Can have a blessing
      if (Math.random() > 0.95) {
        // Gives oorn and gold ?
        this.worldEvents.emit('blessing', {
          corn: 100 * this.corn,
          gold: 100 * this.gold
        });
      }

      // Or retribution !
      if (Math.random() > 0.99) {
        this.worldEvents.emit('retribution', Math.floor(10000 * Math.random()));
      }
    }, this.timeFactor); // The time factor :)
  }

  // Divinity getting corn
  offeringCorn(offer) {
    return new Promise((resolve, reject) => {
      // Argument has to be a number
      if (typeof offer === 'number') {
        setTimeout(() => {
          // So I give you less 1 you erase all your corn
          this.corn_ = offer >= 0 ? this.corn + offer : 0;
          resolve();
        }, 4 * this.timeFactor * Math.random());
      } else {
        reject(
            new Error(
                `You didn't gave a number of corn to ${this.name}, Earth collapsed`
            )
        );
      }
    });
  }

  // Same as offering Corn
  offeringGold(offer) {
    return new Promise((resolve, reject) => {
      if (typeof offer === 'number') {
        setTimeout(() => {
          this.gold_ = offer >= 0 ? this.gold + offer : 0;
          resolve();
        }, 4 * this.timeFactor * Math.random());
      } else {
        reject(
            new Error(
                `You didn't gave a number of gold to ${this.name}, Earth collapsed`
            )
        );
      }
    });
  }

  // Getters
  get corn() {
    return this.corn_;
  }

  get gold() {
    return this.gold_;
  }

  get worldEvents() {
    return this.worldEvents_;
  }

  get name() {
    return this.name_;
  }

  get timeFactor() {
    return this.timeFactor_;
  }

  // Apukalips (stop the repeating RNG)
  endWorld() {
    clearInterval(this.gaiaInterval_);
  }
}

module.exports = {Divinity};
