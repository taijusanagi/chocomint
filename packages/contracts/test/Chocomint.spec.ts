import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);
const { expect } = chai;

import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

describe("Chocomint", function () {
  let chocomint;
  const chainId = "31337";
  const nullAddress = "0x0000000000000000000000000000000000000000";
  const contractName = "ChocoMintEthereum";
  const contractSymbol = "CME";

  const metadataIpfsCid = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";
  const metadataIpfsHash =
    "0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89";

  const ipfsBaseUrl = "ipfs://";

  const firstTokenIndex = 1;
  const firstTokenMintedTotalSupply = firstTokenIndex;

  let creator, minter, receiver, malicious;

  this.beforeEach("initialization.", async function () {
    [creator, minter, receiver, malicious] = await ethers.getSigners();
    const Chocomint = await ethers.getContractFactory("Chocomint");
    chocomint = await Chocomint.deploy(contractName, contractSymbol);
  });

  it("deploy: deploy is ok / check: name, symbol, totalSupply", async function () {
    expect(await chocomint.name()).to.equal(contractName);
    expect(await chocomint.symbol()).to.equal(contractSymbol);
    expect(await chocomint.totalSupply()).to.equal(
      firstTokenMintedTotalSupply - 1
    );
  });

  //Senario Testing

  it("mint: mint by creator and creator get the NFT", async function () {
    await chocomint.mint(metadataIpfsHash, creator.address, {
      from: creator.address,
    });
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(creator.address);
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    const hash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [metadataIpfsHash, creator.address]
    );
    expect(await chocomint.publishedTokenId(hash)).to.equal(firstTokenIndex);
    expect(await chocomint.totalSupply()).to.equal(firstTokenMintedTotalSupply);
    expect(await chocomint.tokenURI(firstTokenIndex)).to.equal(
      `${ipfsBaseUrl}${metadataIpfsCid}`
    );
  });

  it("mint: mint by creator and other receiver get the NFT", async function () {
    await chocomint.mint(metadataIpfsHash, receiver.address, {
      from: creator.address,
    });
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(receiver.address);
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    const hash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [metadataIpfsHash, creator.address]
    );
    expect(await chocomint.publishedTokenId(hash)).to.equal(firstTokenIndex);
    expect(await chocomint.totalSupply()).to.equal(firstTokenMintedTotalSupply);
    expect(await chocomint.tokenURI(firstTokenIndex)).to.equal(
      `${ipfsBaseUrl}${metadataIpfsCid}`
    );
  });

  it("mint: mint by creator and same asset cannot be minted (reverted)", async function () {
    await chocomint.mint(metadataIpfsHash, creator.address, {
      from: creator.address,
    });
    await expect(
      chocomint.mint(metadataIpfsHash, creator.address, {
        from: creator.address,
      })
    ).to.be.revertedWith("this ipfsHash and creator NFT is already published");
  });

  it("minamint: sign by creator and minter mint by paying fee (like cloud sale)", async function () {
    const value = 100;
    const whiteListed = false;
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "uint256", "address"],
      [chainId, chocomint.address, metadataIpfsHash, value, nullAddress]
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    const messageHashBinaryBuffer = Buffer.from(messageHashBinary);
    const leaves = [messageHashBinaryBuffer, messageHashBinaryBuffer];
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const proof = tree.getHexProof(messageHashBinaryBuffer);
    const signature = await creator.signMessage(ethers.utils.arrayify(root));
    await chocomint.minamint(
      metadataIpfsHash,
      creator.address,
      receiver.address,
      value,
      whiteListed,
      root,
      proof,
      signature,
      {
        from: creator.address,
        value,
      }
    );
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(receiver.address);
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    const hash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [metadataIpfsHash, creator.address]
    );
    expect(await chocomint.publishedTokenId(hash)).to.equal(firstTokenIndex);
    expect(await chocomint.totalSupply()).to.equal(firstTokenMintedTotalSupply);
    expect(await chocomint.tokenURI(firstTokenIndex)).to.equal(
      `${ipfsBaseUrl}${metadataIpfsCid}`
    );
  });

  it("minamint: sign by creator and minter mint and creator get it", async function () {
    const value = 0;
    const whiteListed = true;
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "uint256", "address"],
      [chainId, chocomint.address, metadataIpfsHash, value, creator.address]
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    const messageHashBinaryBuffer = Buffer.from(messageHashBinary);
    const leaves = [messageHashBinaryBuffer, messageHashBinaryBuffer];
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const proof = tree.getHexProof(messageHashBinaryBuffer);
    const signature = await creator.signMessage(ethers.utils.arrayify(root));
    await chocomint.minamint(
      metadataIpfsHash,
      creator.address,
      creator.address,
      value,
      whiteListed,
      root,
      proof,
      signature,
      {
        from: creator.address,
        value,
      }
    );
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(creator.address);
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    const hash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [metadataIpfsHash, creator.address]
    );
    expect(await chocomint.publishedTokenId(hash)).to.equal(firstTokenIndex);
    expect(await chocomint.totalSupply()).to.equal(firstTokenMintedTotalSupply);
    expect(await chocomint.tokenURI(firstTokenIndex)).to.equal(
      `${ipfsBaseUrl}${metadataIpfsCid}`
    );
  });

  it("minamint: price is not enough(reverted)", async function () {
    const value = 100;
    const whiteListed = false;
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "uint256", "address"],
      [chainId, chocomint.address, metadataIpfsHash, value, nullAddress]
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    const messageHashBinaryBuffer = Buffer.from(messageHashBinary);
    const leaves = [messageHashBinaryBuffer, messageHashBinaryBuffer];
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const proof = tree.getHexProof(messageHashBinaryBuffer);
    const signature = await creator.signMessage(ethers.utils.arrayify(root));
    await expect(
      chocomint.minamint(
        metadataIpfsHash,
        creator.address,
        receiver.address,
        value,
        whiteListed,
        root,
        proof,
        signature,
        {
          from: creator.address,
          value: value - 1,
        }
      )
    ).to.be.revertedWith("msg value must be more than signed price");
  });

  it("minamint: receiver is not whitelisted(reverted with hash is not included in merkle tree)", async function () {
    const value = 100;
    const whiteListed = true; // this is changed to true
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "uint256", "address"],
      [chainId, chocomint.address, metadataIpfsHash, value, receiver.address] // this is changed
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    const messageHashBinaryBuffer = Buffer.from(messageHashBinary);
    const leaves = [messageHashBinaryBuffer, messageHashBinaryBuffer];
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const proof = tree.getHexProof(messageHashBinaryBuffer);
    const signature = await creator.signMessage(ethers.utils.arrayify(root));
    await expect(
      chocomint.minamint(
        metadataIpfsHash,
        creator.address,
        malicious.address, //this address is different from hash
        value,
        whiteListed,
        root,
        proof,
        signature,
        {
          from: creator.address,
          value,
        }
      )
    ).to.be.revertedWith("Must be included in merkle tree");
  });

  it("minamint: receiver is not whitelisted(reverted with hash is not included in merkle tree)", async function () {
    const value = 100;
    const whiteListed = false;
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "uint256", "address"],
      [chainId, chocomint.address, metadataIpfsHash, value, nullAddress]
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    const messageHashBinaryBuffer = Buffer.from(messageHashBinary);
    const leaves = [messageHashBinaryBuffer, messageHashBinaryBuffer];
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const proof = tree.getHexProof(messageHashBinaryBuffer);
    const signature = await malicious.signMessage(ethers.utils.arrayify(root));
    await expect(
      chocomint.minamint(
        metadataIpfsHash,
        creator.address,
        receiver.address,
        value,
        whiteListed,
        root,
        proof,
        signature,
        {
          from: creator.address,
          value,
        }
      )
    ).to.be.revertedWith("signer must be valid for creator");
  });
});
