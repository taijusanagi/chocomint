import { ethers } from "ethers";

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
