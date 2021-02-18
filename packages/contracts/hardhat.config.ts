import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-typechain";

const devPrivateKey = `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`; //"test test test test test test test test test test test junk"

module.exports = {
  solidity: {
    version: "0.5.17",
  },
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/95f65ab099894076814e8526f52c9149`,
      accounts: [devPrivateKey],
    },
    matic_test: {
      url: `https://rpc-mumbai.matic.today`,
      accounts: [devPrivateKey],
    },
    bsc_test: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [devPrivateKey],
    },
  },
};
