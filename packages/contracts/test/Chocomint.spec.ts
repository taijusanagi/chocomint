import { ethers, waffle } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

const provider = waffle.provider;

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
  const metadataIpfsCidForBulk =
    "QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u";
  const metadataIpfsHash =
    "0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89";

  const metadataIpfsHashForBulk =
    "0x74410577111096cd817a3faed78630f2245636beded412d3b212a2e09ba593ca";

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

  it("tokenURI: token must exist", async function () {
    await expect(chocomint.tokenURI(firstTokenIndex)).to.be.revertedWith(
      "token must exist"
    );
  });

  //Senario Testing

  it("mint: mint by creator and creator gets the NFT", async function () {
    await chocomint.mint(metadataIpfsHash, nullAddress); //this is null address
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(creator.address); //check creator has NFT
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(
      creator.address //tx signer is creator
    );
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(
      creator.address //tx signer is minter
    );
    const hash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [metadataIpfsHash, creator.address]
    );
    expect(await chocomint.publishedTokenId(hash)).to.equal(firstTokenIndex); //check token is published
    expect(await chocomint.totalSupply()).to.equal(firstTokenMintedTotalSupply); //check total supply is incresed
    expect(await chocomint.tokenURI(firstTokenIndex)).to.equal(
      `${ipfsBaseUrl}${metadataIpfsCid}` //check calculated cid is correct
    );
  });

  it("mint: mint by creator and other receiver get the NFT", async function () {
    await chocomint.mint(metadataIpfsHash, receiver.address); //this address is different from receiver
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(receiver.address); //check receiver has NFT
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(
      creator.address //tx signer is creator
    );
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(
      creator.address //tx signer is minter
    );
    const hash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [metadataIpfsHash, creator.address]
    );
    expect(await chocomint.publishedTokenId(hash)).to.equal(firstTokenIndex); //check token is published
    expect(await chocomint.totalSupply()).to.equal(firstTokenMintedTotalSupply); //check total supply is incresed
    expect(await chocomint.tokenURI(firstTokenIndex)).to.equal(
      `${ipfsBaseUrl}${metadataIpfsCid}` //check calculated cid is correct
    );
  });

  it("mint: mint by creator and same asset cannot be minted (reverted)", async function () {
    await chocomint.mint(metadataIpfsHash, creator.address); //token published
    //token already published
    await expect(
      chocomint.mint(metadataIpfsHash, creator.address, {
        from: creator.address,
      })
    ).to.be.revertedWith(
      "The NFT of this ipfsHash and creator is already published"
    );
  });

  it("minamint: sign by creator and minter mint by paying fee like cloud sale", async function () {
    const value = 100;
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
    const previousCreatorBalance = await provider.getBalance(creator.address);
    await chocomint
      .connect(minter) //tx is signed by minter
      .minamint(
        metadataIpfsHash,
        creator.address,
        nullAddress,
        root,
        proof,
        signature,
        {
          value,
        }
      );
    expect(await provider.getBalance(creator.address)).to.equal(
      ethers.BigNumber.from(previousCreatorBalance).add(value) //check price is increased
    );
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(minter.address); //minter get NFT
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(
      minter.address
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
    await chocomint
      .connect(minter)
      .minamint(
        metadataIpfsHash,
        creator.address,
        creator.address,
        root,
        proof,
        signature,
        {
          value,
        }
      );
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(creator.address);
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(
      creator.address
    );
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(
      minter.address
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

  it("minamint: price is not enough(reverted with hash is not included in merkle tree)", async function () {
    const value = 100;
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
        nullAddress,
        root,
        proof,
        signature,
        {
          value: value - 1,
        }
      )
    ).to.be.revertedWith("The hash must be included in the merkle tree");
  });

  it("minamint: receiver is different (reverted with hash is not included in merkle tree)", async function () {
    const value = 100;
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
        root,
        proof,
        signature,
        {
          value,
        }
      )
    ).to.be.revertedWith("The hash must be included in the merkle tree");
  });

  it("minamint: creator is different (reverted with signer must be valid for creator)", async function () {
    const value = 100;
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "uint256", "address"],
      [chainId, chocomint.address, metadataIpfsHash, value, nullAddress] // this is changed
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
        malicious.address,
        nullAddress, //this address is different from hash
        root,
        proof,
        signature,
        {
          value,
        }
      )
    ).to.be.revertedWith("The signer must be valid for the creator");
  });
});
