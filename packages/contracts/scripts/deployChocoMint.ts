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
    const { print, registry, genesis, creator, minter } = await initialize(true, gasPrice);
    configs[networkName].printAddress = print.address;
    configs[networkName].registryAddress = registry.address;
    configs[networkName].genesisAddress = genesis.address;
    configs[networkName].creatorAddress = creator.address;
    configs[networkName].minterAddress = minter.address;
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
