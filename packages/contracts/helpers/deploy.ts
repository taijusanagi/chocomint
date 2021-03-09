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
