import hre, { ethers } from "hardhat";

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
  const { aaveGatewayAddress, aaveWETHGatewayAddress } = configs[networkName];
  const publisher = await ChocomintPublisher.deploy(publisherName, publisherSymbol, { gasPrice });
  debug && console.log("publisher deployed to:", publisher.address);
  const ownership = await ChocomintOwnership.deploy(ownershipName, ownershipSymbol, { gasPrice });
  debug && console.log("ownership deployed to:", ownership.address);
  await publisher.initialize(ownership.address, aaveGatewayAddress, aaveWETHGatewayAddress, {
    gasPrice,
  });
  debug && console.log("publisher initialized");
  await ownership.initialize(publisher.address, {
    gasPrice,
  });
  debug && console.log("ownership initialized");
  return { publisher, ownership };
};

export const getNetwork = () => {
  return hre.network.name == "hardhat" ? "localhost" : (hre.network.name as NetworkName);
};
