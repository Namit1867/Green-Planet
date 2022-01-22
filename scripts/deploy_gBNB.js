// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const gammatroller_abi = require("../artifacts/contracts/Gammatroller.sol/Gammatroller.json")
const planetdiscountdelegate = require("../artifacts/contracts/PlanetDiscountDelegate.sol/PlanetDiscountDelegate.json")
const oracleAbi = require("../artifacts/contracts/UniswapAnchoredView.sol/UniswapAnchoredView.json")
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const gammatroller ="0x8F9DedBD504580f9E966C006dad0E51EA8CC5A00";
  const interestRateModel = "0xB4f34879C2c3db50934E5069CE01fD5EcE3Aa051";
  const planetDiscountAddress = "0xebf8502653b70ebf2bdf515fcbe637b9b0d7f73c";
  const initialExchangeRateMantissa = 2 * 10 ** 26
  const name = "BNB";
  const symbol = "gBNB";
  const decimals = 8;

  const gBNB = await hre.ethers.getContractFactory("contracts/gBNB.sol:CEther");
  const gbnb = await gBNB.deploy(
    gammatroller,
    interestRateModel,
    BigInt(initialExchangeRateMantissa),
    name,
    symbol,
    decimals
  );
  await gbnb.deployed();

  const unitroller = await hre.ethers.getContractAt(gammatroller_abi.abi,gammatroller);

  await unitroller._supportMarket(gtokendelegator.address);

  const gToken = gbnb.address;
  const underlying = "0x0000000000000000000000000000000000000000";
  const symbolHash = hre.ethers.utils.id("BNB");
  const baseUnit = BigInt(1 * 10 ** 18);
  const priceSource = 2;
  const fixedUsd =  0;
  const pairAddress = "0x74E4716E431f45807DCF19f284c7aA99F18a4fbc"
  const chainLink = "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e"
  const chainLinkMultiplier = BigInt(1 * 10 ** 16);
  const reverse = false;
  const oracle = await hre.ethers.getContractAt(oracleAbi.abi,await unitroller.oracle());
  await oracle.addNewConfig([gToken,underlying,symbolHash,baseUnit,priceSource,fixedUsd,pairAddress,chainLink,chainLinkMultiplier,reverse])
  
  await oracle.validate(gToken);
  console.log(`${gToken} Price :`,await oracle.getUnderlyingPrice(gToken));

  const collateral = 75 * 10 ** 16;
  await unitroller._setCollateralFactor(gtokendelegator.address,BigInt(collateral));

  const reserveFactor =  5 * 10 ** 16;
  await gbnb._setReserveFactor(BigInt(reserveFactor));

  await gbnb._setDiscountLevel(planetDiscountAddress);

  const planetDiscountDelegator = await hre.ethers.getContractAt(planetdiscountdelegate.abi,planetDiscountAddress);
  await planetDiscountDelegator.listMarkets(gbnb.address);
  
  console.log('\n',"GBNB DEPLOYED ADDRESS:", gbnb.address,'\n');
 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
