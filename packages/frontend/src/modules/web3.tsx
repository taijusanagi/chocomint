import { atom } from "recoil";

import { ethers } from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";

import { Metadata } from "../types";

import { abi as chocomintPublisherAbi } from "../../../contracts/artifacts/contracts/ChocomintPublisher.sol/ChocomintPublisher.json";
import { abi as chocomintOwnershipAbi } from "../../../contracts/artifacts/contracts/ChocomintOwnership.sol/ChocomintOwnership.json";
import { ChocomintPublisher, ChocomintOwnership } from "../../../contracts/typechain";

export { hashChoco } from "../../../contracts/helpers/util";

export {
  defaultSupplyLimit,
  defaultVirtualSupply,
  defaultVirtualReserve,
  defaultCrr,
  defaultRoyalityRatio,
} from "../../../contracts/helpers/constant";

const bs58 = require("bs58");
const createClient = require("ipfs-http-client");
const ipfsOnlyHash = require("ipfs-only-hash");
const canonicalize = require("canonicalize");
const Decimal = require("decimal.js");

export const networkName = process.env.REACT_APP_NETWORK_ID
  ? process.env.REACT_APP_NETWORK_ID
  : "localhost";

const network = require("../../../contracts/network.json");
export const { rpc, chainId, explore, creatorAddress, publisherAddress } = network[networkName];

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

export const chocomintOwnershipContract = new ethers.Contract(
  creatorAddress,
  chocomintOwnershipAbi,
  provider
) as ChocomintOwnership;

export const chocomintPublisherContract = new ethers.Contract(
  publisherAddress,
  chocomintPublisherAbi,
  provider
) as ChocomintPublisher;

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

const maxDecimalDigits = 5;

export const roundAndFormatPrintPrice = (price: ethers.BigNumber) => {
  const num = new Decimal(ethers.utils.formatEther(price));
  return num.toFixed(maxDecimalDigits, Decimal.ROUND_UP);
};

export const roundAndFormatBurnPrice = (price: ethers.BigNumber) => {
  const num = new Decimal(ethers.utils.formatEther(price));
  return num.toFixed(maxDecimalDigits, Decimal.ROUND_DOWN);
};
