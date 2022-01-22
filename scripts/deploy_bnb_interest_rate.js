// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  /**
   *  for BNB the parameters are
   *  Base rate => 2% 
   *  Multiplier => 18%
   *  Jump Multiplier => 400%
   *  Kink => 70%
   *  
   */
 
  const baseRatePerYear = 2 * 10 ** 16; //2%
  const multiplierPerYear = 18 * 10 ** 16; //18% 
  const jumpMultiplierPerYear = 400 * 10 ** 16 //400%
  const kink_ = 70 * 10 ** 16; //70%
  const [owner] = await hre.ethers.getSigners();

  const interestRateModel = await hre.ethers.getContractFactory("contracts/BNB_INTEREST_RATE_MODEL.sol:JumpRateModelV2");
  const interest = await interestRateModel.deploy(BigInt(baseRatePerYear),BigInt(multiplierPerYear),BigInt(jumpMultiplierPerYear),BigInt(kink_),owner.address);
  await interest.deployed();

  console.log('\n',"BNB INTEREST RATE MODEL DEPLOYED ADDRESS:", interest.address,'\n');
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
