import React from "react";
import IPFS from "ipfs-core";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
// import Web3 from "web3";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
import { abi as contractAbi } from "../ChocoMint.json";

export const Create: React.FC = () => {
  const [ipfs, setIpfs] = React.useState<any>();
  const [nft, setNft] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    IPFS.create().then((created) => setIpfs(created));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const type = event.target.files[0].name.split(".")[1];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const buffer = new Uint8Array(reader.result as Buffer);
      const { cid } = await ipfs.add({
        //TODO: I don't know if this is ok
        path: `images/nft.${type}`,
        content: buffer,
      });
      setNft(`ipfs://ipfs/${cid.toString()}/nft.${type}`);
    };
    reader.readAsArrayBuffer(event.target.files[0]);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
  };

  const uploadToIpfs = async () => {
    const metadata = {
      name,
      description,
      image: nft,
    };
    const buffer = Buffer.from(JSON.stringify(metadata));
    const { cid } = await ipfs.add({
      //TODO: I don't know if this is ok
      path: "json/metadata.json",
      content: buffer,
    });
    console.log(cid);
    const tokenUri = `https://ipfs.io/ipfs/${cid.toString()}.metadata.json`;

    const web3Modal = new Web3Modal();
    const web3ModalProvider = await web3Modal.connect();
    // const web3 = new Web3(web3ModalProvider);
    const web3Provider = new ethers.providers.Web3Provider(web3ModalProvider);
    const signer = web3Provider.getSigner();
    console.log(web3ModalProvider, tokenUri);

    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    const address = await signer.getAddress();

    contract.mint(address, tokenUri);

    // const contract = new web3.eth.Contract(contractAbi as any, contractAddress);
    // await contract.methods
    //   .mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", tokenUri)
    //   .send({ from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" });
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
      <button type="submit" onClick={uploadToIpfs}>
        Mint
      </button>
    </div>
  );
};

export default Create;
