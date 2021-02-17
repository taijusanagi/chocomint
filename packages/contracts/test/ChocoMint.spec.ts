import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);
const { expect } = chai;
const fs = require("fs");
var path = require("path");

describe("Token contract", function () {
  let chocoMint;
  const name = "name";
  const symbol = "symbol";
  const tokenUri = "tokenUri";
  const owner = "0x0000000000000000000000000000000000000001";
  const amount = 5;
  const mintedTokenId = 1;
  this.beforeAll("initialization.", async function () {
    const ChocoMint = await ethers.getContractFactory("IPFS");
    chocoMint = await ChocoMint.deploy();
  });
  it("string", async function () {
    console.log("start");
    var testfile = fs
      .readFileSync(path.join(__dirname, "./testfile"))
      .toString();
    console.log(await chocoMint.getCid(testfile));
  });
  // it("initialization", async function () {
  //   expect(await chocoMint.name()).to.equal(name);
  //   expect(await chocoMint.symbol()).to.equal(symbol);
  // });
  // it("mint", async function () {
  //   await chocoMint.mint(owner, amount, tokenUri, "0x");
  //   expect(await chocoMint.uri(mintedTokenId)).to.equal(tokenUri);
  //   expect(await chocoMint.balanceOf(owner, mintedTokenId)).to.equal(amount);
  // });
});
