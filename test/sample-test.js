const { expect } = require("chai");

describe("PredictionMarket Contract", function () {
  const marketName = "FirstMarket";
  const choice = "yes";
  const valueDeposited = "0.1"; // in ether


  beforeEach(async function () {
    PredictionMarket = await ethers.getContractFactory("PredictionMarket");

    provider = ethers.getDefaultProvider();

    [creator, signer, receiver, ...address] = await ethers.getSigners();
  
    hardhatPredictionMarket = await PredictionMarket.deploy(marketName, 46465465465456);
  });

  describe("Deployment", function() {
    it("Should set up market name correctly", async function() {
        expect(await hardhatPredictionMarket.marketName()).to.equal(marketName);
    });
  });

  describe("Betting", function() {
    it("Should be able to bet on market", async function() {
        await hardhatPredictionMarket.betOnMarket(choice, {value: ethers.utils.parseEther(valueDeposited)});
        expect(await hardhatPredictionMarket.getBalance()).to.equal(ethers.utils.parseEther(valueDeposited));
    });
    it("Should be able to calculate ratio", async function() {
      await hardhatPredictionMarket.betOnMarket(choice, {value: ethers.utils.parseEther(valueDeposited)});
      await hardhatPredictionMarket.getBettingRatio();
      //expect(await hardhatPredictionMarket.getBalance()).to.equal(ethers.utils.parseEther(valueDeposited));
  });
  });

});
