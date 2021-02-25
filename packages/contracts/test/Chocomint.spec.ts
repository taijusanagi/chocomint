import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import * as ipfsHash from "ipfs-only-hash";

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
    // chocomint = await Chocomint.deploy();
  });

  // it('case: deploy is ok / check: name, symbol', async function () {
  //   expect(await chocomint.name()).to.equal(contractName);
  //   expect(await chocomint.symbol()).to.equal(contractSymbol);
  // });

  it("case: mint is ok / check: tokenURI", async function () {
    const metadata = {
      image_data: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="#000"></rect><rect class="target" fill="#5cceee" height="100" width="100" y="150" x="50"></rect><rect class="target" height="100" width="100" y="150" x="250" style="fill: rgb(92, 206, 238);"></rect></svg>`,
      name: "test",
    };
    const { cid } = await ipfs.add(Buffer.from(JSON.stringify(metadata)));
    console.log(JSON.stringify(metadata));
    // console.log(cid);
    await chocomint.mint();
    // const metadataString = JSON.stringify({
    //   chainId: chainId.toString(),
    //   contractAddress: chocomint.address.toLowerCase(),
    //   tokenId,
    //   name: `${contractName}#${tokenId}`,
    //   image: `${baseTokenUri}${imageCid}`,
    //   iss,
    // });
    // const metadataBuffer = Buffer.from(metadataString);
    // const cid = await ipfsHash.of(metadataBuffer);
    const tokenURI = await chocomint.tokenURI(1);
    expect(tokenURI).to.equal(`ipfs://${cid.toString()}`);
  });
});
