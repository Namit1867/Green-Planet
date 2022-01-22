// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const gammatroller_abi = require("../artifacts/contracts/Gammatroller.sol/Gammatroller.json")
const planetdiscountdelegate = require("../artifacts/contracts/PlanetDiscountDelegate.sol/PlanetDiscountDelegate.json")
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const acccount = "0x096E5453Ae10FCe5F19B61ae85125828283fAFFa"
  const underlying = gtokendelegate.address;
  const gammatroller ="0xF54f9e7070A1584532572A6F640F09c606bb9A83";
  const interestRateModel = "0xeb057631a6a7ef28b1ffb8a76ac5019bed8c0f5c";
  const planetDiscountAddress = "0xebf8502653b70ebf2bdf515fcbe637b9b0d7f73c";
  const initialExchangeRateMantissa = 2 * 10 ** 26
  const name = "XYZ";
  const symbol = "gXYZ";
  const decimals = 8;

  const gTokenDelegate = await hre.ethers.getContractFactory("contracts/gToken_Delegate.sol:GErc20Delegate");
  const gtokendelegate = await gTokenDelegate.deploy();
  await gtokendelegate.deployed();

  const gTokenDelegator = await hre.ethers.getContractFactory("contracts/gToken_Delegator.sol:GErc20Delegator");
  const gtokendelegator = await gTokenDelegator.deploy(
    underlying,
    gammatroller,
    interestRateModel,
    BigInt(initialExchangeRateMantissa),
    name,
    symbol,
    decimals,
    acccount,
    gtokendelegate.address,
    "0x00"
  );
  await gtokendelegator.deployed();

  const unitroller = await hre.ethers.getContractAt(gammatroller_abi.abi,gammatroller);

  await unitroller._supportMarket(gtokendelegator.address);
  
  const collateral = 75 * 10 ** 16;
  await unitroller._setCollateralFactor(gtokendelegator.address,BigInt(collateral));

  const reserveFactor =  5 * 10 ** 16;
  await gtokendelegator._setReserveFactor(BigInt(reserveFactor));

  await gtokendelegator._setDiscountLevel(planetDiscountAddress);

  const planetDiscountDelegator = await hre.ethers.getContractAt(planetdiscountdelegate.abi,planetDiscountAddress);
  await planetDiscountDelegator.listMarkets(gtokendelegator.address);
  
  console.log('\n',"GTOKENDELEGATE DEPLOYED ADDRESS:", gtokendelegate.address,'\n');
  console.log('\n',"GTOKENDELEGATOR DEPLOYED ADDRESS:", gtokendelegator.address,'\n');
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
