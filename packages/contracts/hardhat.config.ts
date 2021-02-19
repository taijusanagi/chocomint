import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-typechain";

const devPrivateKey = `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`; //"test test test test test test test test test test test junk" [1]

module.exports = {
  solidity: {
    version: "0.5.17",
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/95f65ab099894076814e8526f52c9149`,
      accounts: [devPrivateKey],
    },
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
