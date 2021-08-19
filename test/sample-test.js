const { expect } = require("chai");

describe("PredictionMarket Contract", function () {
  const marketName = "FirstMarket";
  const choice = "yes";
  const wantedShares = 12;

  beforeEach(async function () {
    usdToken = await ethers.getContractFactory("UsdToken");
    predictionMarket = await ethers.getContractFactory("PredictionMarket");

    provider = ethers.getDefaultProvider();

    [creator, signer, receiver, ...address] = await ethers.getSigners();
  
    usdToken = await usdToken.deploy(1);
    
    predictionMarket = await predictionMarket.deploy(marketName, 46465465465456, usdToken.address, usdToken.decimals());
    
  });

  describe("Deployment", function() {
    it("Should set up market name correctly", async function() {
      expect(await predictionMarket.marketName()).to.equal(marketName);
    });
  });

  describe("Betting", function() {
    it("Should be able to implement erc-20 token", async function() {
      usdToken.mint(creator.address, "50000000000000000000");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(creator.address))).to.equal("50.0");
    });
    it("Should be able to approve erc-20 token", async function() {
      usdToken.approve(predictionMarket.address, "10000000000000000000");
      expect(ethers.utils.formatEther(await usdToken.allowance(creator.address, predictionMarket.address))).to.equal("10.0");
    });
    it("Should be able to buy shares", async function() {
      usdToken.mint(creator.address, "50000000000000000000");
      usdToken.approve(predictionMarket.address, "10000000000000000000");
      await predictionMarket.buyShares(choice, wantedShares);
      
      if (choice == "yes") {
        expect(await predictionMarket.yesSharesPerAddress(creator.address)).to.equal(wantedShares);
      } else if (choice == "no") {
        expect(await predictionMarket.noSharesPerAddress(creator.address)).to.equal(wantedShares);
      }
      
      expect(ethers.utils.formatEther(await usdToken.balanceOf(predictionMarket.address))).to.equal("9.819866244866244852");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(creator.address))).to.equal("40.180133755133755148");
    });
    it("Should be able to sell shares", async function() {
      usdToken.mint(creator.address, "50000000000000000000");
      usdToken.approve(predictionMarket.address, "10000000000000000000");
      await predictionMarket.buyShares(choice, wantedShares);
      await predictionMarket.sellShares(choice, wantedShares);
      
      if (choice == "yes") {
        expect(await predictionMarket.yesSharesPerAddress(creator.address)).to.equal(0);
      } else if (choice == "no") {
        expect(await predictionMarket.noSharesPerAddress(creator.address)).to.equal(0);
      }
      
      expect(ethers.utils.formatEther(await usdToken.balanceOf(predictionMarket.address))).to.equal("0.0");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(creator.address))).to.equal("50.0");
    });
    it("Should be able to calculate ratio", async function() {
      //await predictionMarket.betOnMarket(choice, {value: ethers.utils.parseEther(valueDeposited)});
      //await predictionMarket.getBettingRatio();
      //expect(await predictionMarket.getBalance()).to.equal(ethers.utils.parseEther(valueDeposited));
    });
    
  });

});
