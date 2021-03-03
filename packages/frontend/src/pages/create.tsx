import React from "react";
import { ethers } from "ethers";
import {
  ipfs,
  getEthersSigner,
  ChainIdType,
  getNetwork,
  ipfsHttpsBaseUrl,
  nullAddress,
  validateChainId,
} from "../modules/web3";

import { db } from "../modules/firebase";
import { Minamints } from "../types";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

const bs58 = require("bs58");
const logo = require("../assets/icon.png").default;

export const Create: React.FC = () => {
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState("");
  const [waitingTransactionConfirmation, setWaitingTransactionConfirmation] = React.useState(false);
  const [alertStatus, setAlertStatus] = React.useState({
    category: "",
    msg: "",
  });
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [exploreUrl, setExploreUrl] = React.useState("");

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
    const { name } = file;
    const type = name.substring(name.lastIndexOf(".") + 1);
    const fileBuffer = await readAsArrayBufferAsync(file);
    const fileUint8Array = new Uint8Array(fileBuffer as Buffer);
    const path = `nft.${type}`;
    const { cid } = await ipfs.add({
      path: `images/${path}`,
      content: fileUint8Array,
    });
    return `${ipfsHttpsBaseUrl}${cid}/${path}`;
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(event.target.value);
  };

  const isFormNotReady = () => {
    return !name || !description || !imageUrl || !price;
  };

  const clearForm = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setImagePreview("");
    setPrice("");
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    //This can be processed when file presents
    setImagePreview("");
    setImageLoading(true);
    const file = event.target.files![0];
    const preview = URL.createObjectURL(file);
    const imageUrl = await uploadFileToIpfs(file);
    setImagePreview(preview);
    setImageUrl(imageUrl);
    setImageLoading(false);
  };

  const createNft = async () => {
    if (isFormNotReady()) {
      return;
    }
    setWaitingTransactionConfirmation(true);
    const value = ethers.utils.parseEther(price).toString();
    try {
      const signer = await getEthersSigner();
      const chainId = await signer.getChainId();
      if (!validateChainId(chainId)) {
        setErrorAlert("Please connect to rinkeby network.");
        return;
      }
      const { contractAddress } = getNetwork(chainId as ChainIdType);
      const choco = {
        name,
        description,
        image: imageUrl,
      };
      const metadataString = JSON.stringify(choco);
      const { cid } = await ipfs.add(metadataString);
      const creator = await signer.getAddress();
      const metadataIpfsHash = `0x${bs58.decode(cid.toString()).slice(2).toString("hex")}`;
      const recipient = nullAddress;
      const messageHash = ethers.utils.solidityKeccak256(
        ["uint256", "address", "bytes32", "uint256", "address"],
        [chainId, contractAddress, metadataIpfsHash, value, recipient]
      );
      const messageHashBinary = ethers.utils.arrayify(messageHash);
      const messageHashBinaryBuffer = Buffer.from(messageHashBinary);

      const leaves = [messageHashBinaryBuffer];
      const tree = new MerkleTree(leaves, keccak256, { sort: true });
      const root = tree.getHexRoot();
      const proof = tree.getHexProof(messageHashBinaryBuffer);
      const signature = await signer.signMessage(ethers.utils.arrayify(root));
      const record: Minamints = {
        chainId,
        contractAddress,
        metadataIpfsHash,
        value,
        recipient,
        root,
        proof,
        signature,
        creator,
        choco,
      };
      const orderId = ethers.utils.solidityKeccak256(
        ["uint256", "address", "bytes32", "address"],
        [chainId, contractAddress, metadataIpfsHash, creator]
      );
      await db.collection("minamints").doc(orderId).set(record);

      // setExploreUrl(`${explore}${hash}`);
      // setSuccessAlert(`TxHash: \n${hash}`);
    } catch (err) {
      console.log(err);
      setErrorAlert(`Error: ${err.message}`);
    }
  };

  const setSuccessAlert = (msg: string) => {
    setWaitingTransactionConfirmation(false);
    setAlertStatus({
      category: "success",
      msg,
    });
  };

  const setErrorAlert = (msg: string) => {
    setWaitingTransactionConfirmation(false);
    setAlertStatus({
      category: "error",
      msg,
    });
  };

  const resetAlertStatus = () => {
    setWaitingTransactionConfirmation(false);
    setAlertStatus({
      category: "sucsess",
      msg: "",
    });
  };

  return (
    <div className="mx-auto h-screen bg-white">
      <div className="flex justify-center container mx-auto">
        <div className="w-full max-w-md p-4">
          <div>
            <img
              className="mx-auto h-20 rounded-xl w-auto border-b-4 border-green-700 shadow-md"
              src={logo}
              alt="logo"
            />
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Chocomint!</h2>
            <p className="text-center text-gray-500 text-sm">
              クリエイターとNFT発行者のマッチングサービス
            </p>
          </div>
          <div className="mt-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              名前
            </label>
            <input
              onChange={handleNameChange}
              type="text"
              name="name"
              id="name"
              className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
            />
          </div>
          <div className="mt-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              説明
            </label>
            <textarea
              onChange={handleDescriptionChange}
              id="description"
              name="description"
              className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
            ></textarea>
          </div>
          <div className="mt-2">
            <label
              htmlFor="cover_photo"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              画像
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
              <div className="space-y-4 text-center">
                {!imagePreview ? (
                  <svg
                    className={`mx-auto h-20 w-20 text-gray-400 ${
                      imageLoading && "animate-bounce"
                    }`}
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
                ) : (
                  <img
                    className={`mx-auto h-20 w-20 rounded-xl border-b-2 border-gray-600 shadow-md ${
                      waitingTransactionConfirmation && "animate-spin opacity-50"
                    }`}
                    src={imagePreview}
                  />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>NFTに登録する画像のアップロード</span>
                    <input
                      onChange={handleImageChange}
                      id="file"
                      name="file"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              販売価格
            </label>
            <input
              onChange={handlePriceChange}
              type="number"
              name="price"
              id="price"
              className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
              placeholder="ETH"
            />
          </div>
          <div className="mt-8">
            <button
              onClick={createNft}
              disabled={isFormNotReady()}
              className="disabled:opacity-50 w-full rounded-xl max-w-md bg-green-500 text-white font-bold py-2 px-4 border-b-4 border-green-700 shadow-md"
            >
              Let&apos;s Create!
            </button>
          </div>
          <div className="mt-8">
            {alertStatus.category == "success" && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">🎉</div>
                  <div className="ml-3 w-full">
                    <h3 className="text-md font-medium text-green-800">Success</h3>
                    <div className="mt-2 text-xs text-green-700">
                      <a href={exploreUrl}>
                        <p className="truncate w-60">{alertStatus.msg}</p>
                      </a>
                    </div>
                    <div className="mt-4">
                      <div className="-mx-2 -my-1.5 flex justify-end">
                        <button
                          className="ml-3 bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                          onClick={resetAlertStatus}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {alertStatus.category == "error" && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">🙇‍♂️</div>
                  <div className="ml-3 w-full">
                    <h3 className="text-md font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-xs text-red-700">
                      <p className="truncate w-60">{alertStatus.msg}</p>
                    </div>
                    <div className="mt-4">
                      <div className="-mx-2 -my-1.5 flex justify-end">
                        <button
                          className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                          onClick={resetAlertStatus}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
