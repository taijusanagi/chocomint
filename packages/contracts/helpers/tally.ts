import * as fs from "fs";
import * as path from "path";
import hre, { ethers } from "hardhat";
import { NetworkName } from "../type";

export const filePath = "../network.json";

export const getNetwork = () => {
  return hre.network.name == "hardhat" ? "localhost" : (hre.network.name as NetworkName);
};

export const networkName = getNetwork();

export const readFileAsJson = () => {
  const configsBuffer = fs.readFileSync(path.join(__dirname, filePath));
  return JSON.parse(configsBuffer.toString());
};

export const totalDepositAmountForToken = async (
  startBlockNumber: number,
  endBlockNumber: number
) => {
  const contractName = "Chocopound";
  const configs = readFileAsJson();
  networkName != "localhost" && console.log("contract initialize", contractName);
  const Contract = await ethers.getContractFactory(contractName);
  const address = configs[networkName][contractName];
  const contract = await Contract.attach(address);
  const printMintedFilterResult = await contract.queryFilter(
    contract.filters.PrintMinted(),
    startBlockNumber,
    endBlockNumber
  );
  const printBurnedFilterResult = await contract.queryFilter(
    contract.filters.PrintBurned(),
    startBlockNumber,
    endBlockNumber
  );

  // MEMO: Output the necessary data.
  let printMinted = {};
  printMintedFilterResult
    .map((result) => {
      //MEMO: ここは必須ではない
      const { args } = result;
      return {
        ...args,
      };
    })
    .forEach((result) => {
      const { operator, tokenId, currentSupply, currentReserve, printPrice, royalty } = result;

      printMinted = {
        ...printMinted,
        [tokenId.toString()]: {
          operator,
          currentSupply: currentSupply.toString(),
          currentReserve: currentReserve.toString(),
          printPrice: printPrice.toString(),
          royalty: royalty.toString(),
          depositETH:
            printMinted[tokenId.toString()] && printMinted[tokenId.toString()].depositETH
              ? printMinted[tokenId.toString()].depositETH + Number(printPrice.toString())
              : Number(printPrice.toString()),
        },
      };
    });

  // MEMO: Output the necessary data.
  let printBurned = {};
  printBurnedFilterResult
    .map((result) => {
      //MEMO: ここは必須ではない
      const { args } = result;
      return {
        ...args,
      };
    })
    .forEach((result) => {
      const { operator, tokenId, currentSupply, currentReserve, burnPrice } = result;

      printBurned = {
        ...printBurned,
        [tokenId.toString()]: {
          operator,
          currentSupply: currentSupply.toString(),
          currentReserve: currentReserve.toString(),
          burnPrice: burnPrice.toString(),
          withdrawETH:
            printBurned[tokenId.toString()] && printBurned[tokenId.toString()].withdrawETH
              ? printBurned[tokenId.toString()].withdrawETH + Number(burnPrice.toString())
              : Number(burnPrice.toString()),
        },
      };
    });

  // MEMO: Calculating the total value.
  const prints: { tokenId: string; currentETH: number }[] = [];
  Object.keys(printMinted).forEach((tokenId) => {
    prints.push({
      tokenId,
      currentETH:
        printBurned[tokenId] && printBurned[tokenId].withdrawETH
          ? printMinted[tokenId].depositETH - printBurned[tokenId].withdrawETH
          : printMinted[tokenId].depositETH,
    });
  });

  // MEMO: Ascending sort.
  const sortAmountOfETH = prints.sort(function (a, b) {
    if (a.currentETH < b.currentETH) return -1;
    if (a.currentETH > b.currentETH) return 1;
    return 0;
  });

  console.log("Transaction volume to tokens", sortAmountOfETH);
  networkName != "localhost" && console.log("completed");
};

export const totalTransactionsForToken = async (
  startBlockNumber: number,
  endBlockNumber: number
) => {
  const contractName = "Chocopound";
  const configs = readFileAsJson();
  networkName != "localhost" && console.log("contract initialize", contractName);
  const Contract = await ethers.getContractFactory(contractName);
  const address = configs[networkName][contractName];
  const contract = await Contract.attach(address);
  const printMintedFilterResult = await contract.queryFilter(
    contract.filters.PrintMinted(),
    startBlockNumber,
    endBlockNumber
  );
  const printBurnedFilterResult = await contract.queryFilter(
    contract.filters.PrintBurned(),
    startBlockNumber,
    endBlockNumber
  );

  // MEMO: Output the necessary data.
  let printMinted = {};
  printMintedFilterResult
    .map((result) => {
      //MEMO: ここは必須ではない
      const { args } = result;
      return {
        ...args,
      };
    })
    .forEach((result) => {
      const { tokenId } = result;

      printMinted = {
        ...printMinted,
        [tokenId.toString()]: {
          txVolume:
            printMinted[tokenId.toString()] && printMinted[tokenId.toString()].txVolume
              ? printMinted[tokenId.toString()].txVolume + 1
              : 1,
        },
      };
    });

  // MEMO: Output the necessary data.
  let printBurned = {};
  printBurnedFilterResult
    .map((result) => {
      //MEMO: ここは必須ではない
      const { args } = result;
      return {
        ...args,
      };
    })
    .forEach((result) => {
      const { tokenId } = result;

      printBurned = {
        ...printBurned,
        [tokenId.toString()]: {
          txVolume:
            printBurned[tokenId.toString()] && printBurned[tokenId.toString()].txVolume
              ? printBurned[tokenId.toString()].txVolume + 1
              : 1,
        },
      };
    });

  // MEMO: Calculating the total value.
  const prints: { tokenId: string; txVolume: number }[] = [];
  Object.keys(printMinted).forEach((tokenId) => {
    prints.push({
      tokenId,
      txVolume: printBurned[tokenId]
        ? printMinted[tokenId].txVolume + printBurned[tokenId].txVolume
        : printMinted[tokenId].txVolume,
    });
  });

  // MEMO: Ascending sort.
  const sortTxVolume = prints.sort(function (a, b) {
    if (a.txVolume < b.txVolume) return -1;
    if (a.txVolume > b.txVolume) return 1;
    return 0;
  });

  console.log("Amount of ETH deposited for tokens", sortTxVolume);
  networkName != "localhost" && console.log("completed");
};
