import { ethers } from "ethers";
import { BASE_RATIO } from "./constant";

// first calculate all mint printPrice
// then get brun printPrice by royality ratio
export const getPrices = (
  totalSupply: number,
  initialPrice: string,
  diluter: number,
  crr: number,
  royaltyRatio: number
) => {
  const pricesAtEachSupply = [] as {
    supply: number;
    printPrice: string;
    royalty: string;
    burnPrice: string;
    reserveBalance: string;
  }[];
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

export const hashChoco = (
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
