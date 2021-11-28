
//npx hardhat run --network localhost scripts/deployUsd.js
const chainId = 31337;

async function main() {
    const UsdFactory = await ethers.getContractFactory("UsdToken");
    const usd = await UsdFactory.deploy(chainId);
  
    console.log("Usd token deployed to:", usd.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });