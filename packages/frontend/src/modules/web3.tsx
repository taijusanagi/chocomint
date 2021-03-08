import { atom } from "recoil";

import { ethers } from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";

import { Metadata } from "../types";

import { abi as chocomintRegistryAbi } from "../../../contracts/artifacts/contracts/ChocomintRegistry.sol/ChocomintRegistry.json";
import { abi as chocomintPrintAbi } from "../../../contracts/artifacts/contracts/ChocomintPrint.sol/ChocomintPrint.json";
import { abi as chocomintWalletAbi } from "../../../contracts/artifacts/contracts/ChocomintWallet.sol/ChocomintWallet.json";
import { ChocomintRegistry, ChocomintPrint, ChocomintWallet } from "../../../contracts/typechain";

const bs58 = require("bs58");
const createClient = require("ipfs-http-client");
const ipfsOnlyHash = require("ipfs-only-hash");
const canonicalize = require("canonicalize");

export const networkName = process.env.REACT_APP_NETWORK_ID
  ? process.env.REACT_APP_NETWORK_ID
  : "localhost";

const network = require("../../../contracts/network.json");
export const {
  rpc,
  chainId,
  registryAddress,
  printAddress,
  genesisAddress,
  creatorAddress,
  minterAddress,
} = network[networkName];

export const nullAddress = "0x0000000000000000000000000000000000000000";

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

export const chocomintRegistryContract = new ethers.Contract(
  registryAddress,
  chocomintRegistryAbi,
  provider
) as ChocomintRegistry;
export const chocomintPrintContract = new ethers.Contract(
  printAddress,
  chocomintPrintAbi,
  provider
) as ChocomintPrint;
export const chocomintGenesisContract = new ethers.Contract(
  genesisAddress,
  chocomintWalletAbi,
  provider
) as ChocomintWallet;
export const chocomintCreatorContract = new ethers.Contract(
  creatorAddress,
  chocomintWalletAbi,
  provider
) as ChocomintWallet;
export const chocomintMinterContract = new ethers.Contract(
  minterAddress,
  chocomintWalletAbi,
  provider
) as ChocomintWallet;

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
  network: process.env.REACT_APP_NETWORK_ID ? process.env.REACT_APP_NETWORK_ID : "",
  providerOptions,
  cacheProvider: true,
});

export const initializeWeb3Modal = async () => {
  const web3ModalProvider = await web3Modal.connect();
  await web3ModalProvider.enable();
  return web3ModalProvider;
};

export const clearWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
};

export const getEthersSigner = async () => {
  const web3ModalProvider = await initializeWeb3Modal();
  const web3EthersProvider = new ethers.providers.Web3Provider(web3ModalProvider);
  return web3EthersProvider.getSigner();
};

// this is only used for signing because torus wallet sign fails for ethers
export const getWeb3 = async () => {
  const web3ModalProvider = await initializeWeb3Modal();
  return new Web3(web3ModalProvider);
};

export const selectedAddressState = atom({
  key: "selectedAddress",
  default: "",
});
