import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import * as IPFS from "ipfs-mini";
import axios from "axios";
chai.use(solidity);
const { expect } = chai;

describe("Token contract", function () {
  let chocoMint;
  const contractName = "EthereumChocoMintV1";
  const contractSymbol = "ETHCM1";
  this.beforeAll("initialization.", async function () {
    const ChocoMint = await ethers.getContractFactory("ChocoMint_V1");
    chocoMint = await ChocoMint.deploy(contractName, contractSymbol);
  });

  it("case: deploy is ok / check: name, symbol", async function () {
    expect(await chocoMint.name()).to.equal(contractName);
    expect(await chocoMint.symbol()).to.equal(contractSymbol);
  });

  it("case: mint is ok / check: tokenURI", async function () {
    const ipfs = new IPFS({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
    });
    const baseTokenUri = "https://ipfs.io/ipfs/";
    const [signer] = await ethers.getSigners();
    const choco = {
      name: "name",
      description: "description",
      image: "image",
      initial_price: "10000",
      creator_fee: "100",
      creator: signer.address.toLowerCase(),
      signature: "0x",
    };
    const messageHash = ethers.utils.solidityKeccak256(
      ["string", "string", "string", "uint256", "uint256", "address"],
      [
        choco.name,
        choco.description,
        choco.image,
        choco.initial_price,
        choco.creator_fee,
        choco.creator,
      ]
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    choco.signature = await signer.signMessage(messageHashBinary);
    const metadataBuffer = Buffer.from(JSON.stringify(choco));
    const cid = await ipfs.add(metadataBuffer);
    await chocoMint.mint(
      [
        choco.name,
        choco.description,
        choco.image,
        choco.initial_price,
        choco.creator_fee,
        choco.creator,
        choco.signature,
      ],
      {
        value: choco.initial_price,
      }
    );
    const tokenURI = await chocoMint.tokenURI(messageHash);
    expect(tokenURI).to.equal(`${baseTokenUri}${cid}`);
    const { data } = await axios.get(tokenURI);
    expect(JSON.stringify(choco)).to.equal(JSON.stringify(data));
  });
});
