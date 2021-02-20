import React from "react";
import IPFS from "ipfs-core";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

import { Signer } from "../modules/web3";
const signer = new Signer();

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
  const [imageFile, setImage] = React.useState<File>();
  const [animationFile, setAnimationFile] = React.useState<File>();
  const [network, setNetwork] = React.useState<networkType>("ETH");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [initial_price, setInitialPrice] = React.useState("");
  const [royality, setRoyality] = React.useState("");

  const getFileType = (file: File) => {
    return file.name.split(".")[1];
  };

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
    console.log("createNft");
    if (!imageFile || !name || !description) {
      return;
    }

    const ipfs = await IPFS.create();
    console.log(ipfs, "ipfs");
    const imageType = getFileType(imageFile);
    const imageBuffer = await readAsArrayBufferAsync(imageFile);
    const imageUint8Array = new Uint8Array(imageBuffer as Buffer);
    const imageFileName = `${imageType}.${imageType}`;
    const { cid: imageCid } = await ipfs.add({
      path: `images/${imageFileName}`,
      content: imageUint8Array,
    });
    const image = `ipfs://${imageCid.toString()}/${imageFileName}`;
    console.log(image, "image");
    let animation_url = "";
    if (animationFile) {
      const animationType = getFileType(animationFile);
      const animationBuffer = await readAsArrayBufferAsync(animationFile);
      const animationUint8Array = new Uint8Array(animationBuffer as Buffer);
      const animationFileName = `${animationType}.${animationType}`;
      const { cid: animationCid } = await ipfs.add({
        path: `images/${animationFileName}`,
        content: animationUint8Array,
      });
      animation_url = `ipfs://${animationCid.toString()}/${animationFileName}`;
    }
    console.log(animation_url, "animation_url");
    const { address } = await signer.init();
    const chainId = networkConfigs[network].chainId;
    const contractAddress = networkConfigs[network].address;
    const iss = address;
    const choco = {
      chainId,
      contractAddress,
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
    choco.signature = await signer.ethers.signMessage(
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
    const chocomints = (await signer.idx.get("createdChocomint")) as any;

    if (!chocomints.chocomints.includes(metadataString)) {
      chocomints.unshift(metadataString);
    }

    await signer.idx.set("createdChocomint", { chocomints: [metadataString] });
    console.log(
      `Congraturation! Your NFT is on : ${
        window.location.origin
      }/nft?cid=${metadataCid.toString()}`
    );
  };

  return (
    <div>
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
