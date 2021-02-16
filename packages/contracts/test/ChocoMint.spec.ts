import { ethers } from "hardhat";
const { expect } = require("chai");

describe("Token contract", function () {
  let chocoMint;
  const name = "name";
  const symbol = "symbol";
  const tokenUri = "tokenUri";
  const owner = "0x0000000000000000000000000000000000000001";
  const mintedTokenId = 0;
  this.beforeAll("initialization.", async function () {
    const ChocoMint = await ethers.getContractFactory("ChocoMint");
    chocoMint = await ChocoMint.deploy(name, symbol);
  });
  it("initialization", async function () {
    expect(await chocoMint.name()).to.equal(name);
    expect(await chocoMint.symbol()).to.equal(symbol);
  });
  it("mint", async function () {
    await chocoMint.mint(owner, tokenUri);
    expect(await chocoMint.tokenURI(mintedTokenId)).to.equal(tokenUri);
    expect(await chocoMint.ownerOf(mintedTokenId)).to.equal(owner);
  });
});
