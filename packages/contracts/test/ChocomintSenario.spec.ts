import { ethers, waffle } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

import { initialize } from "../helper";

const provider = waffle.provider;

chai.use(solidity);
const { expect } = chai;

describe("Chocomint", function () {
  let printContract;
  let registryContract;
  let genesisContract;
  let creatorContract;
  let minterContract;

  const chainId = "31337";

  let signer, printSigner, genesisSigner, createSigner, mintSigner;
  this.beforeEach("initialization.", async function () {
    [signer, printSigner, genesisSigner, createSigner, mintSigner] = await ethers.getSigners();
    const { print, registry, genesis, creator, minter } = await initialize();
    printContract = print;
    registryContract = registry;
    genesisContract = genesis;
    creatorContract = creator;
    minterContract = minter;
  });

  it("deploy: deploy is ok", async function () {
    // expect(await chocomint.name()).to.equal(contractName);
    // expect(await chocomint.symbol()).to.equal(contractSymbol);
    // expect(await chocomint.supplyLimit()).to.equal(supplyLimit);
    // expect(await chocomint.ownerCutRatio()).to.equal(ownerCutRatio);
    // expect(await chocomint.ratioBase()).to.equal(ratioBase);
  });
});
