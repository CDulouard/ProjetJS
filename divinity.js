const EventEmitter = require('events');


class Divinity {
  constructor(name, timeFactor) {
    this.name_ = name || 'UNKDIVINITY';
    this.corn_ = 0;
    this.gold_ = 0;
    this.worldEvents_ = new EventEmitter();
    this.timeFactor_ = timeFactor || 1000;
  }

  init() {
    this.gaiaInterval_ = setInterval(() => {
      this.worldEvents.emit('favor', {
        corn: this.corn * 0.1,
        gold: this.gold * 0.1
      });

      if (Math.random() > 0.95) {
        this.worldEvents.emit('blessing', {
          corn: 100 * this.corn,
          gold: 100 * this.gold
        });
      }

      if (Math.random() > 0.99) {
        this.worldEvents.emit('retribution', Math.floor(10000 * Math.random()));
      }
    }, this.timeFactor);
  }

  offeringCorn(offer) {
    return new Promise((resolve, reject) => {
      if (typeof offer === 'number') {
        setTimeout(() => {
          this.corn_ = (offer >= 0) ? this.corn + offer : 0;
          resolve();
        }, 4 * this.timeFactor * Math.random());
      } else {
        reject(new Error(
          `You didn't gave a number of corn to ${this.name}, Earth collapsed`
        ));
      }
    });
  }

  offeringGold(offer) {
    return new Promise((resolve, reject) => {
      if (typeof offer === 'number') {
        setTimeout(() => {
          this.gold_ = (offer >= 0) ? this.gold + offer : 0;
          resolve();
        }, 4 * this.timeFactor * Math.random());
      } else {
        reject(new Error(
          `You didn't gave a number of gold to ${this.name}, Earth collapsed`
        ));
      }
    });
  }

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

  endWorld() {
    clearInterval(this.gaiaInterval_);
  }
}

module.exports = {Divinity};
