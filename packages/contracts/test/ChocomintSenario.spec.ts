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
  BASE_RATIO,
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

    // this is ecpected
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
    const printPriceForFirstPrint = await publisherContract.calculatePrintPrice(
      virtualReserve,
      virtualSupply,
      crr
    );
    // check price calculation is ok
    expect(printPriceForFirstPrint).to.equal(expectedPriceForFirstPrint);

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
          value: printPriceForFirstPrint,
        }
      );

    // check royality caluculation is correct
    const royality = await publisherContract.calculateRoyality(
      printPriceForFirstPrint,
      royalityRatio
    );
    expect(await publisherContract.getRoyality(printPriceForFirstPrint, tokenId)).to.equal(
      royality
    );

    const reserve = printPriceForFirstPrint - royality;

    // check input is properly kept in contract
    expect(await publisherContract.ipfsHashes(tokenId)).to.equal(dummyMetadataIpfsHash);
    expect(await publisherContract.totalSupplies(tokenId)).to.equal(1);
    expect(await publisherContract.supplyLimits(tokenId)).to.equal(supplyLimit);
    expect(await publisherContract.totalReserves(tokenId)).to.equal(reserve);
    expect(await publisherContract.virtualSupplies(tokenId)).to.equal(virtualSupply);
    expect(await publisherContract.virtualReserves(tokenId)).to.equal(virtualReserve);
    expect(await publisherContract.crrs(tokenId)).to.equal(crr);
    expect(await publisherContract.royalityRatios(tokenId)).to.equal(royalityRatio);

    // check creator token is properly minted and get royality
    expect(await creatorContract.ownerOf(tokenId)).to.equal(creatorSigner.address, "ownerOf");
    expect(await creatorContract.balances(tokenId)).to.equal(royality, "balances");
  });

  it("publish and print, print, burn, burn and check price", async function () {
    // setup initial purchase price is 0.001ETH
    const supplyLimit = 100;
    const virtualSupply = 100;
    const virtualReserve = ethers.utils.parseEther("0.1");
    const crr = 1000; // 10%
    const royalityRatio = 1000; //10%

    // this is ecpected
    const expectedPriceForFirstPrint = "10000000000000000";
    const expectedPriceForSecondPrint = "10792079207920000";
    const expectedPriceForThirdPrint = "11638516792850000";
    const expectedPriceForForthPrint = "12542479262200000";

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
    const printPriceForFirstPrint = await publisherContract.calculatePrintPrice(
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
          value: printPriceForFirstPrint,
        }
      );

    // check second price is correct
    expect(await publisherContract.getPrintPrice(tokenId)).to.equal(expectedPriceForSecondPrint);

    // this is using publish and mint for same time transaction
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
    // check third price is correct
    expect(await publisherContract.getPrintPrice(tokenId)).to.equal(expectedPriceForThirdPrint);

    // once nft is published only token id is required to mint print
    await publisherContract.connect(ownerSigner).mintPrint(tokenId, {
      value: expectedPriceForThirdPrint,
    });
    // check third price is correct
    expect(await publisherContract.getPrintPrice(tokenId)).to.equal(expectedPriceForForthPrint);

    expect(await publisherContract.getBurnPrice(tokenId)).to.equal(
      ethers.BigNumber.from(expectedPriceForThirdPrint).sub(
        await publisherContract.getRoyality(expectedPriceForThirdPrint, tokenId)
      )
    );
    await publisherContract
      .connect(ownerSigner)
      .burnPrint(tokenId, await publisherContract.totalSupplies(tokenId));

    expect(await publisherContract.getBurnPrice(tokenId)).to.equal(
      ethers.BigNumber.from(expectedPriceForSecondPrint).sub(
        await publisherContract.getRoyality(expectedPriceForSecondPrint, tokenId)
      )
    );
    await publisherContract
      .connect(ownerSigner)
      .burnPrint(tokenId, await publisherContract.totalSupplies(tokenId));
    expect(await publisherContract.getBurnPrice(tokenId)).to.equal(
      ethers.BigNumber.from(expectedPriceForFirstPrint).sub(
        await publisherContract.getRoyality(expectedPriceForFirstPrint, tokenId)
      )
    );
    await publisherContract
      .connect(ownerSigner)
      .burnPrint(tokenId, await publisherContract.totalSupplies(tokenId));

    await expect(
      publisherContract
        .connect(ownerSigner)
        .burnPrint(tokenId, await publisherContract.totalSupplies(tokenId))
    ).to.revertedWith("total supply must be more than 0");

    // check price calculation is ok
    expect(await publisherContract.getPrintPrice(tokenId)).to.equal(printPriceForFirstPrint);
  });
});
