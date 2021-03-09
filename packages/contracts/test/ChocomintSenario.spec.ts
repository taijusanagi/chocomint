import { ethers, waffle } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";

import {
  initialize,
  publisherName,
  publisherSymbol,
  ownershipName,
  ownershipSymbol,
} from "../helpers/deploy";

import { hashChoco } from "../helpers/util";

import {
  hardhatChainId,
  dummyMetadataIpfsHash,
  expectedDefaultPriceForFirstPrint,
  expectedDefaultPriceForSecondPrint,
  expectedDefaultPriceForThirdPrint,
} from "../helpers/mock";

import {
  defaultSupplyLimit,
  defaultVirtualSupply,
  defaultVirtualReserve,
  defaultRoyalityRatio,
  defaultCrr,
} from "../helpers/constant";

const provider = waffle.provider;

chai.use(solidity);
const { expect } = chai;

describe("Chocomint", function () {
  let publisherContract;
  let ownershipContract;

  let ownerSigner, ownershipSigner;
  this.beforeEach("initialization.", async function () {
    [ownerSigner, ownershipSigner] = await ethers.getSigners();
    const { publisher, ownership } = await initialize();
    publisherContract = publisher;
    ownershipContract = ownership;
  });

  it("deploy: deploy is ok", async function () {
    // TODO: check ERC1155 name, symbol if opensea requires this

    expect(await publisherContract.name()).to.equal(publisherName);
    expect(await publisherContract.symbol()).to.equal(publisherSymbol);
    expect(await ownershipContract.name()).to.equal(ownershipName);
    expect(await ownershipContract.symbol()).to.equal(ownershipSymbol);
    expect(await ownershipContract.chocomintPublisher()).to.equal(publisherContract.address);
    expect(await publisherContract.chocomintOwnership()).to.equal(ownershipContract.address);
  });

  it("initialization fails after initialized", async function () {
    await expect(ownershipContract.initialize(ownerSigner.address)).to.revertedWith(
      "contract is already initialized"
    );
    await expect(publisherContract.initialize(ownerSigner.address)).to.revertedWith(
      "contract is already initialized"
    );
  });

  it("publish", async function () {
    const tokenId = hashChoco(
      hardhatChainId,
      publisherContract.address,
      ownershipSigner.address,
      dummyMetadataIpfsHash,
      defaultSupplyLimit,
      defaultVirtualSupply,
      defaultVirtualReserve,
      defaultCrr,
      defaultRoyalityRatio
    );
    const tokenIdBinary = ethers.utils.arrayify(tokenId);
    const signature = await ownershipSigner.signMessage(tokenIdBinary);
    const printPriceForFirstPrint = await publisherContract.calculatePrintPrice(
      defaultVirtualReserve,
      defaultVirtualSupply,
      defaultCrr
    );
    // check price calculation is ok
    expect(printPriceForFirstPrint).to.equal(expectedDefaultPriceForFirstPrint);
    await publisherContract
      .connect(ownerSigner)
      .publishAndMintPrint(
        dummyMetadataIpfsHash,
        ownershipSigner.address,
        defaultSupplyLimit,
        defaultVirtualSupply,
        defaultVirtualReserve,
        defaultCrr,
        defaultRoyalityRatio,
        signature,
        {
          value: printPriceForFirstPrint,
        }
      );
    // check royality caluculation is correct
    const royality = await publisherContract.calculateRoyality(
      printPriceForFirstPrint,
      defaultRoyalityRatio
    );
    expect(await publisherContract.getRoyality(printPriceForFirstPrint, tokenId)).to.equal(
      royality
    );
    const reserve = printPriceForFirstPrint - royality;
    // check input is properly kept in contract
    expect(await publisherContract.ipfsHashes(tokenId)).to.equal(dummyMetadataIpfsHash);
    expect(await publisherContract.totalSupplies(tokenId)).to.equal(1);
    expect(await publisherContract.supplyLimits(tokenId)).to.equal(defaultSupplyLimit);
    expect(await publisherContract.totalReserves(tokenId)).to.equal(reserve.toString());
    expect(await publisherContract.virtualSupplies(tokenId)).to.equal(defaultVirtualSupply);
    expect(await publisherContract.virtualReserves(tokenId)).to.equal(defaultVirtualReserve);
    expect(await publisherContract.crrs(tokenId)).to.equal(defaultCrr);
    expect(await publisherContract.royalityRatios(tokenId)).to.equal(defaultRoyalityRatio);

    // check ownership token is properly minted and get royality
    expect(await ownershipContract.ownerOf(tokenId)).to.equal(ownershipSigner.address, "ownerOf");
    expect(await ownershipContract.balances(tokenId)).to.equal(royality, "balances");
  });

  it("publish and print, print, burn, burn and check price", async function () {
    const tokenId = hashChoco(
      hardhatChainId,
      publisherContract.address,
      ownershipSigner.address,
      dummyMetadataIpfsHash,
      defaultSupplyLimit,
      defaultVirtualSupply,
      defaultVirtualReserve,
      defaultCrr,
      defaultRoyalityRatio
    );
    const tokenIdBinary = ethers.utils.arrayify(tokenId);
    const signature = await ownershipSigner.signMessage(tokenIdBinary);
    const printPriceForFirstPrint = await publisherContract.calculatePrintPrice(
      defaultVirtualReserve,
      defaultVirtualSupply,
      defaultCrr
    );
    await publisherContract
      .connect(ownerSigner)
      .publishAndMintPrint(
        dummyMetadataIpfsHash,
        ownershipSigner.address,
        defaultSupplyLimit,
        defaultVirtualSupply,
        defaultVirtualReserve,
        defaultCrr,
        defaultRoyalityRatio,
        signature,
        {
          value: printPriceForFirstPrint,
        }
      );
    // check second price is correct
    expect(await publisherContract.getPrintPrice(tokenId)).to.equal(
      expectedDefaultPriceForSecondPrint
    );
    // this is using publish and mint for same time transaction
    await publisherContract
      .connect(ownerSigner)
      .publishAndMintPrint(
        dummyMetadataIpfsHash,
        ownershipSigner.address,
        defaultSupplyLimit,
        defaultVirtualSupply,
        defaultVirtualReserve,
        defaultCrr,
        defaultRoyalityRatio,
        signature,
        {
          value: expectedDefaultPriceForSecondPrint,
        }
      );

    // check third price is correct
    expect(await publisherContract.getPrintPrice(tokenId)).to.equal(
      expectedDefaultPriceForThirdPrint
    );

    // once nft is published only token id is required to mint print
    await publisherContract.connect(ownerSigner).mintPrint(tokenId, {
      value: expectedDefaultPriceForThirdPrint,
    });

    expect(await publisherContract.getBurnPrice(tokenId)).to.equal(
      ethers.BigNumber.from(expectedDefaultPriceForThirdPrint).sub(
        await publisherContract.getRoyality(expectedDefaultPriceForThirdPrint, tokenId)
      )
    );
    await publisherContract
      .connect(ownerSigner)
      .burnPrint(tokenId, await publisherContract.totalSupplies(tokenId));

    expect(await publisherContract.getBurnPrice(tokenId)).to.equal(
      ethers.BigNumber.from(expectedDefaultPriceForSecondPrint).sub(
        await publisherContract.getRoyality(expectedDefaultPriceForSecondPrint, tokenId)
      )
    );
    await publisherContract
      .connect(ownerSigner)
      .burnPrint(tokenId, await publisherContract.totalSupplies(tokenId));
    expect(await publisherContract.getBurnPrice(tokenId)).to.equal(
      ethers.BigNumber.from(expectedDefaultPriceForFirstPrint).sub(
        await publisherContract.getRoyality(expectedDefaultPriceForFirstPrint, tokenId)
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
