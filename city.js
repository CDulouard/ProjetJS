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

  convertToScientist() {
    return new Promise((resolve, reject) => {
      if (
        this.population_ >
          this.scientist_ + this.soldiers_.length * 3 + this.merchant_ &&
        this.corn_ > 40
      ) {
        this.scientist_++;
        this.corn_ -= 40;
        resolve();
      } else {
        reject(
          new Error(
            `Not enough ressources. You need 1 population and 40 corn. Current population available : ${
              this.population_
            }. Current corn : ${this.corn_}.`
          )
        );
      }
    });
  }

  convertToMerchant() {
    return new Promise((resolve, reject) => {
      if (
        this.population_ >
          this.scientist_ + this.soldiers_.length * 3 + this.merchant_ &&
        this.gold_ > 40
      ) {
        this.merchant_++;
        this.gold_ -= 40;
        resolve();
      } else {
        reject(
          new Error(
            `Not enough ressources. You need 1 population and 40 gold. Current population available : ${
              this.population_
            }. Current gold : ${this.gold_}.`
          )
        );
      }
    });
  }

  enroleSoldiers() {
    return new Promise((resolve, reject) => {
      if (
        this.population_ >
          this.scientist_ + this.soldiers_.length * 3 + this.merchant_ + 3 &&
        this.gold_ > 30 &&
        this.corn_ > 30
      ) {
        this.gold_ -= 30;
        this.corn_ -= 30;

        const pos = this.soldiers_.length;

        // Set death after certain time (only 4 cycles here to avoid timeout in tests)
        this.soldiers_.push(
          setTimeout(() => {
            this.soldiers_.splice(pos, 1);
            this.worldEvents.emit('soldierDeath', {
              soldiers: this.soldiers_.length
            });
          }, this.timeFactor_ * 4)
        );

        resolve();
      } else {
        reject(
          new Error(
            `Not enough ressources. You need 3 population, 30 corn and 30 gold. Current population available : ${
              this.population_
            }. Current corn : ${this.corn_} Current gold : ${this.gold_}.`
          )
        );
      }
    });
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
