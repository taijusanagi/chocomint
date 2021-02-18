import React from "react";
import IPFS, { IPFS as IPFSType } from "ipfs-core";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

type networkType = "LOCAL" | "ETH" | "MATIC" | "BSC";

const networkConfigs = {
  LOCAL: {
    chainId: "31337",
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
  ETH: {
    chainId: "",
    address: "",
  },
  MATIC: {
    chainId: "",
    address: "",
  },
  BSC: {
    chainId: "",
    address: "",
  },
};

export const Create: React.FC = () => {
  const [ipfs, setIpfs] = React.useState<IPFSType>();
  const [file, setFile] = React.useState<File>();
  const [network, setNetwork] = React.useState<networkType>("LOCAL");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [initialPrice, setInitialPrice] = React.useState("");
  const [royality, setRoyality] = React.useState("");

  React.useEffect(() => {
    IPFS.create().then((created) => setIpfs(created));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    setFile(event.target.files[0]);
  };

  const handleNetworkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const uploadToIpfs = async () => {
    if (!ipfs || !file || !name || !description) {
      return;
    }
    const type = file.name.split(".")[1];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageBuffer = new Uint8Array(reader.result as Buffer);
      const { cid: imageCid } = await ipfs.add({
        path: `images/nft.${type}`,
        content: imageBuffer,
      });
      const image = `https://ipfs.io/ipfs/${imageCid.toString()}/nft.${type}`;
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
        blank: "",
        initialPrice,
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
          choco.blank,
          choco.initialPrice,
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
      console.log(messageHashBinaryBuffer);
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
      console.log(`Congraturation! Your NFT: ${choco.tokenId} is created!`);
      console.log(
        `Verified on IPFS: https://ipfs.io/ipfs/${metadataCid.toString()}`
      );
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <label>Upload file</label>
      <input
        type="file"
        id="uploadedFile"
        name="uploadedFile"
        onChange={handleFileChange}
      />
      <img src={getPreviewImageSrc(file)} />
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
      <button onClick={uploadToIpfs}>Create NFT</button>
    </div>
  );
};

export default Create;
