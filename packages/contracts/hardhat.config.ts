import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-typechain";

const privateKey =
  process.env.PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000000"; //avoid hardhat error

module.exports = {
  solidity: {
    version: "0.7.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/95f65ab099894076814e8526f52c9149`,
      accounts: [privateKey],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/95f65ab099894076814e8526f52c9149`,
      accounts: [privateKey],
    },
    matic_test: {
      url: `https://rpc-mumbai.matic.today`,
      accounts: [privateKey],
    },
    bsc_test: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [privateKey],
    },
  },
};
