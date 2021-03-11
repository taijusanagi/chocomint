import { atom, useRecoilState } from "recoil";

import { ethers } from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";

import { Metadata } from "../types";

import { abi as erc20Abi } from "../../../contracts/artifacts/contracts/dependencies/@openzeppelin/token/ERC20/IERC20.sol/IERC20.json";
import { abi as chocopoundAbi } from "../../../contracts/artifacts/contracts/Chocopound.sol/Chocopound.json";
import { abi as chocomintOwnershipAbi } from "../../../contracts/artifacts/contracts/ChocopoundOwnership.sol/ChocopoundOwnership.json";
import {
  Chocopound as IChocopound,
  ChocopoundOwnership as IChocopoundOwnership,
  IERC20,
} from "../../../contracts/typechain";

import { getAaveTokens } from "../../../contracts/helpers/util";
export { hashChoco, getPrices, getPrice, getAaveTokens } from "../../../contracts/helpers/util";

export {
  defaultSupplyLimit,
  defaultDiluter,
  defaultInitialPrice,
  defaultCrr,
  defaultRoyaltyRatio,
  nullAddress,
  BASE_RATIO,
} from "../../../contracts/helpers/constant";

const bs58 = require("bs58");
const createClient = require("ipfs-http-client");
const ipfsOnlyHash = require("ipfs-only-hash");
const canonicalize = require("canonicalize");
const Decimal = require("decimal.js");

export const networkName = process.env.REACT_APP_NETWORK_NAME
  ? process.env.REACT_APP_NETWORK_NAME
  : "localhost";

const network = require("../../../contracts/network.json");
export const { rpc, chainId, explore, ChocopoundOwnership, Chocopound } = network[networkName];

export const ipfsBaseUrl = "ipfs://";
export const ipfsHttpsBaseUrl = "https://ipfs.io/ipfs/";

export const ipfs = createClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

export const ipfsHashToIpfsUrl = (ipfsHash: string) => {
  const cid = bs58.encode(Buffer.from(`1220${ipfsHash.slice(2)}`, "hex"));
  return `${ipfsHttpsBaseUrl}${cid}`;
};

export const cidToIpfsHash = (cid: string) => {
  return `0x${bs58.decode(cid.toString()).slice(2).toString("hex")}`;
};

export const verifyMetadata = async (ipfsHash: string, metadata: Metadata) => {
  const rawMetadata = Buffer.from(canonicalize(metadata));
  const cid = await ipfsOnlyHash.of(rawMetadata);
  const calculated = cidToIpfsHash(cid);
  return ipfsHash == calculated;
};

export const provider = new ethers.providers.JsonRpcProvider(rpc);

export const chocomintOwnershipContract = new ethers.Contract(
  ChocopoundOwnership,
  chocomintOwnershipAbi,
  provider
) as IChocopoundOwnership;

export const chocopoundContract = new ethers.Contract(
  Chocopound,
  chocopoundAbi,
  provider
) as IChocopound;

// export const chocomintOwnershipContract = new ethers.Contract(
//   ChocopoundOwnership,
//   chocomintOwnershipAbi,
//   provider
// ) as ChocopoundOwnership;

export const getAtokenWithBalance = async () => {
  const aaveTokens = getAaveTokens(networkName);
  const promises = aaveTokens.map(async (aaveToken: any) => {
    const erc20Contract = new ethers.Contract(
      aaveToken.aTokenAddress,
      erc20Abi,
      provider
    ) as IERC20;
    const balance = await erc20Contract.balanceOf(chocopoundContract.address);
    return balance.toString();
  });
  const resolved = await Promise.all(promises);
  return aaveTokens.map((aaveToken: any, i) => {
    aaveToken.depositted = resolved[i];
    return aaveToken;
  });
};

export const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "95f65ab099894076814e8526f52c9149",
    },
  },
  torus: {
    package: Torus,
  },
};

export const web3Modal = new Web3Modal({
  network: process.env.REACT_APP_NETWORK_NAME ? process.env.REACT_APP_NETWORK_NAME : "",
  providerOptions,
});

export const initializeWeb3Modal = async () => {
  const web3ModalProvider = await web3Modal.connect();
  await web3ModalProvider.enable();
  return web3ModalProvider;
};

export const clearWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
};

export const getEthersSigner = async (provider: any) => {
  const web3EthersProvider = new ethers.providers.Web3Provider(provider);
  return web3EthersProvider.getSigner();
};

// this is only used for signing because torus wallet sign fails for ethers
export const getWeb3 = async (provider: any) => {
  return new Web3(provider);
};

export const selectedAddressState = atom({
  key: "selectedAddress",
  default: "",
});

export const useWallet = () => {
  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);

  const connectWallet = async () => {
    const provider = await initializeWeb3Modal();
    setSelectedAddress(provider.selectedAddress);
    return provider;
  };
  return { selectedAddress, connectWallet };
};

export const roundAndFormatPrintPrice = (
  price: string | ethers.BigNumber | number,
  maxDecimalDigits: number
) => {
  const num = new Decimal(ethers.utils.formatEther(price));
  return num.toFixed(maxDecimalDigits, Decimal.ROUND_UP);
};

export const roundAndFormatBurnPrice = (
  price: string | ethers.BigNumber | number,
  maxDecimalDigits: number
) => {
  const num = new Decimal(ethers.utils.formatEther(price));
  return num.toFixed(maxDecimalDigits, Decimal.ROUND_DOWN);
};
