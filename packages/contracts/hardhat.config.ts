import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-typechain";
import "solidity-coverage";

const privateKey =
  process.env.PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000000"; // this is to avoid hardhat error

import networkJson from "./network.json";
const network = networkJson as any;

module.exports = {
  solidity: {
    version: "0.5.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mainnet: {
      url: network["1"].rpc,
      accounts: [privateKey],
    },
    rinkeby: {
      url: network["4"].rpc,
      accounts: [privateKey],
    },
  },
};
