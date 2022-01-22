// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const planetdiscountdelegate_abi = require("../artifacts/contracts/PlanetDiscountDelegate.sol/PlanetDiscountDelegate.json")
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const acccount = "0x096E5453Ae10FCe5F19B61ae85125828283fAFFa"
  const gamma_market = "0xF701A48e5C751A213b7c540F84B64b5A6109962E"; //address of gGAMMA
  const gammatroller = "0xF54f9e7070A1584532572A6F640F09c606bb9A83"; //address of unitroller
  const oracle = "0x29E0ac200dB8CdE15D15356FFcdCb72b13F7bC34"; //address of price oracle

  const PlanetDiscountDelegate = await hre.ethers.getContractFactory("contracts/PlanetDiscountDelegate.sol:PlanetDiscountDelegate");
  const planetDiscountDelegate = await PlanetDiscountDelegate.deploy();
  await planetDiscountDelegate.deployed();

  const PlanetDiscountDelegator = await hre.ethers.getContractFactory("contracts/PlanetDiscountDelegate.sol:PlanetDiscountDelegate");
  const planetDiscountDelegator = await PlanetDiscountDelegator.deploy();
  await planetDiscountDelegator.deployed(planetDiscountDelegate.address,acccount);

  const planetdiscountdelegator = await hre.ethers.getContractAt(planetdiscountdelegate_abi.abi,planetDiscountDelegator.address);

  await planetdiscountdelegator.changeAddress(gamma_market,gammatroller,oracle);

  console.log('\n',"PLANET DISCOUNT DELEGATE DEPLOYED ADDRESS:", planetDiscountDelegate.address,'\n');
  console.log('\n',"PLANET DISCOUNT DELEGATOR DEPLOYED ADDRESS:", planetDiscountDelegator.address,'\n');
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
