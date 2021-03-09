import * as fs from "fs";
import * as path from "path";

import hre, { ethers } from "hardhat";
import { initialize } from "../helper";
import configsJson from "../network.json";
const configs = configsJson as any;

const gasPrice = process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 100000000000;

const main = async () => {
  const networkName = hre.network.name;
  console.log("run deploy script on network:", networkName);

  if (networkName == "mainnet" || networkName == "rinkeby" || networkName == "localhost") {
    const { publisher, creator } = await initialize(true, gasPrice);
    configs[networkName].publisherAddress = publisher.address;
    configs[networkName].creatorAddress = creator.address;
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
