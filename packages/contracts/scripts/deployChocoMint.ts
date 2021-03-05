import * as fs from "fs";
import * as path from "path";

import hre, { ethers } from "hardhat";
import configsJson from "../network.json";
const configs = configsJson as any;

const gasPrice = process.env.GAS_PRICE ? process.env.GAS_PRICE : 100000000000;

const main = async () => {
  const networkName = hre.network.name;
  let chainId =
    networkName == "mainnet" ? "1" : networkName == "rinkeby" ? "4" : "31337";
  const Chocomint = await ethers.getContractFactory("ChocomintGenesis");
  const chocomint = await Chocomint.deploy({
    gasPrice,
  });
  configs[chainId].contractAddress = chocomint.address;
  console.log("Chocomint deployed to:", chocomint.address);
  fs.writeFileSync(
    path.join(__dirname, "../network.json"),
    JSON.stringify(configs)
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
