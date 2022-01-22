// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const token_configs = require("../token_configs.json");
const planetdiscountdelegate_abi = require("../artifacts/contracts/PlanetDiscountDelegate.sol/PlanetDiscountDelegate.json")
const gammatroller_abi = require("../artifacts/contracts/Gammatroller.sol/Gammatroller.json")


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
  
  // We get the contract to deploy
//   const Gamma = await hre.ethers.getContractFactory("contracts/GAMMA.sol:Gamma");
//   const gamma = await Gamma.deploy(owner.address);
//   await gamma.deployed();

//   console.log("\n","Gamma deployed to:", gamma.address,"\n");
//   console.log("\n","Owner GAMMA Balance:",await gamma.balanceOf(owner.address),"\n");

  const gamma = {address:"0xb3Cb6d2f8f2FDe203a022201C81a96c167607F15"}




  

  /**
   * Deploy Unitroller,Gammatroller,UniswapAnchoredView.sol(PriceOracle)
   */

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
  // console.log('\n',"GAMMATROLLER DEPLOYED ADDRESS:", gammatroller.address,'\n');
  // console.log('\n',"UNITROLLER'S IMPLEMENTATION :",await unitroller.implementation(),'\n');
  // console.log('\n',"CLOSE FACTOR :",await gammaTroller.closeFactorMantissa(),'\n');
  // console.log('\n',"LIQUIDATION INCENTIVE:",await gammaTroller.liquidationIncentiveMantissa(),'\n');
  // console.log('\n',"ORACLE:",await gammaTroller.oracle(),'\n');









  


  /**
   * Interest Rate Models:
   */


  const interest_arr = {
    0 : [2 * 10 ** 16 ,18 * 10 ** 16, 400 * 10 ** 16,70 * 10 ** 16], //BNB
    1 : [2 * 10 ** 16 ,21 * 10 ** 16, 500 * 10 ** 16,80 * 10 ** 16], //STABLES
    2 : [5 * 10 ** 16 ,24 * 10 ** 16, 200 * 10 ** 16,50 * 10 ** 16], //AQUA-GAMMA
    3 : [2 * 10 ** 16 ,18 * 10 ** 16, 400 * 10 ** 16,70 * 10 ** 16], //OTHER
  }
  
  var bnb_interest_rate_address;
  var stables_interest_rate_address;
  var aqua_gamma_interest_rate_address;
  var other_token_interest_rate_address;

  for(var i = 0 ; i < 4 ; i++){
    if(i === 0){
      var interestRateModel = await hre.ethers.getContractFactory("contracts/BNB_INTEREST_RATE_MODEL.sol:JumpRateModelV2");
      bnb_interest_rate_address = await interestRateModel.deploy(BigInt(interest_arr[i][0]),BigInt(interest_arr[i][1]),BigInt(interest_arr[i][2]),BigInt(interest_arr[i][3]),owner.address);
      await bnb_interest_rate_address.deployed();
      console.log('\n',"BNB INTEREST RATE MODEL DEPLOYED ADDRESS:", bnb_interest_rate_address.address,'\n');
    }
    else{
      var interestRateModel = await hre.ethers.getContractFactory("contracts/interestRateModel.sol:JumpRateModelV2");
      if(i === 1){
        stables_interest_rate_address = await interestRateModel.deploy(BigInt(interest_arr[i][0]),BigInt(interest_arr[i][1]),BigInt(interest_arr[i][2]),BigInt(interest_arr[i][3]),owner.address);
        await stables_interest_rate_address.deployed();
        console.log('\n',"STABLES INTEREST RATE MODEL DEPLOYED ADDRESS:", stables_interest_rate_address.address,'\n');
      }
      else if(i === 2){
        aqua_gamma_interest_rate_address = await interestRateModel.deploy(BigInt(interest_arr[i][0]),BigInt(interest_arr[i][1]),BigInt(interest_arr[i][2]),BigInt(interest_arr[i][3]),owner.address);
        await aqua_gamma_interest_rate_address.deployed();
        console.log('\n',"AQUA-GAMMA INTEREST RATE MODEL DEPLOYED ADDRESS:", aqua_gamma_interest_rate_address.address,'\n');
      }
      else if(i === 3){
        other_token_interest_rate_address = await interestRateModel.deploy(BigInt(interest_arr[i][0]),BigInt(interest_arr[i][1]),BigInt(interest_arr[i][2]),BigInt(interest_arr[i][3]),owner.address);
        await other_token_interest_rate_address.deployed();
        console.log('\n',"OTHER INTEREST RATE MODEL DEPLOYED ADDRESS:", other_token_interest_rate_address.address,'\n');
      }
    }
  }
  









  /**
   * Deploy PlanetDiscount contracts:
   */

   const PlanetDiscountDelegate = await hre.ethers.getContractFactory("contracts/PlanetDiscountDelegate.sol:PlanetDiscountDelegate");
   const planetDiscountDelegate = await PlanetDiscountDelegate.deploy();
   await planetDiscountDelegate.deployed();

   const PlanetDiscountDelegator = await hre.ethers.getContractFactory("contracts/PlanetDiscountDelegator.sol:PlanetDiscountDelegator");
   const planetDiscountDelegator = await PlanetDiscountDelegator.deploy(planetDiscountDelegate.address,owner.address);
   await planetDiscountDelegator.deployed();

   //console.log('\n',"PLANET DISCOUNT DELEGATE DEPLOYED ADDRESS:", planetDiscountDelegate.address,'\n');
   console.log('\n',"PLANET DISCOUNT DELEGATOR DEPLOYED ADDRESS:", planetDiscountDelegator.address,'\n');







  /**
   * Deploy Market contracts:
   */

   for(var i = 0 ; i < Object.keys(token_configs).length ; i++){

    if(i === 0){
        
        //GAMMA
        const gGAMMADelegate = await hre.ethers.getContractFactory("contracts/gGAMMA_Delegate.sol:GErc20Delegate");
        const ggammadelegate = await gGAMMADelegate.deploy();
        await ggammadelegate.deployed();

        const gGAMMADelegator = await hre.ethers.getContractFactory("contracts/gGAMMA_Delegator.sol:GErc20Delegator");
        const ggammadelegator = await gGAMMADelegator.deploy(
        token_configs[i].underlying,
        unitroller.address,
        aqua_gamma_interest_rate_address.address,
        BigInt(token_configs[i].initialExchangeRateMantissa),
        token_configs[i].name,
        token_configs[i].symbol,
        token_configs[i].decimals,
        owner.address,
        ggammadelegate.address,
        "0x00"
        );
        await ggammadelegator.deployed();

        await gammaTroller._supportMarket(ggammadelegator.address);

        await priceOracle.addNewConfig([ggammadelegator.address,
            token_configs[i].underlying,
            hre.ethers.utils.id(token_configs[i].symbol),
            BigInt(token_configs[i].baseUnit),
            token_configs[i].priceSource,
            token_configs[i].fixedUsd,
            token_configs[i].pairAddress,
            token_configs[i].chainLink,
            BigInt(token_configs[i].chainLinkMultiplier),
            token_configs[i].reverse]);

        await ggammadelegator._setReserveFactor(BigInt(token_configs[i].reserveFactor));

        const planetdiscountdelegator = await hre.ethers.getContractAt(planetdiscountdelegate_abi.abi,planetDiscountDelegator.address);

        await planetdiscountdelegator.changeAddress(ggammadelegator.address,unitroller.address,priceOracle.address);

        console.log('\n',"GGAMMADELEGATOR DEPLOYED ADDRESS:", ggammadelegator.address,'\n');
        //console.log("GAMMA PRICE",await priceOracle.getUnderlyingPrice(ggammadelegator.address))

    }
    else if(i === 1){
        //BNB
        const gBNB = await hre.ethers.getContractFactory("contracts/gBNB.sol:CEther");
        const gbnb = await gBNB.deploy(
            unitroller.address,
            bnb_interest_rate_address.address,
            BigInt(token_configs[i].initialExchangeRateMantissa),
            token_configs[i].name,
            token_configs[i].symbol,
            token_configs[i].decimals
          );
        await gbnb.deployed();

        await gammaTroller._supportMarket(gbnb.address);

        await priceOracle.addNewConfig([gbnb.address,
            token_configs[i].underlying,
            hre.ethers.utils.id(token_configs[i].symbol),
            BigInt(token_configs[i].baseUnit),
            token_configs[i].priceSource,
            token_configs[i].fixedUsd,
            token_configs[i].pairAddress,
            token_configs[i].chainLink,
            BigInt(token_configs[i].chainLinkMultiplier),
            token_configs[i].reverse]);
        
        await priceOracle.validate(gbnb.address);

        await gammaTroller._setCollateralFactor(gbnb.address,BigInt(token_configs[i].collateral));

        await gbnb._setDiscountLevel(planetDiscountDelegator.address);

        const planetdiscountdelegator = await hre.ethers.getContractAt(planetdiscountdelegate_abi.abi,planetDiscountDelegator.address);
        await planetdiscountdelegator.listMarket(gbnb.address);

        console.log('\n',"GBNB DEPLOYED ADDRESS:", gbnb.address,'\n');
        //console.log("BNB PRICE : ",await priceOracle.getUnderlyingPrice(gbnb.address))

    }
    else{

        var interest_rate_model;

        if(token_configs[i].stableCoin){
          interest_rate_model = stables_interest_rate_address;
        }
        else{
          interest_rate_model = other_token_interest_rate_address;
        }

        const gTokenDelegate = await hre.ethers.getContractFactory("contracts/gToken_Delegate.sol:GErc20Delegate");
        const gtokendelegate = await gTokenDelegate.deploy();
        await gtokendelegate.deployed();

        const gTokenDelegator = await hre.ethers.getContractFactory("contracts/gToken_Delegator.sol:GErc20Delegator");
        const gtokendelegator = await gTokenDelegator.deploy(
        token_configs[i].underlying,
        unitroller.address,
        interest_rate_model.address,
        BigInt(token_configs[i].initialExchangeRateMantissa),
        token_configs[i].name,
        token_configs[i].symbol,
        token_configs[i].decimals,
        owner.address,
        gtokendelegate.address,
        "0x00"
        );

        await gtokendelegator.deployed();
        
        await gammaTroller._supportMarket(gtokendelegator.address);

        await priceOracle.addNewConfig([gtokendelegator.address,
            token_configs[i].underlying,
            hre.ethers.utils.id(token_configs[i].symbol),
            BigInt(token_configs[i].baseUnit),
            token_configs[i].priceSource,
            token_configs[i].fixedUsd,
            token_configs[i].pairAddress,
            token_configs[i].chainLink,
            BigInt(token_configs[i].chainLinkMultiplier),
            token_configs[i].reverse]);
    
        if(token_configs[i].priceSource === 2 || token_configs[i].priceSource === 4)
        await priceOracle.validate(gtokendelegator.address);

        await gammaTroller._setCollateralFactor(gtokendelegator.address,BigInt(token_configs[i].collateral));

        await gtokendelegator._setDiscountLevel(planetDiscountDelegator.address);

        await gtokendelegator._setReserveFactor(BigInt(token_configs[i].reserveFactor));

        const planetdiscountdelegator = await hre.ethers.getContractAt(planetdiscountdelegate_abi.abi,planetDiscountDelegator.address);
        await planetdiscountdelegator.listMarket(gtokendelegator.address);

        //console.log('\n',"GTOKENDELEGATE DEPLOYED ADDRESS:", gtokendelegate.address,'\n');
        console.log('\n',"GTOKENDELEGATOR DEPLOYED ADDRESS:", gtokendelegator.address,'\n');

    }

  }

  for(var i = 0 ; i < Object.keys(token_configs).length ; i++){
    const config = await priceOracle.getTokenConfig(i);
    const gToken = config.gToken;
    await priceOracle.validate(gToken);
    console.log(`\n ${token_configs[i].name} MARKET LISTED IN DISCOUNT CONTRACT ?`," : ",await planetDiscountDelegator.isMarketListed(gToken),"\n");
    console.log(`\n ${token_configs[i].name} MARKET COLLATERAL FACTOR `," : ",(await gammaTroller.markets(gToken))[1],"\n");
    console.log(`\n ${token_configs[i].name} UNDERLYING PRICE `," : ",await priceOracle.getUnderlyingPrice(gToken),"\n");
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
