import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);
const { expect } = chai;
const fs = require("fs");
var path = require("path");

describe("Token contract", function () {
  let chocoMint;

  this.beforeAll("initialization.", async function () {
    const ChocoMint = await ethers.getContractFactory("ChocoMint_V1");
    chocoMint = await ChocoMint.deploy();
  });

  it("string", async function () {
    await chocoMint.mint([
      "111",
      "111",
      "ipfs://ipfs/QmZ8NsEKRzivgcw4p9CEkUqU8Mo5ZBNiFN2wf33oTtnvvq/nft.png",
    ]);
    console.log(await chocoMint.tokenURI(1));
  });
});
