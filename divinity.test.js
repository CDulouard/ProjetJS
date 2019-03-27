const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {Divinity} = require('../divinity');

chai.use(chaiAsPromised);
chai.should();


describe('world-worldEvents_.js', () => {
  describe('worldEvents', () => {
    let g;

    before(() => {
      g = new Divinity('test', 1);
      g.init();
    });

    after(() => {
      g.endWorld();
    });

    it('should have emitted favor', async () => {
      await new Promise(resolve => {
        g.worldEvents.on('favor', favor => {
          favor.corn.should.be.equal(0);
          favor.gold.should.be.equal(0);
          resolve();
        });
      });
    });

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

  describe('Divinity', () => {
    let g;
    before(() => {
      g = new Divinity('test', 1);
    });

    after(() => {
      g.endWorld();
    });

    it('should update divinity\'s corn', async () => {
      g.corn.should.be.equal(0);

      await g.offeringCorn(100);
      g.corn.should.be.equal(100);

      await g.offeringCorn(1000);
      g.corn.should.be.equal(1100);

      await g.offeringCorn(-1);
      g.corn.should.be.equal(0);

      await (g.offeringCorn('aze')).should.be.rejectedWith(Error,
        /You didn't gave a number of corn to \b[a-zA-Z].*, Earth collapsed/);
    });

    it('should update divinity\'s gold', async () => {
      g.gold.should.be.equal(0);

      await g.offeringGold(100);
      g.gold.should.be.equal(100);

      await g.offeringGold(1000);
      g.gold.should.be.equal(1100);

      await g.offeringGold(-1);
      g.gold.should.be.equal(0);

      await (g.offeringGold('aze')).should.be.rejectedWith(Error,
        /You didn't gave a number of gold to \b[a-zA-Z].*, Earth collapsed/);
    });
  });

  describe('Updated values for Favor and Blessings', () => {
    it('should have modified the values for favor', async () => {
      const g = new Divinity('test', 1);

      g.corn.should.be.equal(0);
      g.gold.should.be.equal(0);
      await Promise.all([
        g.offeringCorn(100),
        g.offeringGold(1000)
      ]);

      g.init();

      await new Promise(resolve => {
        g.worldEvents.on('favor', favor => {
          favor.corn.should.be.equal(10);
          favor.gold.should.be.equal(100);
          g.endWorld();
          resolve();
        });
      });
    });

    it('should have modified the values for blessings', async () => {
      const g = new Divinity('test', 1);

      g.corn.should.be.equal(0);
      g.gold.should.be.equal(0);
      await Promise.all([
        g.offeringCorn(100),
        g.offeringGold(1000)
      ]);

      g.init();

      await new Promise(resolve => {
        g.worldEvents.on('blessing', blessing => {
          blessing.corn.should.be.equal(10000);
          blessing.gold.should.be.equal(100000);
          g.endWorld();
          resolve();
        });
      });
    });
  });
});
