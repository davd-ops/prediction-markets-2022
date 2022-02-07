const { expect } = require("chai");

describe("PredictionMarket Contract", function () {
  const marketName = "FirstMarket";
  const marketDescription = "FirstMarket will close when A is B";
  const choice = "yes";
  const providerFee = 0;
  let endingDate;

  beforeEach(async function () {
    usdToken = await ethers.getContractFactory("UsdToken");
    predictionMarket = await ethers.getContractFactory("PredictionMarketOps");

    const network = "homestead"; // The mainnet
    provider = ethers.getDefaultProvider(network, {
      infura: 'b51a92ba9a4f4092aa548938d47cb402',
    });

    endingDate = new Date('2022-12-24T23:59:59Z').getTime() / 1000;

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
    
    it("Should be to perform another another trade example", async function() {
      usdToken.mint(marketOwner.address, "50000000000000000000");
      usdToken.mint(userOne.address, "10000000000000000000000");
      usdToken.mint(userTwo.address, "100000000000000000000");
      usdToken.approve(predictionMarket.address, "50000000000000000000");
      usdToken.connect(userOne).approve(predictionMarket.address, "10000000000000000000000");
      usdToken.connect(userTwo).approve(predictionMarket.address, "1000000000000000000000");
      await predictionMarket.connect(userOne).addLiquidity("17000000000000000000");

      console.log(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address)));
      console.log("BALANCE: " + ethers.utils.formatEther(await usdToken.balanceOf(userTwo.address)));
      await predictionMarket.connect(userTwo).buyShares("yes", "10000000000000000000");
      console.log(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address)));
      console.log("BALANCE: " + ethers.utils.formatEther(await usdToken.balanceOf(userTwo.address)));
      //await predictionMarket.connect(userTwo).sellShares("yes", "10000000000000000000");
      await predictionMarket.connect(userTwo).sellShares2("yes", "16296296296296296297");
      console.log(ethers.utils.formatEther(await predictionMarket.yesSharesPerAddress(userTwo.address)));
      console.log("BALANCE: " + ethers.utils.formatEther(await usdToken.balanceOf(userTwo.address)));
      
      //await predictionMarket.connect(userTwo).sellShares2("yes", "5000000000000000000");
    });
  });
});
