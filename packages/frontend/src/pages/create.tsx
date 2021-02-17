import React from "react";
import IPFS, { IPFS as IPFSType } from "ipfs-core";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
import { abi as contractAbi } from "../ChocoMint.json";

export const Create: React.FC = () => {
  const [ipfs, setIpfs] = React.useState<IPFSType>();
  const [tokenUri, setTokenUri] = React.useState("");
  const [file, setFile] = React.useState<File>();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [quantity, setQuantity] = React.useState("");

  React.useEffect(() => {
    IPFS.create().then((created) => setIpfs(created));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    setFile(event.target.files[0]);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(event.target.value);
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
      const nftBuffer = new Uint8Array(reader.result as Buffer);
      const { cid: nftCid } = await ipfs.add({
        path: `images/nft.${type}`,
        content: nftBuffer,
      });
      const nft = `ipfs://ipfs/${nftCid.toString()}/nft.${type}`;
      const metadata = {
        name,
        description,
        image: nft,
      };
      const metadataBuffer = Buffer.from(JSON.stringify(metadata));
      const { cid: metadataCid } = await ipfs.add(metadataBuffer);

      setTokenUri(
        `https://ipfs.io/ipfs/${metadataCid.toString()}/metadata.json`
      );
      console.log(`https://ipfs.io/ipfs/${metadataCid.toString()}`);
    };
    reader.readAsArrayBuffer(file);
  };

  const mintNFT = async () => {
    if (!quantity || !tokenUri) {
      return;
    }
    const web3Modal = new Web3Modal();
    const web3ModalProvider = await web3Modal.connect();
    const web3Provider = new ethers.providers.Web3Provider(web3ModalProvider);
    const signer = web3Provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    contract.mint(quantity, tokenUri);
  };

  return (
    <div>
      <h3>Mint Choco NFT</h3>
      <label>Upload file</label>
      <input
        type="file"
        id="uploadedFile"
        name="uploadedFile"
        onChange={handleFileChange}
      />
      <img src={getPreviewImageSrc(file)} />
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
        <label>Quantity</label>
        <input name="quantity" id="quantity" onChange={handleQuantityChange} />
      </div>
      <button onClick={uploadToIpfs}>Upload</button>
      <button onClick={mintNFT}>Mint</button>
    </div>
  );
};

export default Create;
