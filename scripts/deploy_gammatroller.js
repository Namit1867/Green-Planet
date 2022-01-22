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
  const anchorToleranceMantissa_ = 15 * 10 ** 16;
  const anchorperiod = 1800; 
  const configs = [];

  const PriceOracle = await hre.ethers.getContractFactory("contracts/UniswapAnchoredView.sol:UniswapAnchoredView");
  const priceOracle = await PriceOracle.deploy(BigInt(anchorToleranceMantissa_),anchorperiod,configs);
  await priceOracle.deployed();

  const Unitroller = await hre.ethers.getContractFactory("contracts/Unitroller.sol:Unitroller");
  const unitroller = await Unitroller.deploy();
  await unitroller.deployed();

  const Gammatroller = await hre.ethers.getContractFactory("contracts/Gammatroller.sol:Gammatroller");
  const gammatroller = await Gammatroller.deploy();
  await gammatroller.deployed();

  //set pending implementation
  await unitroller._setPendingImplementation(gammatroller.address);
  await gammatroller._become(unitroller.address);
  
  const gammaTroller = await hre.ethers.getContractAt(gammatroller_abi.abi,unitroller.address)
  
  const closeFactor = 50 * 10 ** 16 // 50%
  await gammaTroller._setCloseFactor(BigInt(closeFactor));

  const liquidationIncentive  = 108 * 10 ** 16 // 108%
  await gammaTroller._setLiquidationIncentive(BigInt(liquidationIncentive));

  await gammaTroller._setPriceOracle(priceOracle.address);

  console.log('\n',"UNITROLLER DEPLOYED ADDRESS:", unitroller.address,'\n');
  console.log('\n',"GAMMATROLLER DEPLOYED ADDRESS:", gammatroller.address,'\n');
  console.log('\n',"UNITROLLER'S IMPLEMENTATION :",await unitroller.implementation(),'\n');
  console.log('\n',"CLOSE FACTOR :",await gammaTroller.closeFactorMantissa(),'\n');
  console.log('\n',"LIQUIDATION INCENTIVE:",await gammaTroller.liquidationIncentiveMantissa(),'\n');
  console.log('\n',"ORACLE:",await gammaTroller.oracle(),'\n');

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
