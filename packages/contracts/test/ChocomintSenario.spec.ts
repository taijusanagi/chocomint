import { ethers, waffle } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

import {
  initialize,
  creatorName,
  creatorSymbol,
  hashPublishMessage,
  hardhatChainId,
  dummyMetadataIpfsCid,
  dummyMetadataIpfsHash,
} from "../helper";

const provider = waffle.provider;

chai.use(solidity);
const { expect } = chai;

describe("Chocomint", function () {
  let publisherContract;
  let creatorContract;

  let ownerSigner, creatorSigner;
  this.beforeEach("initialization.", async function () {
    [ownerSigner, creatorSigner] = await ethers.getSigners();
    const { publisher, creator } = await initialize();
    publisherContract = publisher;
    creatorContract = creator;
  });

  it("deploy: deploy is ok", async function () {
    // TODO: check ERC1155 name, symbol if opensea requires this

    expect(await creatorContract.name()).to.equal(creatorName);
    expect(await creatorContract.symbol()).to.equal(creatorSymbol);
    expect(await creatorContract.chocomintPublisher()).to.equal(publisherContract.address);
    expect(await publisherContract.chocomintCreator()).to.equal(creatorContract.address);
  });

  it("initialization fails after initialized", async function () {
    await expect(creatorContract.initialize(ownerSigner.address)).to.revertedWith(
      "contract is already initialized"
    );
    await expect(publisherContract.initialize(ownerSigner.address)).to.revertedWith(
      "contract is already initialized"
    );
  });

  it("publish", async function () {
    // setup initial purchase price is 0.001ETH
    const supplyLimit = 100;
    const virtualSupply = 100;
    const virtualReserve = ethers.utils.parseEther("0.1");
    const crr = 1000; // 10%
    const royalityRatio = 1000; //10%
    const expectedPriceForFirstPrint = "10000000000000000";

    const tokenId = hashPublishMessage(
      hardhatChainId,
      publisherContract.address,
      creatorSigner.address,
      dummyMetadataIpfsHash,
      supplyLimit,
      virtualSupply,
      virtualReserve,
      crr,
      royalityRatio
    );
    const tokenIdBinary = ethers.utils.arrayify(tokenId);
    const signature = await creatorSigner.signMessage(tokenIdBinary);
    const printPrice = await publisherContract.calculatePrintPrice(
      virtualReserve,
      virtualSupply,
      crr
    );
    // check price calculation is ok
    expect(printPrice).to.equal(expectedPriceForFirstPrint, "printPrice");

    await publisherContract
      .connect(ownerSigner)
      .publishAndMintPrint(
        dummyMetadataIpfsHash,
        creatorSigner.address,
        supplyLimit,
        virtualSupply,
        virtualReserve,
        crr,
        royalityRatio,
        signature,
        {
          value: printPrice,
        }
      );

    // check royality caluculation is correct
    const royality = await publisherContract.calculateRoyality(printPrice, royalityRatio);
    expect(await publisherContract.getRoyality(printPrice, tokenId)).to.equal(royality);

    const reserve = printPrice - royality;

    // check input is properly kept in contract
    expect(await publisherContract.ipfsHashes(tokenId)).to.equal(
      dummyMetadataIpfsHash,
      "ipfsHashes"
    );
    expect(await publisherContract.totalSupplies(tokenId)).to.equal(1, "totalSupplies");
    expect(await publisherContract.supplyLimits(tokenId)).to.equal(supplyLimit, "supplyLimits");
    expect(await publisherContract.totalReserves(tokenId)).to.equal(reserve, "totalReserves");
    expect(await publisherContract.virtualSupplies(tokenId)).to.equal(
      virtualSupply,
      "virtualSupplies"
    );
    expect(await publisherContract.virtualReserves(tokenId)).to.equal(
      virtualReserve,
      "virtualReserves"
    );
    expect(await publisherContract.crrs(tokenId)).to.equal(crr, "crrs");
    expect(await publisherContract.royalityRatios(tokenId)).to.equal(
      royalityRatio,
      "royalityRatios"
    );

    // check creator token is properly minted
    expect(await creatorContract.ownerOf(tokenId)).to.equal(creatorSigner.address, "ownerOf");
  });

  it("publish and print", async function () {
    // setup initial purchase price is 0.001ETH
    const supplyLimit = 100;
    const virtualSupply = 100;
    const virtualReserve = ethers.utils.parseEther("0.1");
    const crr = 1000; // 10%
    const royalityRatio = 1000; //10%
    const expectedPriceForSecondPrint = "10900000000000000";
    const tokenId = hashPublishMessage(
      hardhatChainId,
      publisherContract.address,
      creatorSigner.address,
      dummyMetadataIpfsHash,
      supplyLimit,
      virtualSupply,
      virtualReserve,
      crr,
      royalityRatio
    );
    const tokenIdBinary = ethers.utils.arrayify(tokenId);
    const signature = await creatorSigner.signMessage(tokenIdBinary);
    const printPrice = await publisherContract.calculatePrintPrice(
      virtualReserve,
      virtualSupply,
      crr
    );
    await publisherContract
      .connect(ownerSigner)
      .publishAndMintPrint(
        dummyMetadataIpfsHash,
        creatorSigner.address,
        supplyLimit,
        virtualSupply,
        virtualReserve,
        crr,
        royalityRatio,
        signature,
        {
          value: printPrice,
        }
      );
    expect(await publisherContract.getPrintPrice(tokenId)).to.equal(expectedPriceForSecondPrint);

    await publisherContract
      .connect(ownerSigner)
      .publishAndMintPrint(
        dummyMetadataIpfsHash,
        creatorSigner.address,
        supplyLimit,
        virtualSupply,
        virtualReserve,
        crr,
        royalityRatio,
        signature,
        {
          value: expectedPriceForSecondPrint,
        }
      );
  });
});
