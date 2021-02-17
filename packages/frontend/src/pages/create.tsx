import React from "react";
import IPFS, { IPFS as IPFSType } from "ipfs-core";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

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
  const [creatorFee, setCreatorFee] = React.useState("");

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

  const handleCreatorFeeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCreatorFee(event.target.value);
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
      const choco = {
        chainId,
        address,
        name,
        description,
        image,
        initialPrice,
        creatorFee,
        creator: (await signer.getAddress()).toLowerCase(),
        signature: "",
      };
      const messageHash = ethers.utils.solidityKeccak256(
        ["string", "string", "string", "uint256", "uint256", "address"],
        [
          choco.name,
          choco.description,
          choco.image,
          choco.initialPrice,
          choco.creatorFee,
          choco.creator,
        ]
      );
      const messageHashBinary = ethers.utils.arrayify(messageHash);
      choco.signature = await signer.signMessage(messageHashBinary);
      const metadataBuffer = Buffer.from(JSON.stringify(choco));
      const { cid: metadataCid } = await ipfs.add(metadataBuffer);
      const tokenId = ethers.BigNumber.from(messageHash).toString();
      console.log(`Congraturation! Your NFT: ${tokenId} is created!`);
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
        <label>Creator Fee</label>
        <input
          type="number"
          name="creator_fee"
          id="creator_fee"
          onChange={handleCreatorFeeChange}
        />
      </div>
      <button onClick={uploadToIpfs}>Create NFT</button>
    </div>
  );
};

export default Create;
