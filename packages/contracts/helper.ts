import { ethers } from "hardhat";

export const printName = "ChocomintPrint";
export const registryName = "ChocomintRegistry";
export const galleryName = "ChocomintGallery";
export const creatorName = "ChocomintCreator";
export const publisherName = "ChocomintMinter";
export const printSymbol = "CMP";
export const registrySymbol = "CMR";
export const gallerySymbol = "CMG";
export const creatorSymbol = "CMC";
export const publisherSymbol = "CMM";

export const initialize = async (debug?: boolean, gasPrice?: number) => {
  debug && console.log("initialize start. gas price:", gasPrice);
  const ChocomintPrint = await ethers.getContractFactory("ChocomintPrint");
  const ChocomintRegistry = await ethers.getContractFactory("ChocomintRegistry");
  const ChocomintWallet = await ethers.getContractFactory("ChocomintWallet");
  const print = await ChocomintPrint.deploy({ gasPrice });
  debug && console.log("print deployed to:", print.address);
  const registry = await ChocomintRegistry.deploy({ gasPrice });
  debug && console.log("registry deployed to:", registry.address);
  const gallery = await ChocomintWallet.deploy(galleryName, gallerySymbol, { gasPrice });
  debug && console.log("gallery deployed to:", gallery.address);
  const creator = await ChocomintWallet.deploy(creatorName, creatorSymbol, { gasPrice });
  debug && console.log("creator deployed to:", creator.address);
  const publisher = await ChocomintWallet.deploy(publisherName, publisherSymbol, { gasPrice });
  debug && console.log("publisher deployed to:", publisher.address);
  await print.initialize(registry.address, gallery.address, creator.address, publisher.address, {
    gasPrice,
  });
  debug && console.log("print initialized");
  await registry.initialize(creator.address, publisher.address, { gasPrice });
  debug && console.log("registry initialized");
  await gallery.initialize(registry.address, print.address, { gasPrice });
  debug && console.log("gallery initialized");
  await creator.initialize(registry.address, registry.address, { gasPrice });
  debug && console.log("creator initialized");
  await publisher.initialize(registry.address, registry.address, { gasPrice });
  debug && console.log("publisher initialized");

  return { print, registry, gallery, creator, publisher };
};

export const nullAddress = "0x0000000000000000000000000000000000000000";
