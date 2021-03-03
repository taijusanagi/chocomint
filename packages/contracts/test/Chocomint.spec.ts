import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);
const { expect } = chai;

describe("Chocomint", function () {
  let chocomint;
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
    [
      { address: creator },
      { address: minter },
      { address: receiver },
      { address: malicious },
    ] = await ethers.getSigners();
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
    await chocomint.mint(metadataIpfsHash, creator, { from: creator });
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(creator);
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(creator);
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(creator);
    const hash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [metadataIpfsHash, creator]
    );
    expect(await chocomint.publishedTokenId(hash)).to.equal(firstTokenIndex);
    expect(await chocomint.totalSupply()).to.equal(firstTokenMintedTotalSupply);
    expect(await chocomint.tokenURI(firstTokenIndex)).to.equal(
      `${ipfsBaseUrl}${metadataIpfsCid}`
    );
  });

  it("mint: mint by creator and other receiver get the NFT", async function () {
    await chocomint.mint(metadataIpfsHash, receiver, { from: creator });
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(receiver);
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(creator);
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(creator);
    const hash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [metadataIpfsHash, creator]
    );
    expect(await chocomint.publishedTokenId(hash)).to.equal(firstTokenIndex);
    expect(await chocomint.totalSupply()).to.equal(firstTokenMintedTotalSupply);
    expect(await chocomint.tokenURI(firstTokenIndex)).to.equal(
      `${ipfsBaseUrl}${metadataIpfsCid}`
    );
  });

  it("mint: mint by creator and same asset cannot be minted (reverted)", async function () {
    await chocomint.mint(metadataIpfsHash, creator, { from: creator });
    await expect(
      chocomint.mint(metadataIpfsHash, creator, { from: creator })
    ).to.be.revertedWith("this ipfsHash and creator NFT is already published");
  });

  it("gigamint: mint by creator and other receiver get the NFT", async function () {
    await chocomint.mint(metadataIpfsHash, receiver, { from: creator });
    expect(await chocomint.ownerOf(firstTokenIndex)).to.equal(receiver);
    expect(await chocomint.creatorMemory(firstTokenIndex)).to.equal(creator);
    expect(await chocomint.minterMemory(firstTokenIndex)).to.equal(creator);
    const hash = ethers.utils.solidityKeccak256(
      ["bytes32", "address"],
      [metadataIpfsHash, creator]
    );
    expect(await chocomint.publishedTokenId(hash)).to.equal(firstTokenIndex);
    expect(await chocomint.totalSupply()).to.equal(firstTokenMintedTotalSupply);
    expect(await chocomint.tokenURI(firstTokenIndex)).to.equal(
      `${ipfsBaseUrl}${metadataIpfsCid}`
    );
  });
});
