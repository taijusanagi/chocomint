import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

const createClient = require("ipfs-http-client");

//this endpoint is too slow
export const ipfs = createClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

chai.use(solidity);
const { expect } = chai;

describe("Chocomint Original", function () {
  let chocomint;
  const contractName = "ChocoMintEthereum";
  const contractSymbol = "CME";
  this.beforeAll("initialization.", async function () {
    const Chocomint = await ethers.getContractFactory("Chocomint");
    chocomint = await Chocomint.deploy(contractName, contractSymbol);
  });

  it("case: deploy is ok / check: name, symbol", async function () {
    expect(await chocomint.name()).to.equal(contractName);
    expect(await chocomint.symbol()).to.equal(contractSymbol);
  });

  it("case: mint is ok / check: tokenURI", async function () {
    const imageCid = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";
    const imageHash =
      "0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89";
    await chocomint.mint(imageHash);
    const tokenURI = await chocomint.tokenURI(1);
    expect(tokenURI).to.equal(`ipfs://${imageCid}`);
  });
});
