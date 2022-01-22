// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const token_configs = require("../../price_oracle_configs.json");


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');



  /**
   * Deploy GAMMA.sol
   */

  const [owner] = await hre.ethers.getSigners();

  const accountToImpersonate = "0xFd525F21C17f2469B730a118E0568B4b459d61B9" 


  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [accountToImpersonate],
  });

  const signer = await ethers.getSigner(accountToImpersonate)
  

  /**
   * Deploy Unitroller,Gammatroller,UniswapAnchoredView.sol(PriceOracle)
   */

  const anchorToleranceMantissa_ = 15 * 10 ** 16;
  const anchorperiod = 1800; 
  const configs = [];

  const PriceOracle = await hre.ethers.getContractFactory("contracts/UniswapAnchoredView.sol:UniswapAnchoredView");
  const priceOracle = await PriceOracle.connect(signer).deploy(BigInt(anchorToleranceMantissa_),anchorperiod,configs);
  await priceOracle.connect(signer).deployed();

  console.log("PRICE ORACLE ADDRESS:-",priceOracle.address)




  /**
   * Deploy Market contracts:
   */

   for(var i = 0 ; i < Object.keys(token_configs).length ; i++){
       await priceOracle.connect(signer).addNewConfig([
        token_configs[i].delegator,
        token_configs[i].underlying,
        hre.ethers.utils.id(token_configs[i].symbol),
        BigInt(token_configs[i].baseUnit),
        token_configs[i].priceSource,
        token_configs[i].fixedUsd,
        token_configs[i].pairAddress,
        token_configs[i].chainLink,
        BigInt(token_configs[i].chainLinkMultiplier),
        token_configs[i].reverse]);
    }

    for(var i = 0 ; i < Object.keys(token_configs).length ; i++){
        const config = await priceOracle.getTokenConfig(i);
        const gToken = config.gToken;
        await priceOracle.connect(signer).validate(gToken);
        console.log(`\n ${token_configs[i].symbol} PRICE `," : ","$",await priceOracle.getUnderlyingPrice(gToken) / 1e18,"\n");
    }

    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [accountToImpersonate],
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
