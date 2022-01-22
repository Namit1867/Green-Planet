// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const gammatroller_abi = require("../artifacts/contracts/Gammatroller.sol/Gammatroller.json")
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const acccount = "0x096E5453Ae10FCe5F19B61ae85125828283fAFFa"
  const underlying = "0xb3Cb6d2f8f2FDe203a022201C81a96c167607F15";
  const gammatroller ="0xF54f9e7070A1584532572A6F640F09c606bb9A83";
  const interestRateModel = "0x8f1a40f26e717ebb58288f4c8242aa636ad93604";
  const initialExchangeRateMantissa = 2 * 10 ** 26
  const name = "GAMMA";
  const symbol = "gGAMMA";
  const decimals = 8;

  const gGAMMADelegate = await hre.ethers.getContractFactory("contracts/gGAMMA_Delegate.sol:GErc20Delegate");
  const ggammadelegate = await gGAMMADelegate.deploy();
  await ggammadelegate.deployed();

  const gGAMMADelegator = await hre.ethers.getContractFactory("contracts/gGAMMA_Delegator.sol:GErc20Delegator");
  const ggammadelegator = await gGAMMADelegator.deploy(
    underlying,
    gammatroller,
    interestRateModel,
    BigInt(initialExchangeRateMantissa),
    name,
    symbol,
    decimals,
    acccount,
    ggammadelegate.address,
    "0x00"
  );
  await ggammadelegator.deployed();

  const unitroller = await hre.ethers.getContractAt(gammatroller_abi.abi,gammatroller);

  await unitroller._supportMarket(ggammadelegator.address);
  
  const collateral = 75 * 10 ** 16;
  await unitroller._setCollateralFactor(ggammadelegator.address,BigInt(collateral));

  const reserveFactor =  5 * 10 ** 16;
  await ggammadelegator._setReserveFactor(BigInt(reserveFactor));
  
  console.log('\n',"GGAMMADELEGATE DEPLOYED ADDRESS:", ggammadelegate.address,'\n');
  console.log('\n',"GGAMMADELEGATOR DEPLOYED ADDRESS:", ggammadelegator.address,'\n');
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
