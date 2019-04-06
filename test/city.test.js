const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {City} = require('../city');

chai.use(chaiAsPromised);
chai.should();

// Test equality of 2 objects
const isEquivalent = (a, b) => {
  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length !== bProps.length) {
    return false;
  }

  for (const propName of aProps) {
    // If values of same property are not equal,
    // objects are not equivalent
    const aPVal = a[propName];
    const bPVal = b[propName];

    if (
      !Object.prototype.hasOwnProperty.call(b, propName) ||
      typeof aPVal !== typeof bPVal
    ) {
      return false;
    }

    if (Array.isArray(aPVal)) {
      if (Array.isArray(bPVal)) {
        for (const i in aPVal) {
          if (aPVal[i] !== bPVal[i]) {
            return false;
          }
        }
      } else {
        return false;
      }
    } else if (aPVal !== bPVal) {
      return false;
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
};

// The value of local ressources after one update
const localsOnEvent = {
  diamond: [0, 0],
  iron: [2, 2],
  lapis: [0, 0],
  horses: [1, 1]
};

describe('world-worldEvents_.js', () => {
  // Phase 1 : test the events
  describe('worldEvents', () => {
    let g;

    before(() => {
      g = new City('DatenCity', 'KusoNoTenshi', 100);
      g.init();
    });

    after(() => {
      g.endWorld();
    });

    it('should have emitted taxes', async done => {
      await new Promise(resolve => {
        g.worldEvents.on('taxes', taxes => {
          taxes.corn.should.be.equal(110);
          taxes.gold.should.be.equal(140);
          isEquivalent(taxes.localRessources, localsOnEvent).should.be.equal(
            true
          );
          resolve();
        });
        done();
      });
    });

    it('should have bang and give babyborn', async done => {
      await new Promise(resolve => {
        g.worldEvents.on('birth', birth => {
          birth.population.should.be.equal(11);
          resolve();
        });
        done();
      });
    });
  });
});
