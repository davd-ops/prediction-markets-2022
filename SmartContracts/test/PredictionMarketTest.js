const { expect } = require("chai");

describe("PredictionMarket Contract", function () {
  const marketName = "FirstMarket";
  const marketDescription = "FirstMarket will close when A is B";
  const choice = "no";
  const wantedShares = 12;
  const providerFee = 2;
  let endingDate;

  beforeEach(async function () {
    usdToken = await ethers.getContractFactory("UsdToken");
    predictionMarket = await ethers.getContractFactory("PredictionMarketOps");

    const network = "homestead"; // The mainnet
    provider = ethers.getDefaultProvider(network, {
      infura: 'b51a92ba9a4f4092aa548938d47cb402',
    });

    endingDate = new Date('2021-12-24T23:59:59Z').getTime() / 1000;

    [marketOwner, userOne, userTwo, ...address] = await ethers.getSigners();
  
    usdToken = await usdToken.deploy(1);
    
    predictionMarket = await predictionMarket.deploy(marketName, marketDescription, endingDate, usdToken.address, usdToken.decimals(), providerFee);
  });

  describe("Deployment", function() {
    it("Should set up market correctly", async function() {
      expect(await predictionMarket.marketName()).to.equal(marketName);
      expect(await predictionMarket.checkIfTheMarketIsClosed()).to.equal(false);
    });
  });

  describe("Betting", function() {
    it("Should be able to implement stablecoin token", async function() {
      usdToken.mint(userOne.address, "50000000000000000000");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userOne.address))).to.equal("50.0");
      await usdToken.connect(userOne).transfer(userTwo.address, "50000000000000000000");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userOne.address))).to.equal("0.0");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userTwo.address))).to.equal("50.0");
      await usdToken.connect(userTwo).approve(userOne.address, "50000000000000000000");
      await usdToken.connect(userOne).transferFrom(userTwo.address, userOne.address, "50000000000000000000");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userTwo.address))).to.equal("0.0");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userOne.address))).to.equal("50.0");
      await usdToken.connect(userOne).burn(userOne.address, "50000000000000000000");
      expect(ethers.utils.formatEther(await usdToken.totalSupply())).to.equal("0.0");
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
      expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("10.0");
      expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("10.0");
      const lpStruct = await predictionMarket.liquidityProviders(0);
      expect(ethers.utils.formatEther(lpStruct.providedLiquidity)).to.equal("10.0");
      expect(lpStruct.lpAddress).to.equal(userOne.address);
      expect(ethers.utils.formatEther(await predictionMarket.getCurrentLiquidity())).to.equal("10.0");
    });
    it("Should be able to buy shares", async function() {
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
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address))).to.equal("4.45");
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("8.0");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("12.5");
      } else {
        expect(ethers.utils.formatEther(await predictionMarket.noSharesPerAddress(userTwo.address))).to.equal("4.45");
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("12.5");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("8.0");
      }
    });
    it("Should be able to sell shares", async function() {
      usdToken.mint(marketOwner.address, "50000000000000000000");
      usdToken.mint(userOne.address, "100000000000000000000");
      usdToken.mint(userTwo.address, "100000000000000000001");
      usdToken.approve(predictionMarket.address, "50000000000000000000");
      usdToken.connect(userOne).approve(predictionMarket.address, "100000000000000000000");
      usdToken.connect(userTwo).approve(predictionMarket.address, "10000000000000000000");
      await predictionMarket.connect(userOne).addLiquidity("100000000000000000000");
      await predictionMarket.connect(userTwo).buyShares(choice, "2500000000000000000");
      await predictionMarket.connect(userTwo).sellShares(choice, "4889024390243902440");
      const lpStruct = await predictionMarket.liquidityProviders(0);
      expect(ethers.utils.formatEther(lpStruct.earnedProvision)).to.equal("0.147780487804878048");
      expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address))).to.equal("0.0");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userTwo.address))).to.equal("99.846731707317073173");
      if(choice == "yes"){
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("99.94454296701220664");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("100.05548780487804878");
      } else {
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("100.05548780487804878");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("99.94454296701220664");
      }
      
    });
    it("Should be able to withdraw liquidity", async function() {
      usdToken.mint(userOne.address, "10000000000000000000");
      usdToken.mint(userTwo.address, "100000000000000000000");
      usdToken.approve(predictionMarket.address, "50000000000000000000");
      usdToken.connect(userOne).approve(predictionMarket.address, "100000000000000000000");
      usdToken.connect(userTwo).approve(predictionMarket.address, "100000000000000000000");
      await predictionMarket.connect(userOne).addLiquidity("10000000000000000000");
      await predictionMarket.connect(userTwo).buyShares(choice, "2500000000000000000");
      await predictionMarket.connect(userOne).withdrawLiquidity();
      const lpStruct = await predictionMarket.liquidityProviders(0);
      expect(ethers.utils.formatEther(lpStruct.providedLiquidity)).to.equal("0.0");
      expect(ethers.utils.formatEther(lpStruct.earnedProvision)).to.equal("0.0");
      if(choice == "yes"){
        expect(ethers.utils.formatEther(await usdToken.balanceOf(userOne.address))).to.equal("8.05");
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("0.0");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("4.5");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesPerAddress(userOne.address))).to.equal("4.5");
      } else {
        expect(ethers.utils.formatEther(await usdToken.balanceOf(userOne.address))).to.equal("8.05");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("0.0");
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("4.5");
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userOne.address))).to.equal("4.5");
      }
    });
    it("Should be able to add liquidity based on new market ratio", async function() {
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
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address))).to.equal("4.45");
      } else {
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("22.5");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("14.4");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesPerAddress(userTwo.address))).to.equal("4.45");
      }
    });
    it("Should be able to claim your winnings", async function() {
      usdToken.mint(marketOwner.address, "50000000000000000000");
      usdToken.mint(userOne.address, "100000000000000000000");
      usdToken.mint(userTwo.address, "2500000000000000000");
      usdToken.approve(predictionMarket.address, "50000000000000000000");
      usdToken.connect(userOne).approve(predictionMarket.address, "100000000000000000000");
      usdToken.connect(userTwo).approve(predictionMarket.address, "2500000000000000000");
      await predictionMarket.connect(userOne).addLiquidity("100000000000000000000");
      await predictionMarket.connect(userTwo).buyShares(choice, "2500000000000000000");
      //this will work only if the market is already closed
      if(endingDate > Date.now){
        await predictionMarket.chooseWinningSide(choice);
      expect(await predictionMarket.winningSide()).to.equal(choice);
      if(choice == "yes"){
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address))).to.equal("4.88902439024390244");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesPerAddress(userTwo.address))).to.equal("0.0");
      } else {
        expect(ethers.utils.formatEther(await predictionMarket.noSharesPerAddress(userTwo.address))).to.equal("4.88902439024390244");
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address))).to.equal("0.0");
      }
      await predictionMarket.connect(userTwo).claimUsd();
        expect(await usdToken.balanceOf(userTwo.address)).to.equal("4889024390243902440");
      } 
    });
  });
});
