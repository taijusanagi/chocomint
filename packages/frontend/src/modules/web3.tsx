import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const createClient = require("ipfs-http-client");

import networkJson from "../../../contracts/network.json";
const network = networkJson as any;
import { abi } from "../../../contracts/artifacts/contracts/Chocomint.sol/Chocomint.json";
import { Chocomint } from "../../../contracts/typechain/Chocomint";

export const ipfsBaseUrl = "ipfs://";
export const ipfsHttpsBaseUrl = "https://ipfs.io/ipfs/";

export const nullAddress = "0x0000000000000000000000000000000000000000";
export type ChainIdType = 1 | 4 | 31337;

export const getNetwork = (chainId: ChainIdType) => {
  return network[chainId];
};

export const getContract = (chainId: ChainIdType) => {
  const chainIdString = chainId.toString();
  const { rpc, contractAddress } = network[chainIdString];
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  return new ethers.Contract(contractAddress, abi, provider);
};

export const ipfs = createClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "95f65ab099894076814e8526f52c9149", // required
    },
  },
};

export const getEthersSigner = async () => {
  const web3Modal = new Web3Modal({ providerOptions });
  const web3ModalProvider = await web3Modal.connect();
  await web3ModalProvider.enable();
  const web3EthersProvider = new ethers.providers.Web3Provider(
    web3ModalProvider
  );
  return web3EthersProvider.getSigner();
};

export const validateChainId = (chainId: number) => {
  return chainId == 4 || chainId == 31337;
};
