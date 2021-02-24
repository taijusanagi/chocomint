import React from "react";
import { ethers } from "ethers";

import { IPFS } from "ipfs-core";
const bs58 = require("bs58");
import {
  useIpfs,
  getEthersSigner,
  ChainIdType,
  getNetworkConfig,
  ipfsBaseUrl,
  getContract,
} from "../modules/web3";

export const Create: React.FC = () => {
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageDigest, setImageDigest] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState("");
  const [chainId, setChainId] = React.useState<ChainIdType>("4");
  const [name, setName] = React.useState("");

  const ipfs = useIpfs() as IPFS;

  const readAsArrayBufferAsync = (file: File) => {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result);
      };
      fr.readAsArrayBuffer(file);
    });
  };

  const uploadFileToIpfs = async (file: File) => {
    const fileBuffer = await readAsArrayBufferAsync(file);
    const fileUint8Array = new Uint8Array(fileBuffer as Buffer);
    const { cid } = await ipfs.add(fileUint8Array);
    return {
      digest: `0x${bs58.decode(cid.toString()).slice(2).toString("hex")}`,
      url: `${ipfsBaseUrl}${cid}`,
    };
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    //This can be processed when file presents
    const file = event.target.files![0];
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    const { url, digest } = await uploadFileToIpfs(file);
    setImageUrl(url);
    setImageDigest(digest);
  };

  const handleNetworkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //This can be selected fixed radio button
    setChainId(event.target.value as ChainIdType);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const createNft = async () => {
    const signer = await getEthersSigner();
    const iss = await signer.getAddress();
    const { contractAddress } = getNetworkConfig(chainId);
    const choco = {
      chainId,
      contractAddress: contractAddress.toLowerCase(),
      tokenId: "", //calculated later
      name,
      image: imageUrl,
      iss: iss.toLowerCase(),
    };
    const bytes32Name = ethers.utils.formatBytes32String(choco.name);
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "bytes32", "address"],
      [chainId, choco.contractAddress, bytes32Name, imageDigest, choco.iss]
    );
    choco.tokenId = ethers.BigNumber.from(messageHash).toString();
    const metadataString = JSON.stringify(choco);
    const { cid } = await ipfs.add(metadataString);
    const contract = getContract(choco.contractAddress).connect(signer);
    const { hash } = await contract.mint(bytes32Name, imageDigest);
    console.log("cid", cid);
  };

  return (
    <div>
      <label>Upload image</label>
      <input type="file" id="image" name="image" onChange={handleImageChange} />
      <img src={imagePreview} />
      <div onChange={handleNetworkChange}>
        <input type="radio" value="4" name="chainId" defaultChecked />
        Rinkeby
        <input type="radio" value="80001" name="chainId" /> Mumbai
        <input type="radio" value="31337" name="chainId" /> Local (dev only)
      </div>
      <div>
        <label>Name</label>
        <input type="text" name="name" id="name" onChange={handleNameChange} />
      </div>
      <button onClick={createNft}>CREATE NFT</button>
    </div>
  );
};

export default Create;
