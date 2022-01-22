// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const token_configs = require("../../new_market.json");
const price_configs = require("../../price_oracle_configs.json");

const unitroller_address = "0xF54f9e7070A1584532572A6F640F09c606bb9A83";
const planet_discount_address = "0xebf8502653b70ebf2bdf515fcbe637b9b0d7f73c";
let oracle_address = "0xD8C31456B10896FD7495d482F1e7D28d4D66a3b7";

const bnb_interest_rate_address = "0x471c4240a0d9cbf33136457a5287cf9d227f1bd5";
const stables_interest_rate_address = "0xdb6f9e7c0972b764e50d9cbe4ba453345c8566f5";
const aqua_gamma_interest_rate_address = "0x8f1a40f26e717ebb58288f4c8242aa636ad93604 ";
const other_token_interest_rate_address = "0xeb057631a6a7ef28b1ffb8a76ac5019bed8c0f5c ";

// const accountToImpersonate = "0xFd525F21C17f2469B730a118E0568B4b459d61B9" 


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');


  const unitroller = await hre.ethers.getContractAt(
    "contracts/Gammatroller.sol:Gammatroller",
    unitroller_address
  );

  const planetDiscountDelegator = await hre.ethers.getContractAt(
    "contracts/PlanetDiscountDelegate.sol:PlanetDiscountDelegate",
    planet_discount_address
  );

  let priceOracle;

  // await hre.network.provider.request({
  //   method: "hardhat_impersonateAccount",
  //   params: [accountToImpersonate],
  // });

  // const signer = await ethers.getSigner(accountToImpersonate)



  // if(oracle_address === ""){


  //   const anchorToleranceMantissa_ = 15 * 10 ** 16;
  //   const anchorperiod = 1800; 
  //   const configs = [];
  
  //   const PriceOracle = await hre.ethers.getContractFactory("contracts/UniswapAnchoredView.sol:UniswapAnchoredView");
  //   priceOracle = await PriceOracle.deploy(BigInt(anchorToleranceMantissa_),anchorperiod,configs);
  //   await priceOracle.deployed();
  
  //   console.log("PRICE ORACLE ADDRESS:-",priceOracle.address)
  
  
  //   for(var i = 0 ; i < Object.keys(price_configs).length ; i++){
  //     await priceOracle.addNewConfig([
  //       price_configs[i].delegator,
  //       price_configs[i].underlying,
  //      hre.ethers.utils.id(price_configs[i].symbol),
  //      BigInt(price_configs[i].baseUnit),
  //      price_configs[i].priceSource,
  //      price_configs[i].fixedUsd,
  //      price_configs[i].pairAddress,
  //      price_configs[i].chainLink,
  //      BigInt(price_configs[i].chainLinkMultiplier),
  //      price_configs[i].reverse]);
  //   }
  
  //  for(var i = 0 ; i < Object.keys(price_configs).length ; i++){
  //      const config = await priceOracle.getTokenConfig(i);
  //      const gToken = config.gToken;
  //      await priceOracle.validate(gToken);
  //      console.log(`\n ${price_configs[i].symbol} PRICE `," : ","$",await priceOracle.getUnderlyingPrice(gToken) / 1e18,"\n");
  //   }
  
  
  //   await unitroller._setPriceOracle(priceOracle.address);
  
  //   await planetDiscountDelegator.changeAddress(await planetDiscountDelegator.gGammaAddress(),unitroller.address,priceOracle.address)

    
  // }
  // else{
  //   priceOracle = await hre.ethers.getContractAt(
  //     "contracts/UniswapAnchoredView.sol:UniswapAnchoredView",
  //     oracle_address
  //   );

  //   for(var i = 0 ; i < Object.keys(price_configs).length ; i++){
  //     const config = await priceOracle.getTokenConfig(i);
  //     const gToken = config.gToken;
  //     await priceOracle.validate(gToken);
  //     console.log(`\n ${price_configs[i].symbol} PRICE `," : ","$",await priceOracle.getUnderlyingPrice(gToken) / 1e18,"\n");
  //  }
   
  // }



  /**
   * Deploy Market contracts:
   */

  for (var i = 0; i < Object.keys(token_configs).length; i++) {
    
    var interest_rate_model;

    if(token_configs[i].isBNB)
    interest_rate_model = bnb_interest_rate_address;
    else if(token_configs[i].isStable)
    interest_rate_model = stables_interest_rate_address;
    else if(token_configs[i].isAQUAorGAMMA)
    interest_rate_model = aqua_gamma_interest_rate_address;
    else if(token_configs[i].isOther)
    interest_rate_model = other_token_interest_rate_address;

    const gTokenDelegate = await hre.ethers.getContractFactory(
      "contracts/gToken_Delegate.sol:GErc20Delegate"
    );

    const gtokendelegate = await gTokenDelegate.deploy();

    await gtokendelegate.deployed();



    const gTokenDelegator = await hre.ethers.getContractFactory(
      "contracts/gToken_Delegator.sol:GErc20Delegator"
    );

    const gtokendelegator = await gTokenDelegator.deploy(
      token_configs[i].underlying,
      unitroller.address,
      interest_rate_model,
      BigInt(token_configs[i].initialExchangeRateMantissa),
      token_configs[i].name,
      token_configs[i].market_symbol,
      token_configs[i].decimals,
      signer.address,
      gtokendelegate.address,
      "0x00"
    );

    await gtokendelegator.deployed();

    await unitroller._supportMarket(gtokendelegator.address);

    await priceOracle.addNewConfig([
      gtokendelegator.address,
      token_configs[i].underlying,
      hre.ethers.utils.id(token_configs[i].underlying_symbol),
      BigInt(token_configs[i].baseUnit),
      token_configs[i].priceSource,
      token_configs[i].fixedUsd,
      token_configs[i].pairAddress,
      token_configs[i].chainLink,
      BigInt(token_configs[i].chainLinkMultiplier),
      token_configs[i].reverse,
    ]);

    if (
      token_configs[i].priceSource === 2 ||
      token_configs[i].priceSource === 4
    )
    await priceOracle.validate(gtokendelegator.address);

    await unitroller._setCollateralFactor(
      gtokendelegator.address,
      BigInt(token_configs[i].collateral)
    );

    await gtokendelegator._setDiscountLevel(planetDiscountDelegator.address);

    await gtokendelegator._setReserveFactor(
      BigInt(token_configs[i].reserveFactor)
    );

    await planetDiscountDelegator.listMarket(gtokendelegator.address);

    console.log(
      "\n",
      `${token_configs[i].underlying_symbol} DELEGATOR ADDRESS : `,
      gtokendelegator.address,
      "\n"
    );
  }

  for (var i = 0; i < Object.keys(token_configs).length; i++) {
    const config = await priceOracle.getTokenConfigByUnderlying(token_configs[i].underlying);
    const gToken = config.gToken;
    await priceOracle.validate(gToken);
    console.log(
      `\n ${token_configs[i].market_symbol} : MARKET LISTED IN DISCOUNT CONTRACT ?`,
      " : ",
      await planetDiscountDelegator.isMarketListed(gToken),
      "\n"
    );
    console.log(
      `\n ${token_configs[i].market_symbol} : MARKET COLLATERAL FACTOR `,
      " : ",
      (await unitroller.markets(gToken))[1],
      "\n"
    );
    console.log(
      `\n ${token_configs[i].market_symbol} : UNDERLYING PRICE `,
      " : ",
      await priceOracle.getUnderlyingPrice(gToken),
      "\n"
    );
  }

  // await hre.network.provider.request({
  //   method: "hardhat_stopImpersonatingAccount",
  //   params: [accountToImpersonate],
  // });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
