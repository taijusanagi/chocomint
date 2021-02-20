import React from "react";
import IPFS, { IPFS as IPFSType } from "ipfs-core";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

import Ceramic from "@ceramicnetwork/http-client";
const ceramic = new Ceramic("https://ceramic-clay.3boxlabs.com");

import { ThreeIdConnect, EthereumAuthProvider } from "3id-connect";
export const threeID = new ThreeIdConnect();

import { IDX } from "@ceramicstudio/idx";

import { definitions } from "../config.json";
import { Header } from "../components/header";

import { signer } from "../modules/web3";

type networkType = "LOCAL" | "ETH" | "MATIC" | "BSC";

const networkConfigs = {
  LOCAL: {
    chainId: "31337",
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
  ETH: {
    chainId: "4",
    address: "0xb6b18cae509fcf3542ff6975c2da06caac9773c5",
  },
  MATIC: {
    chainId: "80001",
    address: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  },
  BSC: {
    chainId: "97",
    address: "0x38F6F2caE52217101D7CA2a5eC040014b4164E6C",
  },
};

export const Create: React.FC = () => {
  const [ipfs, setIpfs] = React.useState<IPFSType>();
  const [idx, setIdx] = React.useState<IDX>();
  const [imageFile, setImage] = React.useState<File>();
  const [animationFile, setAnimationFile] = React.useState<File>();
  const [network, setNetwork] = React.useState<networkType>("ETH");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [initial_price, setInitialPrice] = React.useState("");
  const [royality, setRoyality] = React.useState("");

  React.useEffect(() => {
    IPFS.create().then((created) => setIpfs(created));
  }, []);

  const readAsArrayBufferAsync = (file: File) => {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result);
      };
      fr.readAsArrayBuffer(file);
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    setImage(event.target.files[0]);
  };

  const handleAnimationUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) {
      return;
    }
    setAnimationFile(event.target.files[0]);
  };

  const handleNetworkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setNetwork(event.target.value as networkType);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
  };

  const handleInitialPriceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInitialPrice(event.target.value);
  };

  const handleRoyalityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoyality(event.target.value);
  };

  const getPreviewImageSrc = (file?: File) => {
    if (!file) {
      return "";
    }
    return URL.createObjectURL(file);
  };

  const createNft = async () => {
    if (
      !ipfs ||
      !imageFile ||
      // !animationFile ||
      !name ||
      !description ||
      !idx
    ) {
      return;
    }
    const imageBuffer = await readAsArrayBufferAsync(imageFile);
    const imageUint8Array = new Uint8Array(imageBuffer as Buffer);
    const { cid: imageCid } = await ipfs.add(imageUint8Array);
    const image = `ipfs://${imageCid.toString()}`;
    // const animationBuffer = await readAsArrayBufferAsync(animationFile);
    // const animationUint8Array = new Uint8Array(animationBuffer as Buffer);
    // const { cid: animationCid } = await ipfs.add({
    //   path: `images/nft.glb`,
    //   content: animationUint8Array,
    // });

    // const animation_url = `ipfs://${animationCid.toString()}/nft.glb`;
    const animation_url = "";
    const web3Modal = new Web3Modal();
    const web3ModalProvider = await web3Modal.connect();
    const web3Provider = new ethers.providers.Web3Provider(web3ModalProvider);
    const signer = web3Provider.getSigner();
    const chainId = networkConfigs[network].chainId;
    const address = networkConfigs[network].address;
    const iss = (await signer.getAddress()).toLowerCase();
    const choco = {
      chainId,
      address,
      tokenId: "",
      name,
      description,
      image,
      animation_url,
      initial_price: ethers.utils.parseEther(initial_price).toString(),
      fees: [royality],
      recipients: [iss],
      iss,
      sub: "0x0000000000000000000000000000000000000000",
      root: "",
      proof: [""],
      signature: "",
    };
    const messageHash = ethers.utils.solidityKeccak256(
      [
        "uint256",
        "address",
        "string",
        "string",
        "string",
        "string",
        "uint256",
        "uint256[]",
        "address[]",
        "address",
        "address",
      ],
      [
        chainId,
        address,
        choco.name,
        choco.description,
        choco.image,
        choco.animation_url,
        choco.initial_price,
        choco.fees,
        choco.recipients,
        choco.iss,
        choco.sub,
      ]
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    const messageHashBinaryBuffer = Buffer.from(messageHashBinary);
    const leaves = [messageHashBinaryBuffer];
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    choco.root = tree.getHexRoot();
    choco.proof = tree.getHexProof(messageHashBinaryBuffer);
    choco.signature = await signer.signMessage(
      ethers.utils.arrayify(choco.root)
    );
    const tokenIdHex = ethers.utils.solidityKeccak256(
      ["bytes32", "bytes32"],
      [messageHash, choco.root]
    );
    choco.tokenId = ethers.BigNumber.from(tokenIdHex).toString();
    const metadataString = JSON.stringify({
      ...choco,
    });
    const { cid: metadataCid } = await ipfs.add(metadataString);
    const { chocomints } = (await idx.get("createdChocomint")) as any;
    console.log(chocomints);
    console.log(!chocomints.includes(metadataString));
    if (!chocomints.includes(metadataString)) {
      chocomints.unshift(metadataString);
    }
    await idx.set("createdChocomint", { chocomints });
    console.log(
      `Congraturation! Your NFT is on : ${
        window.location.origin
      }/nft?cid=${metadataCid.toString()}`
    );
  };

  const connectIdx = async () => {
    console.log(signer);
  };

  const get = async () => {
    if (!idx) {
      return;
    }
    console.log(await idx.get("basicProfile"));
    console.log(await idx.get("cryptoAccounts"));
    console.log(await idx.get("threeIdKeychain"));
  };

  return (
    <div>
      <Header />
      <button id="connect" onClick={connectIdx}>
        Connect
      </button>
      <button id="get" onClick={get}>
        Get
      </button>
      <p>{idx && idx.id}</p>
      <label>Upload file</label>
      <input type="file" id="image" name="image" onChange={handleImageChange} />
      <img src={getPreviewImageSrc(imageFile)} />
      <input
        type="file"
        id="animationUrl"
        name="animationUrl"
        onChange={handleAnimationUrlChange}
      />
      <div onChange={handleNetworkChange}>
        <input type="radio" value="LOCAL" name="network" /> Local
        <input type="radio" value="ETH" name="network" /> Ethereum
        <input type="radio" value="MATIC" name="network" /> Matic
        <input type="radio" value="BSN" name="network" /> BSC
      </div>
      <div>
        <label>Name</label>
        <input type="text" name="name" id="name" onChange={handleNameChange} />
      </div>
      <div>
        <label>Description</label>
        <textarea
          name="description"
          id="description"
          onChange={handleDescriptionChange}
        />
      </div>
      <div>
        <label>Initial Price</label>
        <input
          type="number"
          name="initial_price"
          id="initial_price"
          onChange={handleInitialPriceChange}
        />
      </div>
      <div>
        <label>Royality</label>
        <input
          type="number"
          name="royality"
          id="royality"
          onChange={handleRoyalityChange}
        />
      </div>
      <button onClick={createNft}>CREATE NFT</button>
    </div>
  );
};

export default Create;
