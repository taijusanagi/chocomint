import React from "react";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");
import { IPFS } from "ipfs-core";
import {
  useIpfs,
  getEthersSigner,
  getIdxSigner,
  ChainIdType,
  getNetworkConfig,
  ipfsBaseUrl,
  ipfs,
} from "../modules/web3";

export const Create: React.FC = () => {
  const [did, setDid] = React.useState("");
  const [createdChocomint, setCreatedChocomint] = React.useState<
    undefined | string[]
  >(undefined);
  const [image, setImage] = React.useState("");
  const [animation_url, setAnimationUrl] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState("");
  const [chainId, setChainId] = React.useState<ChainIdType>("4");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [initial_price, setInitialPrice] = React.useState("");

  const connect = async () => {
    const idx = await getIdxSigner();
    const did = idx.id;
    setDid(did);
    console.log("did", did);
    console.log("get createdChocomint");
    const oldRecord: any = await idx.get("createdChocomint");
    console.log("got createdChocomint done", oldRecord);
    const chocomints = oldRecord ? oldRecord.chocomints : [];
    setCreatedChocomint(chocomints);
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

  const uploadFileToIpfs = async (file: File) => {
    const fileType = file.name.split(".")[1];
    const fileBuffer = await readAsArrayBufferAsync(file);
    const fileUint8Array = new Uint8Array(fileBuffer as Buffer);
    const imageFileName = `${fileType}.${fileType}`;
    const { cid } = await ipfs.add({
      path: `media/${imageFileName}`,
      content: fileUint8Array,
    });
    return `${ipfsBaseUrl}${cid.toString()}/${imageFileName}`;
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    //This can be processed when file presents
    const file = event.target.files![0];
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    const image = await uploadFileToIpfs(file);
    setImage(image);
    console.log("image", image);
  };

  const handleAnimationUrlChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    //This can be processed when file presents
    const file = event.target.files![0];
    const animation_url = await uploadFileToIpfs(file);
    setAnimationUrl(animation_url);
    console.log("animation_url", animation_url);
  };

  const handleNetworkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //This can be selected fixed radio button
    setChainId(event.target.value as ChainIdType);
    console.log("network", event.target.value);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    console.log("name", event.target.value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
    console.log("description", event.target.value);
  };

  const handleInitialPriceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInitialPrice(event.target.value);
    console.log("initialPrice", event.target.value);
  };

  const createNft = async () => {
    console.log("createNft");
    if (!createdChocomint || !image || !animation_url) {
      console.log("not ready");
      return;
    }
    const signer = await getEthersSigner();
    const idx = await getIdxSigner();
    const iss = await signer.getAddress();
    const { contractAddress } = getNetworkConfig(chainId);
    const choco = {
      chainId,
      contractAddress: contractAddress.toLowerCase(),
      tokenId: "", //calculated later
      name,
      description,
      image,
      animation_url,
      initial_price: ethers.utils.parseEther(initial_price).toString(),
      fees: ["100"], //advanced feature
      recipients: [iss.toLowerCase()],
      iss: iss.toLowerCase(),
      sub: "0x0000000000000000000000000000000000000000", //advanced feature
      root: "", //calculated later
      proof: [""], //calculated later
      signature: "", //calculated later
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
        contractAddress,
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
    const metadataString = JSON.stringify(choco);
    const { cid } = await ipfs.add(metadataString);

    if (!createdChocomint.includes(metadataString)) {
      createdChocomint.unshift(metadataString);
      console.log("set createdChocomint", createdChocomint);
      await idx.set("createdChocomint", {
        chocomints: createdChocomint,
      });
      console.log("set createdChocomint done");
    }
    console.log(
      `Congraturation! Your NFT is on : ${
        window.location.origin
      }/nft/${cid.toString()}`
    );
  };

  return (
    <div>
      {!did ? (
        <button id="connect" onClick={connect}>
          Connect
        </button>
      ) : (
        <div>
          <label>Upload image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
          />
          <img src={imagePreview} />
          <label>Upload Movie/Music/3D model</label>
          <input
            type="file"
            id="animationUrl"
            name="animationUrl"
            onChange={handleAnimationUrlChange}
          />
          <div onChange={handleNetworkChange}>
            <input type="radio" value="4" name="chainId" defaultChecked />
            Rinkeby
            <input type="radio" value="80001" name="chainId" /> Mumbai
            <input type="radio" value="31337" name="chainId" /> Local (dev only)
          </div>
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleNameChange}
            />
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
          <button onClick={createNft}>CREATE NFT</button>
        </div>
      )}
    </div>
  );
};

export default Create;
