import * as fs from "fs";
import * as path from "path";

import hre, { ethers } from "hardhat";
import { initialize } from "../helpers/deploy";
import configs from "../network.json";

import { NetworkName } from "../type";
const gasPrice = process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 100000000000;

const main = async () => {
  const networkName = hre.network.name as NetworkName;
  console.log("run deploy script on network:", networkName);

  if (
    networkName == "mainnet" ||
    networkName == "rinkeby" ||
    networkName == "kovan" ||
    networkName == "localhost"
  ) {
    const { publisher, ownership } = await initialize(networkName, true, gasPrice);
    configs[networkName].publisherAddress = publisher.address;
    configs[networkName].ownershipAddress = ownership.address;
    fs.writeFileSync(path.join(__dirname, "../network.json"), JSON.stringify(configs));
  } else {
    console.log("network is wrong");
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
