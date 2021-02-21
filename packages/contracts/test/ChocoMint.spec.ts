import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import * as ipfsHash from "ipfs-only-hash";

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
    const baseTokenUri = "ipfs://";
    const [signer] = await ethers.getSigners();
    const iss = signer.address.toLowerCase();
    const choco = {
      name: "The Innovators Key #500",
      description: "",
      image:
        "0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89",
      animation_url:
        "0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89",
      initial_price: "10000",
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
        choco.animation_url,
        choco.initial_price,
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
      // [
      // choco.name,
      // choco.description,
      // choco.image,
      // choco.animation_url,
      // choco.initial_price,
      // choco.fees,
      // choco.recipients,
      // choco.iss,
      // choco.sub,
      // choco.root,
      // choco.proof,
      // choco.signature,
      // ],
      {
        value: choco.initial_price,
      }
    );
    const tokenId = ethers.utils.solidityKeccak256(
      ["bytes32", "bytes32"],
      [messageHash, choco.root]
    );
    const metadataString = JSON.stringify({
      chainId: chainId.toString(),
      contractAddress: chocomint.address.toLowerCase(),
      tokenId: ethers.BigNumber.from(tokenId).toString(),
      ...choco,
    });
    const metadataBuffer = Buffer.from(metadataString);
    const cid = await ipfsHash.of(metadataBuffer);
    const tokenURI = await chocomint.tokenURI(tokenId);
    expect(tokenURI).to.equal(`${baseTokenUri}${cid}`);
  });
});
