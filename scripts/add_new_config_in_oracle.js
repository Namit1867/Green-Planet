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

  const anchorToleranceMantissa_ = 15 * 10 ** 16;
  const anchorperiod = 1800; 

  
  const gToken = "0x928fa017ebf781947102690c9b176996b2e00f22";
  const underlying = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
  const symbolHash = hre.ethers.utils.id("BNB");
  const baseUnit = BigInt(1 * 10 ** 18);
  const priceSource = 2;
  const fixedUsd =  0;
  const pairAddress = "0x74E4716E431f45807DCF19f284c7aA99F18a4fbc"
  const chainLink = "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e"
  const chainLinkMultiplier = BigInt(1 * 10 ** 16);
  const reverse = false;

  const configs = [["0x24664791b015659fcb71ab2c9c0d56996462082f","0x0000000000000000000000000000000000000000","0x3ed03c38e59dc60c7b69c2a4bf68f9214acd953252b5a90e8f5f59583e9bc3ae","1000000","2","0","0xd99c7F6C65857AC913a8f880A4cb84032AB2FC5b","0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE","10000000000000000",true],["0x24664791b015659fcb71ab2c9c0d56996462082f","0x0000000000000000000000000000000000000000","0x3ed03c38e59dc60c7b69c2a4bf68f9214acd953252b5a90e8f5f59583e9bc3ae","1000000","2","0","0xd99c7F6C65857AC913a8f880A4cb84032AB2FC5b","0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE","10000000000000000",true],["0x66fd9d390de6172691ec0ddf0ac7f231c1f9a434","0x2170Ed0880ac9A755fd29B2688956BD959F933F8","0xaaaebeba3810b1e6b70781f14b2d72c1cb89c0b2b320c43bb67ff79f562f5ff4","1000000000000000000","2","0","0x74E4716E431f45807DCF19f284c7aA99F18a4fbc","0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e","10000000000000000",false],["0xcfa5b884689dc09e4503e84f7877d3a583fcceef","0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c","0xa8f4e2415d2cbdfc918e4c626eb18bd2b69c91e0b198be3316062051fea51997","1000000000000000000","2","0","0x61EB789d75A95CAa3fF50ed7E47b96c132fEc082","0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf","10000000000000000",false],["0x928fa017ebf781947102690c9b176996b2e00f22","0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56","0x54c512ac779647672b8d02e2fe2dc10f79bbf19f719d887221696215fd24e9f1","1000000000000000000","1","1000000","0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000","1",false],["0x854a534cefaf8fd20a70c9dc976c4f65324d7b42","0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d","0xd6aca1be9729c13d677335161321649cccae6a591554772516700f986f942eaa","1000000000000000000","1","1000000","0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000","1",false],["0x4c2bddc208b58534eddc1fba7b2828cab70797b5","0x55d398326f99059ff775485246999027b3197955","0x8b1a1d9c2b109e527c9134b25b1a1833b16b6594f92daa9f6d9b7a6024bce9d0","1000000000000000000","1","1000000","0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000","1",false],["0xa5ae8459e710f95ca0c93d73f63a66d9996f1ace","0x23396cF899Ca06c4472205fC903bDB4de249D6fC","0x96be3b62ec4384e21a2e5313872d5feca8a321f53cc1b7f4209fe26acd389a8a","1000000000000000000","1","1000000","0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000","1",false],["0x8b2f098411ce4b32c9d2110fef257cf01d006ba5","0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3","0x96be3b62ec4384e21a2e5313872d5feca8a321f53cc1b7f4209fe26acd389a8a","1000000000000000000","1","1000000","0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000","1",false],["0xb7eD4A5AF620B52022fb26035C565277035d4FD7","0x72b7d61e8fc8cf971960dd9cfa59b8c829d91991","0x63901b645aa6e00ea7f6ba69d824d4f5cd2ce7d643330de121686328cc21b0bb","1000000000000000000","3","1000000","0x03028D2F8B275695A1c6AFB69A4765e3666e36d9","0x0000000000000000000000000000000000000000","1",false],["0x0c6dd143F4b86567d6c21E8ccfD0300f00896442","0xb3Cb6d2f8f2FDe203a022201C81a96c167607F15","0xca3ac38cdb5a40cebc5133920a75bca08c1dc2251fb0d77609380ed6a5f56323","1000000000000000000","3","1000000","0xcCaF3fcE9f2D7A7031e049EcC65c0C0Cc331EE0D","0x0000000000000000000000000000000000000000","1",true]]
  const PriceOracle = await hre.ethers.getContractFactory("contracts/UniswapAnchoredView.sol:UniswapAnchoredView");
  const priceOracle = await PriceOracle.deploy(BigInt(anchorToleranceMantissa_),anchorperiod,configs);
  await priceOracle.deployed();

  console.log('\n',"PRICE ORACLE DEPLOYED ADDRESS:", priceOracle.address,'\n');

  for(let i = 0 ; i < configs.length ; i++){
      
    if(i === 0)
    continue;
    await priceOracle.validate(configs[i][0]);
    console.log(`${configs[i][1]} Price :`,await priceOracle.getUnderlyingPrice(configs[i][0]));
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
