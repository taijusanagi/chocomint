import { ethers } from "hardhat";

export const printName = "ChocomintPrint";
export const registryName = "ChocomintRegistry";
export const genesisName = "ChocomintGenesis";
export const creatorName = "ChocomintCreator";
export const minterName = "ChocomintMinter";
export const printSymbol = "CMP";
export const registrySymbol = "CMR";
export const genesisSymbol = "CMG";
export const creatorSymbol = "CMC";
export const minterSymbol = "CMM";

export const initialize = async (debug?: boolean, gasPrice?: number) => {
  debug && console.log("initialize start. gas price:", gasPrice);
  const ChocomintPrint = await ethers.getContractFactory("ChocomintPrint");
  const ChocomintRegistry = await ethers.getContractFactory("ChocomintRegistry");
  const ChocomintWallet = await ethers.getContractFactory("ChocomintWallet");
  const print = await ChocomintPrint.deploy({ gasPrice });
  debug && console.log("print deployed to:", print.address);
  const registry = await ChocomintRegistry.deploy({ gasPrice });
  debug && console.log("registry deployed to:", registry.address);
  const genesis = await ChocomintWallet.deploy(genesisName, genesisSymbol, { gasPrice });
  debug && console.log("genesis deployed to:", genesis.address);
  const creator = await ChocomintWallet.deploy(creatorName, creatorSymbol, { gasPrice });
  debug && console.log("creator deployed to:", creator.address);
  const minter = await ChocomintWallet.deploy(minterName, minterSymbol, { gasPrice });
  debug && console.log("minter deployed to:", minter.address);
  await print.initialize(registry.address, genesis.address, creator.address, minter.address, {
    gasPrice,
  });
  debug && console.log("print initialized");
  await registry.initialize(creator.address, minter.address, { gasPrice });
  debug && console.log("registry initialized");
  await genesis.initialize(registry.address, print.address, { gasPrice });
  debug && console.log("genesis initialized");
  await creator.initialize(registry.address, registry.address, { gasPrice });
  debug && console.log("creator initialized");
  await minter.initialize(registry.address, registry.address, { gasPrice });
  debug && console.log("minter initialized");

  return { print, registry, genesis, creator, minter };
};
