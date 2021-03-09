import { ethers } from "hardhat";

export const publisherName = "ChocomintPublisher";
export const creatorName = "ChocomintCreator";

export const publisherSymbol = "CMP";
export const creatorSymbol = "CMC";

export const initialize = async (debug?: boolean, gasPrice?: number) => {
  debug && console.log("initialize start. gas price:", gasPrice);
  const ChocomintPublisher = await ethers.getContractFactory("ChocomintPublisher");
  const ChocomintCreator = await ethers.getContractFactory("ChocomintCreator");
  const publisher = await ChocomintPublisher.deploy({ gasPrice });
  debug && console.log("publisher deployed to:", publisher.address);
  const creator = await ChocomintCreator.deploy(creatorName, creatorSymbol, { gasPrice });
  debug && console.log("gallery deployed to:", creator.address);
  await publisher.initialize(creator.address, {
    gasPrice,
  });
  debug && console.log("publisher initialized");
  await creator.initialize(publisher.address, { gasPrice });
  return { publisher, creator };
};

export const nullAddress = "0x0000000000000000000000000000000000000000";
export const hardhatChainId = "31337";
export const BASE_RATIO = 10000;
export const dummyMetadataIpfsCid = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";
export const dummyMetadataIpfsHash =
  "0x7d5a99f603f231d53a4f39d1521f98d2e8bb279cf29bebfd0687dc98458e7f89";

export const hashPublishMessage = (
  chainId,
  publisherAddress,
  signerAddress,
  ipfshash,
  supplyLimit,
  virtualSupply,
  virtualReserve,
  crr,
  royalityRatio
) => {
  return ethers.utils.solidityKeccak256(
    [
      "uint256",
      "address",
      "address",
      "bytes32",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
    ],
    [
      chainId,
      publisherAddress,
      signerAddress,
      ipfshash,
      supplyLimit,
      virtualSupply,
      virtualReserve,
      crr,
      royalityRatio,
    ]
  );
};
