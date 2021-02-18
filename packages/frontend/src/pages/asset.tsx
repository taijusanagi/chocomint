import React from "react";

import IPFS from "ipfs-core";

import Web3Modal from "web3modal";
import { ethers } from "ethers";

import { abi } from "../Chocomint.json";

export const Asset: React.FC = () => {
  const [choco, setChoco] = React.useState<any>({});

  const mintNft = async () => {
    const web3Modal = new Web3Modal();
    const web3ModalProvider = await web3Modal.connect();
    const web3Provider = new ethers.providers.Web3Provider(web3ModalProvider);
    const signer = web3Provider.getSigner();
    const contract = new ethers.Contract(choco.address, abi, signer);
    contract.mint(
      [
        choco.name,
        choco.description,
        choco.image,
        choco.blank,
        choco.initialPrice,
        choco.fees,
        choco.recipients,
        choco.iss,
        choco.sub,
        choco.root,
        choco.proof,
        choco.signature,
      ],
      { value: choco.initialPrice }
    );
  };

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get("cid");
    if (!cid) {
      return;
    }
    IPFS.create().then(async (ipfs) => {
      const stream = ipfs.cat(cid);
      for await (const chunk of stream) {
        setChoco(JSON.parse(chunk.toString()));
      }
    });
  }, []);
  return (
    <div>
      <img src={choco.image} />
      <p>{choco.network}</p>
      <p>{choco.name}</p>
      <p>{choco.description}</p>
      <p>{choco.iss}</p>
      <p>{choco.initialPrice}</p>
      <button onClick={mintNft}>MINT NFT!</button>
    </div>
  );
};

export default Asset;
