// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const price_configs = require("./configs_to_add.json");

let oracle_address = "0xD8C31456B10896FD7495d482F1e7D28d4D66a3b7";

// const accountToImpersonate = "0xFd525F21C17f2469B730a118E0568B4b459d61B9"

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  let priceOracle;

  priceOracle = await hre.ethers.getContractAt(
    "contracts/UniswapAnchoredView.sol:UniswapAnchoredView",
    oracle_address
  );

  // for (var i = 0; i < Object.keys(price_configs).length; i++) {
  //   const tx = await priceOracle.addNewConfig([
  //     price_configs[i].delegator,
  //     price_configs[i].underlying,
  //     hre.ethers.utils.id(price_configs[i].underlying_symbol),
  //     BigInt(price_configs[i].baseUnit),
  //     price_configs[i].priceSource,
  //     price_configs[i].fixedUsd,
  //     price_configs[i].pairAddress,
  //     price_configs[i].chainLink,
  //     BigInt(price_configs[i].chainLinkMultiplier),
  //     price_configs[i].reverse,
  //   ]);
  //   await tx.wait();
  // }

  for (var i = 0; i < Object.keys(price_configs).length; i++) {
    const gToken = price_configs[i].delegator;
    // const tx = await priceOracle.validate(gToken);
    // await tx.wait()
    console.log(
      `\n ${price_configs[i].underlying_symbol} PRICE `,
      " : ",
      "$",
      (await priceOracle.getUnderlyingPrice(gToken)) / 1e18,
      "\n"
    );
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
