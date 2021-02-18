import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import * as IPFS from "ipfs-mini";
import axios from "axios";
chai.use(solidity);
const { expect } = chai;

import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

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
    const message = ethers.utils.solidityPack(
      ["string", "string", "string"],
      [choco1.name, choco1.description, choco1.image]
    );
    const messageHash = ethers.utils.solidityKeccak256(
      ["string", "string", "string"],
      [choco1.name, choco1.description, choco1.image]
    );
    const leaves = [Buffer.from(ethers.utils.arrayify(messageHash))];
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const leaf = keccak256(message);
    const proof = tree.getHexProof(leaf);
    expect(await chocoMint.test(proof, root, leaf)).to.equal(true);
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
