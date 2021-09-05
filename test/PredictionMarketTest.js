const { expect } = require("chai");

describe("PredictionMarket Contract", function () {
  const marketName = "FirstMarket";
  const choice = "yes";
  const wantedShares = 12;

  beforeEach(async function () {
    usdToken = await ethers.getContractFactory("UsdToken");
    poolToken = await ethers.getContractFactory("PoolToken");
    predictionMarket = await ethers.getContractFactory("PredictionMarketOps");

    const network = "homestead"; // The mainnet
    provider = ethers.getDefaultProvider(network, {
      infura: 'b51a92ba9a4f4092aa548938d47cb402',
    });

    const endingDate = new Date('2021-08-20T23:59:59Z').getTime() / 1000;

    [marketOwner, userOne, userTwo, ...address] = await ethers.getSigners();
  
    usdToken = await usdToken.deploy(1);

    poolToken = await poolToken.deploy(1);
    
    predictionMarket = await predictionMarket.deploy(marketName, endingDate, usdToken.address, poolToken.address, usdToken.decimals(), 2);
    poolToken.rely(predictionMarket.address);
    
  });

  describe("Deployment", function() {
    it("Should set up market correctly", async function() {
      expect(await predictionMarket.marketName()).to.equal(marketName);
      //expect(await predictionMarket.checkIfTheMarketIsClosed()).to.equal(false);
    });
  });

  describe("Betting", function() {
    it("Should be able to implement stablecoin token", async function() {
      usdToken.mint(userOne.address, "50000000000000000000");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userOne.address))).to.equal("50.0");
      //mel bych tu dodelat vsechny testy jako approve a tak
    });
    it("Should be able to implement pool token", async function() {
      poolToken.mint(userOne.address, "50000000000000000000");
      expect(ethers.utils.formatEther(await poolToken.balanceOf(userOne.address))).to.equal("50.0");
      //mel bych tu dodelat vsechny testy jako approve a tak
    });
    it("Should be able to approve erc-20 token", async function() {
      await usdToken.connect(userOne).approve(predictionMarket.address, "10000000000000000000");
      expect(ethers.utils.formatEther(await usdToken.allowance(userOne.address, predictionMarket.address))).to.equal("10.0");
    });
    it("Should be able to provide liquidity", async function() {
      usdToken.mint(userOne.address, "10000000000000000000");
      usdToken.connect(userOne).approve(predictionMarket.address, "10000000000000000000");
      await predictionMarket.connect(userOne).addLiquidity("10000000000000000000");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userOne.address))).to.equal("0.0");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(predictionMarket.address))).to.equal("10.0");
      expect(ethers.utils.formatEther(await poolToken.totalSupply())).to.equal("10.0");
      expect(ethers.utils.formatEther(await poolToken.balanceOf(userOne.address))).to.equal("10.0");
      expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("10.0");
      expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("10.0");
      const lpStruct = await predictionMarket.liquidityProviders(0);
      expect(ethers.utils.formatEther(lpStruct.providedLiquidity)).to.equal("10.0");
      expect(lpStruct.lpAddress).to.equal(userOne.address);
    });
    it("NEW Should be able to buy shares", async function() {
      usdToken.mint(marketOwner.address, "50000000000000000000");
      usdToken.mint(userOne.address, "10000000000000000000");
      usdToken.mint(userTwo.address, "100000000000000000001");
      usdToken.approve(predictionMarket.address, "50000000000000000000");
      usdToken.connect(userOne).approve(predictionMarket.address, "10000000000000000000");
      usdToken.connect(userTwo).approve(predictionMarket.address, "10000000000000000000");
      await predictionMarket.connect(userOne).addLiquidity("10000000000000000000");
      await predictionMarket.addLiquidity("5000000000000000000");  
      await predictionMarket.connect(userTwo).buySharesNew(choice, "2500000000000000000");
      
    });
    it("Should be able to buy shares", async function() {
      usdToken.mint(marketOwner.address, "50000000000000000000");
      usdToken.approve(predictionMarket.address, "20000000000000000000");
      await predictionMarket.buyShares(choice, wantedShares);
      
      if (choice == "yes") {
        expect(await predictionMarket.yesSharesPerAddress(marketOwner.address)).to.equal(wantedShares);
      } else if (choice == "no") {
        expect(await predictionMarket.noSharesPerAddress(marketOwner.address)).to.equal(wantedShares);
      }
      
      //TOHLE ODMAZAT KOMENT, JEN TESTUJU
      //expect(ethers.utils.formatEther(await usdToken.balanceOf(predictionMarket.address))).to.equal("9.819866244866244852");
      //expect(ethers.utils.formatEther(await usdToken.balanceOf(marketOwner.address))).to.equal("40.180133755133755148");
    });
    it("Should be able to sell shares", async function() {
      usdToken.mint(marketOwner.address, "50000000000000000000");
      usdToken.approve(predictionMarket.address, "20000000000000000000");
      await predictionMarket.buyShares(choice, wantedShares);
      await predictionMarket.sellShares(choice, wantedShares);
      
      if (choice == "yes") {
        //TOHLE ODMAZAT KOMENT, JEN TESTUJU
        //expect(await predictionMarket.yesSharesPerAddress(marketOwner.address)).to.equal(0);
      } else if (choice == "no") {
        //TOHLE ODMAZAT KOMENT, JEN TESTUJU
        //expect(await predictionMarket.noSharesPerAddress(marketOwner.address)).to.equal(0);
      }
      
      //TOHLE ODMAZAT KOMENT, JEN TESTUJU
      //expect(ethers.utils.formatEther(await usdToken.balanceOf(predictionMarket.address))).to.equal("0.0");
      //expect(ethers.utils.formatEther(await usdToken.balanceOf(marketOwner.address))).to.equal("50.0");
    });
    /*
    it("Should be able to ...", async function() {
      usdToken.mint(marketOwner.address, "50000000000000000000");
      usdToken.mint(userOne.address, "50000000000000000000");
      usdToken.approve(predictionMarket.address, "50000000000000000000");
      usdToken.connect(userOne).approve(predictionMarket.address, "50000000000000000000");
      //console.log("v kontraktu je:",await usdToken.balanceOf(predictionMarket.address));
      
      console.log(ethers.utils.formatEther(await usdToken.connect(marketOwner).balanceOf(marketOwner.address)));
      await predictionMarket.connect(marketOwner).buyShares(choice, 10);
      console.log(ethers.utils.formatEther(await usdToken.connect(marketOwner).balanceOf(marketOwner.address)));
      //await predictionMarket.connect(marketOwner).buyShares(choice, 25);
      console.log(ethers.utils.formatEther(await usdToken.connect(marketOwner).balanceOf(marketOwner.address)));
      await predictionMarket.connect(userOne).buyShares("no", 40);
      //await predictionMarket.sellShares(choice, 13);
      //await predictionMarket.buyShares("no", 8);
      //console.log("v kontraktu je:",await usdToken.balanceOf(predictionMarket.address));
      await predictionMarket.chooseWinningSide("no");
      await predictionMarket.connect(userOne).claimUsd();
    });
    */
    
  });

});
