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
  let chocomint;
  const contractName = "NFT";
  const contractSymbol = "NFT";
  this.beforeAll("initialization.", async function () {
    const Chocomint = await ethers.getContractFactory("Chocomint");
    chocomint = await Chocomint.deploy();
  });

  it("case: deploy is ok / check: name, symbol", async function () {
    expect(await chocomint.name()).to.equal(contractName);
    expect(await chocomint.symbol()).to.equal(contractSymbol);
  });

  it("case: mint is ok / check: tokenURI", async function () {
    const ipfs = new IPFS({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
    });
    const baseTokenUri = "ipfs://";
    const [signer] = await ethers.getSigners();
    const iss = signer.address.toLowerCase();
    const choco = {
      name: "name",
      description: "description",
      image: "ipfs://QmfA8YURMek3M4JkjXdY1K468ryFGUGuF6EC2U5L7V25Bu/nft.png",
      blank: "",
      initialPrice: "10000",
      fees: ["100"],
      recipients: [iss],
      iss: iss,
      sub: "0x0000000000000000000000000000000000000000",
      root: "",
      proof: [],
      signature: "",
    };

    const chainId = await chocomint.getChainId();
    const messageHash = ethers.utils.solidityKeccak256(
      [
        "uint256",
        "address",
        "string",
        "string",
        "string",
        "string",
        "uint256",
        "uint256[]",
        "address[]",
        "address",
        "address",
      ],
      [
        chainId,
        chocomint.address,
        choco.name,
        choco.description,
        choco.image,
        choco.blank,
        choco.initialPrice,
        choco.fees,
        choco.recipients,
        choco.iss,
        choco.sub,
      ]
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    const messageHashBinaryBuffer = Buffer.from(messageHashBinary);
    const leaves = [messageHashBinaryBuffer, messageHashBinaryBuffer];
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    choco.root = tree.getHexRoot();
    choco.proof = tree.getHexProof(messageHashBinaryBuffer);
    choco.signature = await signer.signMessage(
      ethers.utils.arrayify(choco.root)
    );
    await chocomint.mint(
      [
        choco.name,
        choco.description,
        choco.image,
        choco.blank,
        choco.initialPrice,
        choco.fees,
        choco.recipients,
        choco.iss,
        choco.sub,
        choco.root,
        choco.proof,
        choco.signature,
      ],
      {
        value: choco.initialPrice,
      }
    );
    const tokenId = ethers.utils.solidityKeccak256(
      ["bytes32", "bytes32"],
      [messageHash, choco.root]
    );
    const metadataString = JSON.stringify({
      chainId: chainId.toString(),
      address: chocomint.address.toLowerCase(),
      tokenId: ethers.BigNumber.from(tokenId).toString(),
      ...choco,
    });
    console.log(metadataString);
    const metadataBuffer = Buffer.from(metadataString);
    const cid = await ipfs.add(metadataBuffer);
    console.log(cid);
    const tokenURI = await chocomint.tokenURI(tokenId);
    console.log(await chocomint.getMetadata(tokenId));
    expect(tokenURI).to.equal(`${baseTokenUri}${cid}`);
  });
});
