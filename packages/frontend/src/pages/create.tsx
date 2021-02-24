import React from "react";
import { ethers } from "ethers";

const bs58 = require("bs58");
import {
  ipfs,
  getEthersSigner,
  ChainIdType,
  getNetworkConfig,
  ipfsBaseUrl,
  getContract,
} from "../modules/web3";

const logo = require("../assets/icon.png").default;

export const Create: React.FC = () => {
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageDigest, setImageDigest] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState("");
  const [chainId, setChainId] = React.useState<ChainIdType>("4");

  const [modalDisplay, setModalDisplay] = React.useState(false);

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
    setModalDisplay(true);
  };

  const handleNetworkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //This can be selected fixed radio button
    console.log(event.target.value);
    setChainId(event.target.value as ChainIdType);
  };

  const createNft = async () => {
    const signer = await getEthersSigner();
    const iss = await signer.getAddress();
    const { contractAddress } = getNetworkConfig(chainId);
    const choco = {
      chainId,
      contractAddress: contractAddress.toLowerCase(),
      tokenId: "", //calculated later
      name: "",
      image: imageUrl,
      iss: iss.toLowerCase(),
    };
    const bytes32Name = ethers.utils.formatBytes32String(choco.name);
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "bytes32", "address"],
      [chainId, choco.contractAddress, bytes32Name, imageDigest, choco.iss]
    );
    choco.tokenId = ethers.BigNumber.from(messageHash).toString();
    choco.name = `NFT#${choco.tokenId}`;
    const metadataString = JSON.stringify(choco);
    await ipfs.add(metadataString);
    const contract = getContract(choco.contractAddress).connect(signer);
    await contract.mint(bytes32Name, imageDigest);
    console.log("tokenId", choco.tokenId);
  };

  return (
    <div className="container mx-auto h-screen bg-white">
      <div className="mx-auto w-full">
        <img className="mx-auto h-12 w-auto" src={logo} alt="logo" />
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Let’s create NFTs!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w">
          <a
            href="https://chocomint.app"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Decentralized multi-chain NFTs publish platform
          </a>
        </p>
      </div>
      <div className="mt-8">
        <div className="mt-1 sm:mt-0 sm:col-span-2 mx-auto">
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
      </div>
      {modalDisplay && (
        <div className="absolute fixed z-20 inset-0">
          <div className="flex min-h-screen p-4">
            <div className="fixed inset-0">
              <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
            </div>
            <div className="flex bg-white rounded-lg w-full max-w-sm mx-auto shadow-2xl transform">
              <div className="flex flex-col h-full w-full justify-between">
                <div>NFT</div>
                <div className="w-full p-4">
                  <img
                    className="w-full mx-auto rounded-xl"
                    src={imagePreview}
                  />
                </div>
                <div>
                  <button
                    onClick={createNft}
                    className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-blue-500 rounded"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;
