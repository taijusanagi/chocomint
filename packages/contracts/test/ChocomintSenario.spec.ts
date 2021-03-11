import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import {
  getNetwork,
  deployChocopound,
  deployChocopoundOwnership,
  initializeChocopound,
  initializeChocopoundOwnership,
  approveCurrency,
} from "../helpers/migration";

import {
  chocopoundName,
  chocopoundSymbol,
  ownershipName,
  ownershipSymbol,
} from "../helpers/constant";
import { hashChoco, getPrices, getAaveTokens } from "../helpers/util";
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
  const dummyMetadataIpfsHash =
    "0x7d5a99f603f231d53a4f39d1521f98d2e8bb279cf29bebfd0687dc98458e7f89";
  const hardhatChainId = "31337";

  let chocopoundContract;
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
    chocopoundContract = await deployChocopound();
    ownershipContract = await deployChocopoundOwnership();
    await initializeChocopound();
    await initializeChocopoundOwnership();
    await approveCurrency("WETH");
    await approveCurrency("DAI");
  });

  it("deploy: deploy is ok", async function () {
    const { LendingPool, WETHGateway } = configs[networkName];
    expect(await ownershipContract.name()).to.equal(ownershipName);
    expect(await ownershipContract.symbol()).to.equal(ownershipSymbol);
    expect(await ownershipContract.chocopound()).to.equal(chocopoundContract.address);
    expect(await chocopoundContract.name()).to.equal(chocopoundName);
    expect(await chocopoundContract.symbol()).to.equal(chocopoundSymbol);
    expect(await chocopoundContract.chocomintOwnership()).to.equal(ownershipContract.address);
    expect(await chocopoundContract.aaveLendingPool()).to.equal(LendingPool);
    expect(await chocopoundContract.aaveWETHGateway()).to.equal(WETHGateway);
  });

  it("initialization fails after initialized", async function () {
    await expect(ownershipContract.initialize(ownerSigner.address)).to.revertedWith(
      "contract is already initialized"
    );
    await expect(
      chocopoundContract.initialize(ownerSigner.address, ownerSigner.address, ownerSigner.address)
    ).to.revertedWith("contract is already initialized");
  });

  it("calculateVirtualReserve", async function () {
    expect(
      await chocopoundContract.calculateVirtualReserve(
        defaultInitialPrice,
        defaultDiluter,
        defaultCrr
      )
    ).to.equal(virtualReserve);
  });

  it("calculatePrice", async function () {
    expect(
      await chocopoundContract.calculatePrintPrice(virtualReserve, defaultDiluter, defaultCrr)
    ).to.equal(defaultInitialPrice);
  });

  it("calculateRoyalty", async function () {
    expect(
      await chocopoundContract.calculateRoyalty(
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
      chocopoundContract.address,
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
    await chocopoundContract
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
    expect(await chocopoundContract.currencies(tokenId)).to.equal(currency);
    expect(await chocopoundContract.creators(tokenId)).to.equal(creatorAddress);
    expect(await chocopoundContract.ipfsHashes(tokenId)).to.equal(dummyMetadataIpfsHash);
    expect(await chocopoundContract.totalSupplies(tokenId)).to.equal(1);
    expect(await chocopoundContract.supplyLimits(tokenId)).to.equal(defaultSupplyLimit);
    expect(await chocopoundContract.initialPrices(tokenId)).to.equal(defaultInitialPrice);
    expect(await chocopoundContract.diluters(tokenId)).to.equal(defaultDiluter);
    expect(await chocopoundContract.crrs(tokenId)).to.equal(defaultCrr);
    expect(await chocopoundContract.royaltyRatios(tokenId)).to.equal(defaultRoyaltyRatio);
    expect(await chocopoundContract.reserveBalances(tokenId)).to.equal(
      pricesAtEachSupply[1].reserveBalance
    );
    expect(await chocopoundContract.royaltyBalances(tokenId)).to.equal(
      pricesAtEachSupply[0].royalty
    );
  });

  it("publish and print, print, burn, burn and check price", async function () {
    const creatorAddress = ownershipSigner.address;
    const currency = nullAddress;
    const tokenId = hashChoco(
      hardhatChainId,
      chocopoundContract.address,
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
    await chocopoundContract
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
    const [firstSuppliedPrintPrice] = await chocopoundContract.getPrintPrice(tokenId);
    expect(firstSuppliedPrintPrice).to.equal(pricesAtEachSupply[1].printPrice);

    // this is using publish and mint for same time transaction
    await chocopoundContract
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
    const [secondSuppliedPrintPrice] = await chocopoundContract.getPrintPrice(tokenId);
    expect(secondSuppliedPrintPrice).to.equal(pricesAtEachSupply[2].printPrice);

    // once nft is published only token id is required to mint print
    await chocopoundContract
      .connect(ownerSigner)
      .mintPrint(tokenId, pricesAtEachSupply[2].printPrice, 0, {
        value: pricesAtEachSupply[2].printPrice,
      });

    const [thirdSuppliedPrintPrice] = await chocopoundContract.getPrintPrice(tokenId);
    expect(thirdSuppliedPrintPrice).to.equal(pricesAtEachSupply[3].printPrice);

    const totalSupplyAfterPrint = await chocopoundContract.totalSupplies(tokenId);
    expect(totalSupplyAfterPrint).to.equal(3);

    // stop printing, start burning

    const thirdSuppliedBurnPrice = await chocopoundContract.getBurnPrice(tokenId);
    expect(thirdSuppliedBurnPrice).to.equal(pricesAtEachSupply[3].burnPrice);

    await chocopoundContract.connect(ownerSigner).burnPrint(tokenId, 3);

    const secondSuppliedBurnPrice = await chocopoundContract.getBurnPrice(tokenId);
    expect(secondSuppliedBurnPrice).to.equal(pricesAtEachSupply[2].burnPrice);

    await chocopoundContract.connect(ownerSigner).burnPrint(tokenId, 2);

    const firstSuppliedBurnPrice = await chocopoundContract.getBurnPrice(tokenId);
    expect(firstSuppliedBurnPrice).to.equal(pricesAtEachSupply[1].burnPrice);

    await chocopoundContract.connect(ownerSigner).burnPrint(tokenId, 1);

    const zeroSuppliedBurnPrice = await chocopoundContract.getBurnPrice(tokenId);
    expect(zeroSuppliedBurnPrice).to.equal(pricesAtEachSupply[0].burnPrice);

    await expect(chocopoundContract.connect(ownerSigner).burnPrint(tokenId, 0)).to.revertedWith(
      "total supply must be more than 0"
    );
  });
});
