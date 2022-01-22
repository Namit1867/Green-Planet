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
   *  for Tokens other than stables,aqua,gamma,bnb the parameters are
   *  Base rate => 2% 
   *  Multiplier => 18%
   *  Jump Multiplier => 400%
   *  Kink => 70%
   * 
   *  for Stable Coins parameters are
   *  Base rate => 2% 
   *  Multiplier => 21%
   *  Jump Multiplier => 500%
   *  Kink => 80%
   * 
   *  for Aqua and Gamma parameters are
   *  Base rate => 5% 
   *  Multiplier => 24%
   *  Jump Multiplier => 200%
   *  Kink => 50%
   * 
   *  
   */
 
  const baseRatePerYear = 2 * 10 ** 16; //2%
  const multiplierPerYear = 18 * 10 ** 16; //18% 
  const jumpMultiplierPerYear = 400 * 10 ** 16 //400%
  const kink_ = 70 * 10 ** 16; //70%
  const [owner] = await hre.ethers.getSigners();

  const interestRateModel = await hre.ethers.getContractFactory("contracts/interestRateModel.sol:JumpRateModelV2");
  const interest = await interestRateModel.deploy(BigInt(baseRatePerYear),BigInt(multiplierPerYear),BigInt(jumpMultiplierPerYear),BigInt(kink_),owner.address);
  await interest.deployed();

  console.log('\n',"OTHER INTEREST RATE MODEL DEPLOYED ADDRESS:", interest.address,'\n');
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
