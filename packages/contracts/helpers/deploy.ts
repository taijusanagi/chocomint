import * as fs from "fs";
import * as path from "path";
import hre, { ethers } from "hardhat";

export const chocopoundName = "Chocopound";
export const ownershipName = "ChocomintOwnership";

export const chocopoundSymbol = "CMP";
export const ownershipSymbol = "CMO";

export const filePath = "../network.json";

import configs from "../network.json";
import { NetworkName } from "../type";

import { getAaveTokens } from "./util";

export const getNetwork = () => {
  return hre.network.name == "hardhat" ? "localhost" : (hre.network.name as NetworkName);
};

export const networkName = getNetwork();
const gasPrice = process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 100000000000;
const debug = process.env.DEBUG;

const updateJson = (target: string, address: string) => {
  debug && console.log("update json", target);
  const configs = fs.readFileSync(path.join(__dirname, filePath));
  configs[networkName][target] = address;
  fs.writeFileSync(path.join(__dirname, filePath), JSON.stringify(configs));
  debug && console.log("updated");
};

const deploy = async (contractName: string, params: string[]) => {
  debug && console.log("start deploy", contractName);
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...params, { gasPrice });
  debug && console.log("deployed at", contract.address);
  return contract.address;
};

export const initialize = async () => {
  debug && console.log("initialize start. gas price:", gasPrice);
  const chocopoundAddress = await deploy("Chocopound", [chocopoundName, chocopoundSymbol]);
  updateJson("chocopoundAddress", chocopoundAddress);
  const ownershipAddress = await deploy("ChocomintOwnership", [ownershipName, ownershipSymbol]);
  updateJson("ownershipAddress", ownershipAddress);
  // debug && console.log("aaveWETHGatewayAddress", aaveWETHGatewayAddress);
  // await deployChocopound(gasPrice);
  // debug && console.log("chocopound initialized");
  // const aaveTokens = getAaveTokens(networkName);
  // aaveTokens.forEach(async (aaveToken) => {
  //   if (aaveToken.symbol == "WETH") {
  //     await chocopound.approveCurrency(aaveToken.address);
  //     debug && console.log("chocopound approved", aaveToken.symbol);
  //   }
  // });
  // await ownership.initialize(chocopound.address, {
  //   gasPrice,
  // });
  // debug && console.log("ownership initialized");
  // return { chocopound, ownership };
};
