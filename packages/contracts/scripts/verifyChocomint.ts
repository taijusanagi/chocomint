import * as fs from "fs";
import * as path from "path";

import hre, { ethers } from "hardhat";
import {
  getNetwork,
  publisherName,
  ownershipName,
  publisherSymbol,
  ownershipSymbol,
} from "../helpers/deploy";

import configs from "../network.json";

const main = async () => {
  const networkName = getNetwork();

  if (networkName != "localhost" && networkName != "hardhat") {
    const { publisherAddress, ownershipAddress } = configs[networkName];
    // etherscan verify
    await hre.run("verify:verify", {
      address: publisherAddress,
      constructorArguments: [publisherName, publisherSymbol],
    });
    await hre.run("verify:verify", {
      address: ownershipAddress,
      constructorArguments: [ownershipName, ownershipSymbol],
    });
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
