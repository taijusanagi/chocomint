import React from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import networkConfig from "../configs/network.json";
import { abi } from "../Chocomint.json";

import ipfsInstance, { IPFS } from "ipfs-core";
export const ipfsBaseUrl = "ipfs://";
export const ipfsHttpsBaseUrl = "https://ipfs.io/ipfs/";
export const nullAddress = "0x0000000000000000000000000000000000000000";
export type ChainIdType = "4" | "80001";

export const getNetworkConfig = (chainId: ChainIdType) => {
  return networkConfig[chainId];
};

export const getChainIds = () => {
  return Object.keys(networkConfig) as ChainIdType[];
};

export const getContract = (address: string, chainId?: ChainIdType) => {
  const provider = chainId
    ? new ethers.providers.JsonRpcProvider(getNetworkConfig(chainId).rpc)
    : undefined;
  return new ethers.Contract(address, abi, provider);
};

const createClient = require("ipfs-http-client");

//this endpoint is too slow
export const ipfs = createClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

//This is not working in iframe
export const useIpfs = () => {
  const [ipfs, setIpfs] = React.useState<IPFS>();
  React.useEffect(() => {
    if (!ipfs) {
      ipfsInstance.create().then((created) => {
        setIpfs(created);
      });
    }
  }, []);
  return ipfs;
};

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
