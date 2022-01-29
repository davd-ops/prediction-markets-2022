
//npx hardhat run --network localhost scripts/deployUsd.js
const chainId = 31337;
const admin_address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const user_address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

async function main() {
    const UsdFactory = await ethers.getContractFactory("UsdToken");
    const usd = await UsdFactory.deploy(chainId);
  
    console.log("Usd token deployed to:", usd.address);

    await usd.mint(admin_address, "50000000000000000000");
    console.log('Minted', ethers.utils.formatEther(await usd.balanceOf(admin_address)) , 'usd tokens to', admin_address);
    await usd.mint(user_address, "50000000000000000000");
    console.log('Minted', ethers.utils.formatEther(await usd.balanceOf(user_address)) , 'usd tokens to', user_address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });