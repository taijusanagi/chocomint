import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import networkConfig from "../../../contracts/network.json";
import { abi } from "../../../contracts/artifacts/contracts/Chocomint.sol/Chocomint.json";

export const ipfsBaseUrl = "ipfs://";
export const ipfsHttpsBaseUrl = "https://ipfs.io/ipfs/";

export const nullAddress = "0x0000000000000000000000000000000000000000";
export type ChainIdType = "4" | "80001";

const createClient = require("ipfs-http-client");

export const getNetworkConfig = (chainId: ChainIdType) => {
  return networkConfig[chainId];
};

export const getContract = (chainId: ChainIdType) => {
  const { rpc, contractAddress } = networkConfig[chainId];
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
