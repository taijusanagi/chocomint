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
  let galleryContract;
  let creatorContract;
  let publisherContract;

  const chainId = "31337";

  let signer, printSigner, gallerySigner, createSigner, mintSigner;
  this.beforeEach("initialization.", async function () {
    [signer, printSigner, gallerySigner, createSigner, mintSigner] = await ethers.getSigners();
    const { print, registry, gallery, creator, publisher } = await initialize();
    printContract = print;
    registryContract = registry;
    galleryContract = gallery;
    creatorContract = creator;
    publisherContract = publisher;
  });

  it("deploy: deploy is ok", async function () {
    // expect(await chocomint.name()).to.equal(contractName);
    // expect(await chocomint.symbol()).to.equal(contractSymbol);
    // expect(await chocomint.supplyLimit()).to.equal(supplyLimit);
    // expect(await chocomint.ownerCutRatio()).to.equal(ownerCutRatio);
    // expect(await chocomint.ratioBase()).to.equal(ratioBase);
  });
});
