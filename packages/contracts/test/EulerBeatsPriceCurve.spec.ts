import { ethers, waffle } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

const provider = waffle.provider;

chai.use(solidity);
const { expect } = chai;

describe("EulerBeatsPriceCurve", function () {
  const contractName = "EulerBeatsPriceCurve";
  this.beforeEach("initialization.", async function () {
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
