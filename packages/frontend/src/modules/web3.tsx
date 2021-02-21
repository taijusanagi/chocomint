import React from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import Ceramic from "@ceramicnetwork/http-client";
const ceramic = new Ceramic("https://ceramic-clay.3boxlabs.com");

import { ThreeIdConnect, EthereumAuthProvider } from "3id-connect";
export const threeID = new ThreeIdConnect();

import { IDX } from "@ceramicstudio/idx";
import { definitions } from "../configs/idx.json";
import networkConfig from "../configs/network.json";
import { abi } from "../Chocomint.json";

export const idx = new IDX({ ceramic, aliases: definitions });

import ipfsInstance, { IPFS } from "ipfs-core";
export const ipfsBaseUrl = "https://ipfs.io/ipfs/";

export type ChainIdType = "4" | "80001";

export const getNetworkConfig = (chainId: ChainIdType) => {
  return networkConfig[chainId];
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
  console.log(ipfs);
  React.useEffect(() => {
    if (!ipfs) {
      ipfsInstance.create().then((created) => {
        setIpfs(created);
        console.log("ipfs is ready...");
      });
    }
  }, []);
  return ipfs;
};

export const getEthersSigner = async () => {
  const web3Modal = new Web3Modal();
  const web3ModalProvider = await web3Modal.connect();
  await web3ModalProvider.enable();
  const web3EthersProvider = new ethers.providers.Web3Provider(
    web3ModalProvider
  );
  return web3EthersProvider.getSigner();
};

export const getIdxSigner = async () => {
  const web3Modal = new Web3Modal();
  const web3ModalProvider = await web3Modal.connect();
  const [address] = await web3ModalProvider.enable();
  await threeID.connect(new EthereumAuthProvider(web3ModalProvider, address));
  const threeIDProvider = threeID.getDidProvider();
  await ceramic.setDIDProvider(threeIDProvider);
  return new IDX({ ceramic, aliases: definitions });
};
