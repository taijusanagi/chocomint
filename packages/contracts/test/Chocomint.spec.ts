import { ethers, waffle } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

const provider = waffle.provider;

chai.use(solidity);
const { expect } = chai;

describe("Chocomint", function () {
  let chocomint;
  const chainId = "31337";
  const nullAddress = "0x0000000000000000000000000000000000000000";

  const contractName = "ChocomintGenesis";
  const contractSymbol = "CMG";
  const supplyLimit = 256;
  const ownerCutRatio = 100;
  const ratioBase = 10000;

  let signer;
  this.beforeEach("initialization.", async function () {
    [signer] = await ethers.getSigners();
    const Chocomint = await ethers.getContractFactory(contractName);
    chocomint = await Chocomint.deploy();
  });

  it("internal test: check array operation", async function () {
    chocomint.updateEligibleBidIds(1);
  });

  it("deploy: deploy is ok / check: name, symbol, totalSupply", async function () {
    // expect(await chocomint.name()).to.equal(contractName);
    // expect(await chocomint.symbol()).to.equal(contractSymbol);
    // expect(await chocomint.supplyLimit()).to.equal(supplyLimit);
    // expect(await chocomint.ownerCutRatio()).to.equal(ownerCutRatio);
    // expect(await chocomint.ratioBase()).to.equal(ratioBase);
  });

  it("bid: fail when bid is already closed", async function () {});
  it("isOpenToBid: false when finalized", async function () {});
  it("isOpenToBid: true when not finalized and eligibleBidIds.length < supplyLimit", async function () {});
  it("isOpenToBid: false when finalized", async function () {});
});
