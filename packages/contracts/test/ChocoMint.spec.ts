import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import * as IPFS from "ipfs-mini";
import axios from "axios";
chai.use(solidity);
const { expect } = chai;
const { MerkleTree } = require("../modules/merkleTree.js");

describe("Token contract", function () {
  let chocoMint;
  const contractName = "ChocoMintEthereumV1";
  const contractSymbol = "CMETH1";
  this.beforeAll("initialization.", async function () {
    const ChocoMint = await ethers.getContractFactory("ChocoMint");
    chocoMint = await ChocoMint.deploy(contractName, contractSymbol);
  });

  it("case: deploy is ok / check: name, symbol", async function () {
    expect(await chocoMint.name()).to.equal(contractName);
    expect(await chocoMint.symbol()).to.equal(contractSymbol);
  });

  it("case: markle tree is ok", async function () {
    const choco1 = {
      name: "name #1",
      description: "description",
      image: "image",
    };
    const message1 = ethers.utils.solidityPack(
      ["string", "string", "string"],
      [choco1.name, choco1.description, choco1.image]
    );
    const messageHash1 = ethers.utils.solidityKeccak256(
      ["string", "string", "string"],
      [choco1.name, choco1.description, choco1.image]
    );
    const choco2 = {
      name: "name #2",
      description: "description",
      image: "image",
    };
    const message2 = ethers.utils.solidityPack(
      ["string", "string", "string"],
      [choco2.name, choco2.description, choco2.image]
    );
    const messageHash2 = ethers.utils.solidityKeccak256(
      ["string", "string", "string"],
      [choco2.name, choco2.description, choco2.image]
    );
    console.log(messageHash1);
    console.log(messageHash2);
    const elements = [Buffer.from(message1), Buffer.from(message2)];
    const merkleTree = new MerkleTree(elements);
    const root = merkleTree.getHexRoot();
    const proof1 = merkleTree.getHexProof(elements[0]);
    const proof2 = merkleTree.getHexProof(elements[1]);
    console.log(await chocoMint.test(proof1, root, message1));
    console.log(await chocoMint.test(proof2, root, message2));
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
      signature: "",
    };
    const chainId = await chocoMint.getChainID();
    const messageHash = ethers.utils.solidityKeccak256(
      [
        "uint256",
        "address",
        "string",
        "string",
        "string",
        "uint256",
        "uint256",
        "address",
      ],
      [
        chainId,
        chocoMint.address,
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
    const metadataString = JSON.stringify({
      chainId: chainId.toString(),
      address: chocoMint.address.toLowerCase(),
      ...choco,
    });
    const metadataBuffer = Buffer.from(metadataString);
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
    expect(metadataString).to.equal(JSON.stringify(data));
  });
});
