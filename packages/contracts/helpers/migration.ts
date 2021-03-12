import * as fs from "fs";
import * as path from "path";
import hre, { ethers } from "hardhat";
import { NetworkName } from "../type";

import { chocopoundName, chocopoundSymbol, ownershipName, ownershipSymbol } from "./constant";
import { getAaveTokens } from "./util";
export const filePath = "../network.json";

export const getNetwork = () => {
  return hre.network.name == "hardhat" ? "localhost" : (hre.network.name as NetworkName);
};

export const networkName = getNetwork();

export const gasPrice = process.env.GASPRICE ? parseInt(process.env.GASPRICE) : 10000000000; //10 gwei
export const debug = process.env.DEBUG;

export const readFileAsJson = () => {
  const configsBuffer = fs.readFileSync(path.join(__dirname, filePath));
  return JSON.parse(configsBuffer.toString());
};

export const updateJson = (target: string, address: string) => {
  networkName != "localhost" && console.log("json update for", target);
  const configs = readFileAsJson();
  configs[networkName][target] = address;
  fs.writeFileSync(path.join(__dirname, filePath), JSON.stringify(configs));
  networkName != "localhost" && console.log("json updated");
};

export const deployChocopound = async () => {
  const target = "Chocopound";
  const contract = await deploy(target, [chocopoundName, chocopoundSymbol]);
  updateJson(target, contract.address);
  return contract;
};

export const deployChocopoundOwnership = async () => {
  const target = "ChocopoundOwnership";
  const contract = await deploy(target, [ownershipName, ownershipSymbol]);
  updateJson(target, contract.address);
  return contract;
};

export const deploy = async (contractName: string, params: string[]) => {
  networkName != "localhost" && console.log("contract deploy for", contractName);
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...params, { gasPrice });
  networkName != "localhost" &&
    console.log("contract deployed", contract.deployTransaction.hash, contract.address);
  return contract;
};

export const initializeChocopound = async () => {
  const target = "Chocopound";
  const configs = readFileAsJson();
  const { ChocopoundOwnership, LendingPool, WETHGateway } = configs[networkName];
  await initialize(target, [ChocopoundOwnership, LendingPool, WETHGateway]);
};

export const initializeChocopoundOwnership = async () => {
  const target = "ChocopoundOwnership";
  const configs = readFileAsJson();
  const { Chocopound } = configs[networkName];
  await initialize(target, [Chocopound]);
};

export const initialize = async (contractName: string, params: string[]) => {
  networkName != "localhost" && console.log("contract initialize", contractName);
  const Contract = await ethers.getContractFactory(contractName);
  const configs = readFileAsJson();
  const address = configs[networkName][contractName];
  const contract = await Contract.attach(address);
  await contract.initialize(...params);
  networkName != "localhost" && console.log("contract initialized");
  return contract.address;
};

export const approveCurrency = async (currencySymbol: string) => {
  const target = "Chocopound";
  const Contract = await ethers.getContractFactory(target);
  const configs = readFileAsJson();
  const address = configs[networkName][target];
  const contract = await Contract.attach(address);
  const aaveTokens = getAaveTokens(networkName);
  for (const aaveToken of aaveTokens) {
    if (aaveToken.symbol == currencySymbol) {
      await contract.approveCurrency(aaveToken.address);
    }
  }
};
