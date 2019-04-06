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
        this.science_++;
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
        this.business_++;
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

  commerceWithOther(items) {
    return new Promise((resolve, reject) => {
      if (
        this.merchant_ > 0 &&
        typeof items === 'object' &&
        !Array.isArray(items)
      ) {
        this.merchant_--;
        let increase = 0;
        const props = Object.getOwnPropertyNames(items);

        // The more you give the more you get
        for (const item in props) {
          if (
            Object.prototype.hasOwnProperty.call(
              this.localRessources_,
              props[item]
            ) &&
            this.localRessources_[item] >= items[item]
          ) {
            this.localRessources_[item] -= items[item];
            increase += items[item];
          }
        }

        let alive = true;

        // Merchant left
        this.worldEvents.emit('commerceEngaged', {
          population: this.population_,
          merchant: this.merchant_
        });

        // Merchant come back if not dead
        setTimeout(() => {
          if (Math.random() < 0.9) {
            this.merchant_++;
            for (const prop in this.localRessources_) {
              if (
                Object.prototype.hasOwnProperty.call(
                  this.localRessources_,
                  prop
                )
              ) {
                const chances = Math.random();
                if (chances > 0.9 - increase / 10) {
                  this.localRessources_[prop][0] += 3;
                } else if (chances > 0.8 - increase / 10) {
                  this.localRessources_[prop][0] += 2;
                } else if (chances > 0.7 - increase / 10) {
                  this.localRessources_[prop][0] += 1;
                }
              }
            }
          } else {
            this.population_--;
            this.business_--;
            this.hapiness_--;
            alive = false;
          }

          this.worldEvents.emit('hasCommerce', {
            alive: alive,
            population: this.population_,
            merchant: this.merchant_
          });
        }, this.timeFactor_ * 2);

        resolve();
      } else if (this.merchant_ === 0) {
        reject(new Error("You don't have any merchant left."));
      } else {
        reject(new Error('Wrong parameter, must be an object.'));
      }
    });
  }

  addGold(qt) {
    return new Promise((resolve, reject) => {
      if (typeof qt === 'number') {
        if (this.gold_ + qt > 0) {
          this.gold_ += qt;
        } else {
          this.gold_ = 0;
        }

        resolve();
      } else {
        reject(new Error('Wrong parameter type'));
      }
    });
  }

  addCorn(qt) {
    return new Promise((resolve, reject) => {
      if (typeof qt === 'number') {
        if (this.corn_ + qt > 0) {
          this.corn_ += qt;
        } else {
          this.corn_ = 0;
        }

        resolve();
      } else {
        reject(new Error('Wrong parameter type'));
      }
    });
  }

  addPopulation(qt) {
    return new Promise((resolve, reject) => {
      if (typeof qt === 'number') {
        if (this.population_ + qt > 0) {
          this.population_ += qt;

          while (
            this.population_ <
            this.scientist_ + this.merchant_ + 3 * this.soldiers_.length
          ) {
            // Random kill if too many
            if (Math.random() < 0.7 && this.soldiers_.length > 0) {
              clearTimeout(this.soldiers_[this.soldiers_.length - 1]);
              this.soldiers_.pop();
            } else if (Math.random() > 0.5 && this.merchant_ > 0) {
              this.merchant_--;
              this.business_--;
            } else if (this.scientist_ > 0) {
              this.science_--;
              this.scientist_--;
            }
          }
        } else {
          this.population_ = 0;
          this.soldiers_ = [];
          this.merchant_ = 0;
          this.scientist_ = 0;
        }

        resolve();
      } else {
        reject(new Error('Wrong parameter type'));
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
