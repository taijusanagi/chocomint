//FIXME: if this is ts, and has type, react cannot read this... so I made this as js
const { ethers } = require("ethers");
const { BASE_RATIO } = require("./constant");

const aaveConfig = require("../aave.json");

exports.getAaveTokens = (_networkName) => {
  console.log("get");
  const networkName = _networkName == "kovan" ? "kovan" : "mainnet";
  console.log(networkName);
  return aaveConfig[networkName].filter((config) => {
    return config.symbol == "WETH" || config.symbol == "UNI" || config.symbol == "DAI";
  });
};

exports.getPrice = (currentSupply, currentReserve, initialPrice, diluter, crr) => {
  const virtualReserve = ethers.BigNumber.from(initialPrice).mul(diluter).mul(crr).div(BASE_RATIO);
  const supply = ethers.BigNumber.from(currentSupply).add(diluter);
  const reserve = virtualReserve.add(currentReserve);
  return ethers.BigNumber.from(reserve).mul(BASE_RATIO).div(crr).div(supply);
};

// first calculate all mint printPrice
// then get brun printPrice by royality ratio
exports.getPrices = (totalSupply, initialPrice, diluter, crr, royaltyRatio) => {
  const pricesAtEachSupply = [];
  delete pricesAtEachSupply[0];
  let reserveBalance = ethers.BigNumber.from(0);
  let burnPrice = ethers.BigNumber.from(0);
  const virtualReserve = ethers.BigNumber.from(initialPrice).mul(diluter).mul(crr).div(BASE_RATIO);
  for (let i = 0; i <= totalSupply; i++) {
    if (i < totalSupply) {
      const currentSupply = ethers.BigNumber.from(i).add(diluter);
      const currentReserve = virtualReserve.add(reserveBalance);
      const printPrice = currentReserve.mul(BASE_RATIO).div(crr).div(currentSupply);
      const royalty = printPrice.mul(royaltyRatio).div(BASE_RATIO);
      const reserve = printPrice.sub(royalty);
      pricesAtEachSupply.push({
        supply: i,
        printPrice: printPrice.toString(),
        royalty: royalty.toString(),
        burnPrice: burnPrice.toString(),
        reserveBalance: reserveBalance.toString(),
      });
      reserveBalance = reserveBalance.add(reserve);
      burnPrice = reserve;
    } else {
      pricesAtEachSupply.push({
        supply: i,
        printPrice: "0",
        royalty: "0",
        burnPrice: burnPrice.toString(),
        reserveBalance: reserveBalance.toString(),
      });
    }
  }
  return { pricesAtEachSupply, virtualReserve };
};

exports.hashChoco = (
  chainId,
  publisherAddress,
  currencyAddress,
  creatorAddress,
  ipfshash,
  supplyLimit,
  initialPrice,
  diluter,
  crr,
  royalityRatio
) => {
  return ethers.utils.solidityKeccak256(
    [
      "uint256",
      "address",
      "address",
      "address",
      "bytes32",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
    ],
    [
      chainId,
      publisherAddress,
      currencyAddress,
      creatorAddress,
      ipfshash,
      supplyLimit,
      initialPrice,
      diluter,
      crr,
      royalityRatio,
    ]
  );
};
