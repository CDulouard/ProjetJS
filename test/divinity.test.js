const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {Divinity} = require('../divinity');

chai.use(chaiAsPromised);
chai.should();

// Where is this file ?
describe('world-worldEvents_.js', () => {
  // Phase 1 : test the events
  describe('worldEvents', () => {
    // Store the divinity
    let g;

    // Execute before the test starts
    before(() => {
      // Create new divinity and init it (set a repeating function that will launch random events)
      g = new Divinity('test', 1);
      g.init();
    });

    // Stop the generation of events
    after(() => {
      g.endWorld();
    });

    // Wait for a favor to be emitted
    it('should have emitted favor', async () => {
      await new Promise(resolve => {
        // When g emits a favor
        g.worldEvents.on('favor', favor => {
          // We should have no more corn nor gold than before (cuz we start at 0)
          favor.corn.should.be.equal(0);
          favor.gold.should.be.equal(0);
          resolve();
        });
      });
    });

    // Same : wait for blessing event
    it('should have emitted blessed', async () => {
      await new Promise(resolve => {
        g.worldEvents.on('blessing', blessing => {
          blessing.corn.should.be.equal(0);
          blessing.gold.should.be.equal(0);
          resolve();
        });
      });
    });

    it('should have emitted retribution', async () => {
      await new Promise(resolve => {
        g.worldEvents.on('retribution', retribution => {
          retribution.should.be.above(-1);
          retribution.should.be.below(10000);
          resolve();
        });
      });
    });
  });

  // Phase 2 : test the divinity
  describe('Divinity', () => {
    let g;

    // No events this time
    before(() => {
      g = new Divinity('test', 1);
    });

    after(() => {
      g.endWorld();
    });

    it("should update divinity's corn", async () => {
      // At beginning, no corn
      g.corn.should.be.equal(0);

      // I give you 100, you get 100
      await g.offeringCorn(100);
      g.corn.should.be.equal(100);

      await g.offeringCorn(1000);
      g.corn.should.be.equal(1100);

      await g.offeringCorn(-1);
      g.corn.should.be.equal(0);

      await g
        .offeringCorn('aze')
        .should.be.rejectedWith(
          Error,
          /You didn't gave a number of corn to \b[a-zA-Z].*, Earth collapsed/
        );
    });

    it("should update divinity's gold", async () => {
      g.gold.should.be.equal(0);

      await g.offeringGold(100);
      g.gold.should.be.equal(100);

      await g.offeringGold(1000);
      g.gold.should.be.equal(1100);

      await g.offeringGold(-1);
      g.gold.should.be.equal(0);

      await g
        .offeringGold('aze')
        .should.be.rejectedWith(
          Error,
          /You didn't gave a number of gold to \b[a-zA-Z].*, Earth collapsed/
        );
    });
  });

  // Phase 3 : FULL MODE
  describe('Updated values for Favor and Blessings', () => {
    it('should have modified the values for favor', async () => {
      // Create new divinity
      const g = new Divinity('test', 1);

      // No corn no gold until I give you some
      g.corn.should.be.equal(0);
      g.gold.should.be.equal(0);
      await Promise.all([g.offeringCorn(100), g.offeringGold(1000)]);

      // Launch events
      g.init();

      await new Promise(resolve => {
        g.worldEvents.on('favor', favor => {
          // Favor gives 10% of divinity's gold n corn
          favor.corn.should.be.equal(10);
          favor.gold.should.be.equal(100);
          // End the world
          g.endWorld();
          resolve();
        });
      });
    });

    it('should have modified the values for blessings', async () => {
      const g = new Divinity('test', 1);

      g.corn.should.be.equal(0);
      g.gold.should.be.equal(0);
      await Promise.all([g.offeringCorn(100), g.offeringGold(1000)]);

      g.init();

      await new Promise(resolve => {
        g.worldEvents.on('blessing', blessing => {
          // Blessing is hundred times divinity's gold and corn
          blessing.corn.should.be.equal(10000);
          blessing.gold.should.be.equal(100000);
          g.endWorld();
          resolve();
        });
      });
    });
  });
});
