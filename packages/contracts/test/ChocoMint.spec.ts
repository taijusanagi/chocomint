import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);
const { expect } = chai;

describe("Token contract", function () {
  let chocoMint;
  const name = "name";
  const symbol = "symbol";
  const tokenUri = "tokenUri";
  const amount = 5;
  const mintedTokenId = 1;
  this.beforeAll("initialization.", async function () {
    const ChocoMint = await ethers.getContractFactory("ChocoMint");
    chocoMint = await ChocoMint.deploy(name, symbol);
  });
  it("initialization", async function () {
    expect(await chocoMint.name()).to.equal(name);
    expect(await chocoMint.symbol()).to.equal(symbol);
  });
  it("mint", async function () {
    const [owner] = await ethers.getSigners();
    await chocoMint.mint(amount, tokenUri);
    expect(await chocoMint.uri(mintedTokenId)).to.equal(tokenUri);
    expect(await chocoMint.balanceOf(owner.address, mintedTokenId)).to.equal(
      amount
    );
  });
});
