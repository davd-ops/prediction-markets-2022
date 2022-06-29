const { expect } = require("chai");

describe('PredictionMarket Contract', function () {
  const marketName = 'FirstMarket';
  const marketDescription = 'FirstMarket will close when A is B';
  const choice = 'yes';
  const providerFee = 0;
  let endingDate;

  beforeEach(async function () {
    usdToken = await ethers.getContractFactory('UsdToken');
    predictionMarket = await ethers.getContractFactory('PredictionMarketOps');

    const network = 'homestead'; // The mainnet
    provider = ethers.getDefaultProvider(network, {
      infura: 'b51a92ba9a4f4092aa548938d47cb402',
    });

    endingDate = new Date('2022-12-24T23:59:59Z').getTime() / 1000;

    [marketOwner, userOne, userTwo, ...address] = await ethers.getSigners();
  
    usdToken = await usdToken.deploy(1);
    
    predictionMarket = await predictionMarket.deploy(marketName, marketDescription, endingDate, usdToken.address, await usdToken.decimals(), providerFee);
    
    usdToken.mint(marketOwner.address, '10000000000000000000000');
    usdToken.mint(userOne.address, '10000000000000000000000');
    usdToken.mint(userTwo.address, '10000000000000000000000');
    usdToken.connect(marketOwner).approve(predictionMarket.address, '10000000000000000000000');
    usdToken.connect(userOne).approve(predictionMarket.address, '10000000000000000000000');
    usdToken.connect(userTwo).approve(predictionMarket.address, '10000000000000000000000');
  });

  describe('Deployment', function() {
    it('Should set up market correctly', async function() {
      expect(await predictionMarket.marketName()).to.equal(marketName);
      expect(await predictionMarket.checkIfTheMarketIsClosed()).to.equal(false);
    });
  });

  describe('Providing and withdrawing liquidity', function() {
    it('Should be able to provide liquidity', async function () {
      expect(ethers.utils.formatEther(await usdToken.balanceOf(marketOwner.address))).to.equal('10000.0');
      await predictionMarket.connect(marketOwner).addLiquidity('100000000000000000000');
      const lpStruct = await predictionMarket.liquidityProviders(0);
      expect(ethers.utils.formatEther(lpStruct.providedLiquidity)).to.equal('100.0');
      expect(lpStruct.lpAddress).to.equal(marketOwner.address);
      expect(ethers.utils.formatEther(await predictionMarket.getCurrentLiquidity())).to.equal('100.0');
      expect(ethers.utils.formatEther(await usdToken.balanceOf(marketOwner.address))).to.equal('9900.0');
    });
    it('Should be able to withdraw liquidity', async function () {
      await predictionMarket.connect(marketOwner).addLiquidity('10000000000000000000');
      await predictionMarket.connect(marketOwner).withdrawLiquidity();
      const lpStruct = await predictionMarket.liquidityProviders(0);
      expect(ethers.utils.formatEther(lpStruct.providedLiquidity)).to.equal('0.0');
      expect(lpStruct.lpAddress).to.equal('0x0000000000000000000000000000000000000000');
      expect(ethers.utils.formatEther(await predictionMarket.getCurrentLiquidity())).to.equal('0.0');
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userTwo.address))).to.equal('10000.0');
    });
  });
  describe('Buying and selling shares', function() {
    it("Should be able to buy shares", async function() {
      await predictionMarket.connect(marketOwner).addLiquidity('10000000000000000000');
      await predictionMarket.connect(userTwo).buyShares(choice, "2500000000000000000");
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
    it("Should be able to sell shares", async function() {
      await predictionMarket.connect(marketOwner).addLiquidity('10000000000000000000');
      await predictionMarket.connect(userTwo).buyShares(choice, "2500000000000000000");
      await predictionMarket.connect(userTwo).sellShares(choice, "4500000000000000000");
      expect(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address))).to.equal("0.0");
      expect(ethers.utils.formatEther(await usdToken.balanceOf(userTwo.address))).to.equal("10000.0");
      if(choice == "yes"){
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("10.0");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("10.0");
      } else {
        expect(ethers.utils.formatEther(await predictionMarket.yesSharesEmitted())).to.equal("10.0");
        expect(ethers.utils.formatEther(await predictionMarket.noSharesEmitted())).to.equal("10.0");
      }
    });
  });
});
