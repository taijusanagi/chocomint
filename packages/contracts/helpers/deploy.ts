import { ethers } from "hardhat";

export const publisherName = "ChocomintPublisher";
export const ownershipName = "ChocomintOwnership";

export const publisherSymbol = "CMP";
export const ownershipSymbol = "CMO";

import configs from "../network.json";
import { NetworkName } from "../type";
export const initialize = async (networkName: NetworkName, debug?: boolean, gasPrice?: number) => {
  debug && console.log("initialize start. gas price:", gasPrice);
  const ChocomintPublisher = await ethers.getContractFactory("ChocomintPublisher");
  const ChocomintOwnership = await ethers.getContractFactory("ChocomintOwnership");
  const { aaveWETHGatewayAddress } = configs[networkName];
  const publisher = await ChocomintPublisher.deploy(publisherName, publisherSymbol, { gasPrice });
  debug && console.log("publisher deployed to:", publisher.address, aaveWETHGatewayAddress);
  const ownership = await ChocomintOwnership.deploy(ownershipName, ownershipSymbol, { gasPrice });
  debug && console.log("ownership deployed to:", ownership.address, aaveWETHGatewayAddress);
  await publisher.initialize(ownership.address, {
    gasPrice,
  });
  debug && console.log("publisher initialized");
  await ownership.initialize(publisher.address, { gasPrice });
  debug && console.log("ownership initialized");
  return { publisher, ownership };
};
