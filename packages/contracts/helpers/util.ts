import { ethers } from "ethers";

export const hashChoco = (
  chainId,
  publisherAddress,
  signerAddress,
  ipfshash,
  supplyLimit,
  virtualSupply,
  virtualReserve,
  crr,
  royalityRatio
) => {
  return ethers.utils.solidityKeccak256(
    [
      "uint256",
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
      signerAddress,
      ipfshash,
      supplyLimit,
      virtualSupply,
      virtualReserve,
      crr,
      royalityRatio,
    ]
  );
};
