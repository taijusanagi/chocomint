import { ethers } from "hardhat";

export const publisherName = "ChocomintPublisher";
export const ownershipName = "ChocomintOwnership";

export const publisherSymbol = "CMP";
export const ownershipSymbol = "CMO";

export const initialize = async (debug?: boolean, gasPrice?: number) => {
  debug && console.log("initialize start. gas price:", gasPrice);
  const ChocomintPublisher = await ethers.getContractFactory("ChocomintPublisher");
  const ChocomintOwnership = await ethers.getContractFactory("ChocomintOwnership");
  const publisher = await ChocomintPublisher.deploy({ gasPrice });
  debug && console.log("publisher deployed to:", publisher.address);
  const ownership = await ChocomintOwnership.deploy(ownershipName, ownershipSymbol, { gasPrice });
  debug && console.log("ownership deployed to:", ownership.address);
  await publisher.initialize(ownership.address, {
    gasPrice,
  });
  debug && console.log("publisher initialized");
  await ownership.initialize(publisher.address, { gasPrice });
  debug && console.log("ownership initialized");
  return { publisher, ownership };
};
