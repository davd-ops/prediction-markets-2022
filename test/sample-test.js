const { expect } = require("chai");

describe("PredictionMarket Contract", function () {
  const marketName = "FirstMarket";
  const firstChoice = "FirstChoice";
  const secondChoice = "SecondChoice";
  const choice = 0;
  const valueDeposited = "0.1"; // in ether


  beforeEach(async function () {
    PredictionMarket = await ethers.getContractFactory("PredictionMarket");

    provider = ethers.getDefaultProvider();

    [creator, signer, receiver, ...address] = await ethers.getSigners();
  
    hardhatPredictionMarket = await PredictionMarket.deploy(marketName, firstChoice, secondChoice);
  });

  describe("Deployment", function() {
    it("Should set up market and choice names correctly", async function() {
        expect(await hardhatPredictionMarket.marketName()).to.equal(marketName);
        expect(await hardhatPredictionMarket.firstChoice()).to.equal(firstChoice);
        expect(await hardhatPredictionMarket.secondChoice()).to.equal(secondChoice);
    });
  });

  describe("Betting", function() {
    it("Should be able to bet on market", async function() {
        await hardhatPredictionMarket.betOnMarket(choice, {value: ethers.utils.parseEther(valueDeposited)});
        expect(await hardhatPredictionMarket.getBalance()).to.equal(ethers.utils.parseEther(valueDeposited));
    });
  });

});
