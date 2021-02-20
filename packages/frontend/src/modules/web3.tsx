import { ethers } from "ethers";
import Web3Modal from "web3modal";

import { abi } from "../Chocomint.json";

import Ceramic from "@ceramicnetwork/http-client";
const ceramic = new Ceramic("https://ceramic-clay.3boxlabs.com");

import { ThreeIdConnect, EthereumAuthProvider } from "3id-connect";
export const threeID = new ThreeIdConnect();

import { IDX } from "@ceramicstudio/idx";
import { definitions } from "../config.json";

export const idxQuerier = new IDX({ ceramic, aliases: definitions });
export const contract = new ethers.Contract(
  "0x0000000000000000000000000000000000000000",
  abi
);

export class Signer {
  public ethers: any;
  public idx: any;
  public connected: boolean = false;

  init = async () => {
    const web3Modal = new Web3Modal();
    const web3ModalProvider = await web3Modal.connect();
    const [address] = await web3ModalProvider.enable();
    const web3EthersProvider = new ethers.providers.Web3Provider(
      web3ModalProvider
    );
    this.ethers = web3EthersProvider.getSigner();
    await threeID.connect(new EthereumAuthProvider(web3ModalProvider, address));
    const threeIDProvider = threeID.getDidProvider();
    await ceramic.setDIDProvider(threeIDProvider);
    this.idx = new IDX({ ceramic, aliases: definitions });
    this.connected = true;
    console.log(address, "check small");
    return { did: this.idx.id, address };
  };
}
