const EventEmitter = require('events');
const {Divinity} = require('./divinity');

class City {
  // Ctor
  constructor(name, associatedDivinity, timeFactor) {
    this.name_ = name || 'Farmer Village';
    this.timeFactor_ = timeFactor || 10;

    this.population_ = 10;
    this.gold_ = 100;
    this.corn_ = 100;
    this.growthFactor_ = 1;
    this.hapiness_ = 15;
    this.science_ = 10;
    this.business_ = 10;
    this.soldiers_ = [];
    this.scientist_ = 1;
    this.merchant_ = 1;
    this.localRessources_ = {
      diamond: [0, 0],
      iron: [0, 2],
      lapis: [0, 0],
      horses: [0, 1]
    };

    this.god_ = new Divinity(
      associatedDivinity || this.name_ + ' divinity',
      this.timeFactor_ * 100
    );

    this.worldEvents = new EventEmitter();
  }

  init() {
    // Haven't linked city's life to its god events yet
    // This.god_.init();

    // Update ressources every cycle
    this.ressourcesInterval = setInterval(() => {
      this.corn_ +=
        this.population_ * this.growthFactor_ * (this.science_ / 10);

      this.gold_ +=
        this.population_ * this.growthFactor_ * (this.business_ / 10) +
        this.hapiness_ * 2;

      // Update local ressources
      for (const prop in this.localRessources_) {
        if (Object.prototype.hasOwnProperty.call(this.localRessources_, prop)) {
          this.localRessources_[prop][0] += this.localRessources_[prop][1];
        }
      }

      // Emit the taxes collection
      this.worldEvents.emit('taxes', {
        corn: this.corn_,
        gold: this.gold_,
        localRessources: this.localRessources
      });
    }, this.timeFactor_);

    // Update population only every 10 cycles
    this.populationInterval = setInterval(() => {
      if (this.hapiness_ >= 0) {
        this.population_++;
        this.hapiness_--;
      } else {
        if (this.population_ > 0) this.population_--;
        if (this.population_ > 0) this.population_--;
        this.hapiness_++;
      }

      this.worldEvents.emit('birth', {
        population: this.population_,
        hapiness: this.hapiness_
      });
    }, 10 * this.timeFactor_);
  }

  get population() {
    return this.population_;
  }

  get gold() {
    return this.gold_;
  }

  get corn() {
    return this.corn_;
  }

  get scientist() {
    return this.scientist_;
  }

  get merchant() {
    return this.merchant_;
  }

  get soldiers() {
    return this.soldiers_;
  }

  get god() {
    return this.god_.name;
  }

  // Returns an object
  get localRessources() {
    return this.localRessources_;
  }

  endWorld() {
    clearInterval(this.ressourcesInterval);
    clearInterval(this.populationInterval);
    this.god_.endWorld();
  }
}

module.exports = {City};
