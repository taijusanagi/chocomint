import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

import {
  initialize,
  publisherName,
  publisherSymbol,
  ownershipName,
  ownershipSymbol,
  getNetwork,
} from "../helpers/deploy";

import { hashChoco, getPrices } from "../helpers/util";

import { hardhatChainId, dummyMetadataIpfsHash } from "../helpers/mock";

import {
  defaultSupplyLimit,
  defaultDiluter,
  defaultInitialPrice,
  defaultRoyaltyRatio,
  defaultCrr,
  nullAddress,
} from "../helpers/constant";

import configs from "../network.json";

chai.use(solidity);
const { expect } = chai;

describe("Chocomint", function () {
  let publisherContract;
  let ownershipContract;

  let ownerSigner, ownershipSigner;
  let networkName;

  const { pricesAtEachSupply, virtualReserve } = getPrices(
    defaultSupplyLimit,
    defaultInitialPrice,
    defaultDiluter,
    defaultCrr,
    defaultRoyaltyRatio
  );

  this.beforeEach("initialization.", async function () {
    networkName = getNetwork();
    [ownerSigner, ownershipSigner] = await ethers.getSigners();
    const { publisher, ownership } = await initialize(networkName);
    publisherContract = publisher;
    ownershipContract = ownership;
  });

  it("deploy: deploy is ok", async function () {
    const { aaveLendingPoolAddress, aaveWETHGatewayAddress } = configs[networkName];
    expect(await ownershipContract.name()).to.equal(ownershipName);
    expect(await ownershipContract.symbol()).to.equal(ownershipSymbol);
    expect(await ownershipContract.chocomintPublisher()).to.equal(publisherContract.address);
    expect(await publisherContract.name()).to.equal(publisherName);
    expect(await publisherContract.symbol()).to.equal(publisherSymbol);
    expect(await publisherContract.chocomintOwnership()).to.equal(ownershipContract.address);
    expect(await publisherContract.aaveLendingPool()).to.equal(aaveLendingPoolAddress);
    expect(await publisherContract.aaveWETHGateway()).to.equal(aaveWETHGatewayAddress);
  });

  it("initialization fails after initialized", async function () {
    await expect(ownershipContract.initialize(ownerSigner.address)).to.revertedWith(
      "contract is already initialized"
    );
    await expect(
      publisherContract.initialize(ownerSigner.address, ownerSigner.address, ownerSigner.address)
    ).to.revertedWith("contract is already initialized");
  });

  it("calculateVirtualReserve", async function () {
    expect(
      await publisherContract.calculateVirtualReserve(
        defaultInitialPrice,
        defaultDiluter,
        defaultCrr
      )
    ).to.equal(virtualReserve);
  });

  it("calculatePrice", async function () {
    expect(
      await publisherContract.calculatePrintPrice(virtualReserve, defaultDiluter, defaultCrr)
    ).to.equal(defaultInitialPrice);
  });

  it("calculateRoyalty", async function () {
    expect(
      await publisherContract.calculateRoyalty(
        pricesAtEachSupply[0].printPrice,
        defaultRoyaltyRatio
      )
    ).to.equal(pricesAtEachSupply[0].royalty);
  });

  it("publish", async function () {
    const creatorAddress = ownershipSigner.address;
    const currency = nullAddress;
    const tokenId = hashChoco(
      hardhatChainId,
      publisherContract.address,
      currency,
      creatorAddress,
      dummyMetadataIpfsHash,
      defaultSupplyLimit,
      defaultInitialPrice,
      defaultDiluter,
      defaultCrr,
      defaultRoyaltyRatio
    );
    const tokenIdBinary = ethers.utils.arrayify(tokenId);
    const signature = await ownershipSigner.signMessage(tokenIdBinary);
    await publisherContract
      .connect(ownerSigner)
      .publishAndMintPrint(
        currency,
        creatorAddress,
        dummyMetadataIpfsHash,
        defaultSupplyLimit,
        defaultInitialPrice,
        defaultDiluter,
        defaultCrr,
        defaultRoyaltyRatio,
        signature,
        defaultInitialPrice,
        0,
        {
          value: defaultInitialPrice,
        }
      );
    // check input is properly kept in contract
    expect(await publisherContract.currencies(tokenId)).to.equal(currency);
    expect(await publisherContract.creators(tokenId)).to.equal(creatorAddress);
    expect(await publisherContract.ipfsHashes(tokenId)).to.equal(dummyMetadataIpfsHash);
    expect(await publisherContract.totalSupplies(tokenId)).to.equal(1);
    expect(await publisherContract.supplyLimits(tokenId)).to.equal(defaultSupplyLimit);
    expect(await publisherContract.initialPrices(tokenId)).to.equal(defaultInitialPrice);
    expect(await publisherContract.diluters(tokenId)).to.equal(defaultDiluter);
    expect(await publisherContract.crrs(tokenId)).to.equal(defaultCrr);
    expect(await publisherContract.royaltyRatios(tokenId)).to.equal(defaultRoyaltyRatio);
    expect(await publisherContract.reserveBalances(tokenId)).to.equal(
      pricesAtEachSupply[1].reserveBalance
    );
    expect(await publisherContract.royaltyBalances(tokenId)).to.equal(
      pricesAtEachSupply[0].royalty
    );
  });

  it("publish and print, print, burn, burn and check price", async function () {
    const creatorAddress = ownershipSigner.address;
    const currency = nullAddress;
    const tokenId = hashChoco(
      hardhatChainId,
      publisherContract.address,
      currency,
      creatorAddress,
      dummyMetadataIpfsHash,
      defaultSupplyLimit,
      defaultInitialPrice,
      defaultDiluter,
      defaultCrr,
      defaultRoyaltyRatio
    );
    const tokenIdBinary = ethers.utils.arrayify(tokenId);
    const signature = await ownershipSigner.signMessage(tokenIdBinary);
    await publisherContract
      .connect(ownerSigner)
      .publishAndMintPrint(
        currency,
        creatorAddress,
        dummyMetadataIpfsHash,
        defaultSupplyLimit,
        defaultInitialPrice,
        defaultDiluter,
        defaultCrr,
        defaultRoyaltyRatio,
        signature,
        defaultInitialPrice,
        0,
        {
          value: defaultInitialPrice,
        }
      );
    const [firstSuppliedPrintPrice] = await publisherContract.getPrintPrice(tokenId);
    expect(firstSuppliedPrintPrice).to.equal(pricesAtEachSupply[1].printPrice);

    // this is using publish and mint for same time transaction
    await publisherContract
      .connect(ownerSigner)
      .publishAndMintPrint(
        currency,
        creatorAddress,
        dummyMetadataIpfsHash,
        defaultSupplyLimit,
        defaultInitialPrice,
        defaultDiluter,
        defaultCrr,
        defaultRoyaltyRatio,
        signature,
        pricesAtEachSupply[1].printPrice,
        0,
        {
          value: pricesAtEachSupply[1].printPrice,
        }
      );
    const [secondSuppliedPrintPrice] = await publisherContract.getPrintPrice(tokenId);
    expect(secondSuppliedPrintPrice).to.equal(pricesAtEachSupply[2].printPrice);

    // once nft is published only token id is required to mint print
    await publisherContract
      .connect(ownerSigner)
      .mintPrint(tokenId, pricesAtEachSupply[2].printPrice, 0, {
        value: pricesAtEachSupply[2].printPrice,
      });

    const [thirdSuppliedPrintPrice] = await publisherContract.getPrintPrice(tokenId);
    expect(thirdSuppliedPrintPrice).to.equal(pricesAtEachSupply[3].printPrice);

    const totalSupplyAfterPrint = await publisherContract.totalSupplies(tokenId);
    expect(totalSupplyAfterPrint).to.equal(3);

    // stop printing, start burning

    const thirdSuppliedBurnPrice = await publisherContract.getBurnPrice(tokenId);
    expect(thirdSuppliedBurnPrice).to.equal(pricesAtEachSupply[3].burnPrice);

    await publisherContract.connect(ownerSigner).burnPrint(tokenId, 3);

    const secondSuppliedBurnPrice = await publisherContract.getBurnPrice(tokenId);
    expect(secondSuppliedBurnPrice).to.equal(pricesAtEachSupply[2].burnPrice);

    await publisherContract.connect(ownerSigner).burnPrint(tokenId, 2);

    const firstSuppliedBurnPrice = await publisherContract.getBurnPrice(tokenId);
    expect(firstSuppliedBurnPrice).to.equal(pricesAtEachSupply[1].burnPrice);

    await publisherContract.connect(ownerSigner).burnPrint(tokenId, 1);

    const zeroSuppliedBurnPrice = await publisherContract.getBurnPrice(tokenId);
    expect(zeroSuppliedBurnPrice).to.equal(pricesAtEachSupply[0].burnPrice);

    await expect(publisherContract.connect(ownerSigner).burnPrint(tokenId, 0)).to.revertedWith(
      "total supply must be more than 0"
    );
  });
});
