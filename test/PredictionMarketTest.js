const { expect } = require("chai");

describe("PredictionMarket Contract", function () {
  const marketName = "FirstMarket";
  const choice = "no";
  const wantedShares = 12;
  const providerFee = 2;

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
    
    predictionMarket = await predictionMarket.deploy(marketName, endingDate, usdToken.address, poolToken.address, usdToken.decimals(), providerFee);
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
      await predictionMarket.connect(userTwo).buyShares(choice, "2500000000000000000");
      const lpStruct = await predictionMarket.liquidityProviders(0);
      expect(ethers.utils.formatEther(lpStruct.earnedProvision)).to.equal("0.05");
      if(choice == "yes"){
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address))).to.equal("4.5");
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("8.0");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("12.5");
      } else {
        expect(ethers.utils.formatEther(await predictionMarket.noSharesPerAddress(userTwo.address))).to.equal("4.5");
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("12.5");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("8.0");
      }
    });
    it("NEW Should be able to sell shares", async function() {
      usdToken.mint(marketOwner.address, "50000000000000000000");
      usdToken.mint(userOne.address, "100000000000000000000");
      usdToken.mint(userTwo.address, "100000000000000000001");
      usdToken.approve(predictionMarket.address, "50000000000000000000");
      usdToken.connect(userOne).approve(predictionMarket.address, "100000000000000000000");
      usdToken.connect(userTwo).approve(predictionMarket.address, "10000000000000000000");
      await predictionMarket.connect(userOne).addLiquidity("100000000000000000000");
      await predictionMarket.connect(userTwo).buyShares(choice, "2500000000000000000");
      await predictionMarket.connect(userTwo).sellShares(choice, "4939024390243902440");
      const lpStruct = await predictionMarket.liquidityProviders(0);
      expect(ethers.utils.formatEther(lpStruct.earnedProvision)).to.equal("0.148780487804878048");
      expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address))).to.equal("0.0");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userTwo.address))).to.equal("99.820731707317073173");
      if(choice == "yes"){
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("99.96952148735141725");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("100.03048780487804878");
      } else {
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("100.03048780487804878");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("99.96952148735141725");
      }
      
    });
    it("NEW Should be able to add liquidity based on new market ratio", async function() {
      usdToken.mint(marketOwner.address, "50000000000000000000");
      usdToken.mint(userOne.address, "10000000000000000000");
      usdToken.mint(userTwo.address, "100000000000000000001");
      usdToken.approve(predictionMarket.address, "50000000000000000000");
      usdToken.connect(userOne).approve(predictionMarket.address, "10000000000000000000");
      usdToken.connect(userTwo).approve(predictionMarket.address, "10000000000000000000");
      await predictionMarket.connect(userOne).addLiquidity("10000000000000000000");
      await predictionMarket.connect(userTwo).buyShares(choice, "2500000000000000000");
      await predictionMarket.addLiquidity("10000000000000000000");  
      const lpStruct = await predictionMarket.liquidityProviders(1);
      expect(ethers.utils.formatEther(lpStruct.earnedProvision)).to.equal("0.0");
      if(choice == "yes"){
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("14.4");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("22.5");
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address))).to.equal("4.5");
      } else {
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("22.5");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("14.4");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesPerAddress(userTwo.address))).to.equal("4.5");
      }
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
