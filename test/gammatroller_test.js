const { expect } = require("chai");
const { ethers } = require("hardhat");
const delay = require('delay')

describe("GAMMATROLLER CONTRACT", function () {
  it("Should deploy Gammatroller", async function () {

    // const [owner] = await ethers.getSigners();

    // const Unitroller = await ethers.getContractFactory("contracts/Unitroller.sol:Unitroller");
    // const unitroller = await Unitroller.deploy();
    // await delay(1000)

    // const zeroAddress = "0x0000000000000000000000000000000000000000"
    // expect(await unitroller.pendingGammatrollerImplementation()).to.equal(zeroAddress);

    // const Gammatroller = await ethers.getContractFactory("contracts/Gammatroller.sol:Gammatroller");
    // const gammatroller = await Gammatroller.deploy();
    // await delay(10000)
    
    // const setPendingImplementation = await unitroller._setPendingImplementation(gammatroller.address);
    // // wait until the transaction is mined
    // await setPendingImplementation.wait();
    // expect(await unitroller.pendingGammatrollerImplementation()).to.equal(gammatroller.address);

  });
});
