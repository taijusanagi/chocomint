import React from "react";
import { useHistory } from "react-router-dom";
import { Modal } from "../components/molecules";
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
import "react-toastify/dist/ReactToastify.css";
import { db } from "../modules/firebase";
import { Pairmints } from "../types";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");
const bs58 = require("bs58");
const logo = require("../assets/icon.png").default;

export const Create: React.FC = () => {
  const history = useHistory();
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState("");
  const [
    waitingTransactionConfirmation,
    setWaitingTransactionConfirmation,
  ] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [creatorAddress, setCreatorAddress] = React.useState("");
  const [modals, setModals] = React.useState({
    success: false,
    error: false,
  });
  const [errorMsg, setErrorMsg] = React.useState("");

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

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        setErrorModal("Please connect to rinkeby network.");
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
      const metadataIpfsHash = `0x${bs58
        .decode(cid.toString())
        .slice(2)
        .toString("hex")}`;
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
      const record: Pairmints = {
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
      await db.collection("pairmints").doc(orderId).set(record);
      setCreatorAddress(creator);
      setSuccessModal();
    } catch (err) {
      console.log(err);
      setErrorModal(`Error: ${err.message}`);
    }
  };

  const openModal = async (target: "success" | "error") => {
    setModals({
      ...modals,
      [target]: true,
    });
  };

  const closeModal = async (target: "success" | "error") => {
    setModals({
      ...modals,
      [target]: false,
    });
  };

  const setSuccessModal = () => {
    resetStatus();
    openModal("success");
  };

  const setErrorModal = (msg: string) => {
    setWaitingTransactionConfirmation(false);
    setErrorMsg(msg);
    openModal("error");
  };

  const resetStatus = () => {
    setWaitingTransactionConfirmation(false);
    clearForm();
  };

  return (
    <div className="mx-auto h-screen bg-white">
      <div className="flex justify-center container mx-auto">
        <div className="w-full max-w-md p-4">
          {modals.success && (
            <Modal
              type="wide"
              closeValue="続けて発行する"
              execValue="作品を確認する"
              onClickClose={() => {
                closeModal("success");
              }}
              onClickExec={() => {
                history.push(`/box/${creatorAddress}`);
              }}
            >
              <div className="mx-4 my-4">
                <div className="text-center">
                  <h3
                    className="text-xl leading-6 font-medium text-gray-900 mb-8"
                    id="modal-headline"
                  >
                    🎉 Congratulation!!🎉
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      続けて発行するもしくは自分の作品を確認しよう！
                    </p>
                  </div>
                </div>
              </div>
            </Modal>
          )}
          {modals.error && (
            <Modal
              type="single"
              execColor="red"
              execValue="閉じる"
              onClickExec={() => {
                closeModal("error");
              }}
            >
              <div className="mx-4">
                <div className="text-center mt-2">
                  <h2
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-headline"
                  >
                    ERROR
                  </h2>
                  <div className="mt-2">
                    <p className="text-sm text-gray-800">
                      以下のようなエラーが発生しました。
                    </p>
                  </div>
                  <div className="overflow-auto mt-4 p-3 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-400">{errorMsg}</p>
                  </div>
                </div>
              </div>
            </Modal>
          )}
          <div>
            <img
              className="mx-auto h-20 rounded-xl w-auto border-b-4 border-green-700 shadow-md"
              src={logo}
              alt="logo"
            />
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Chocomint!
            </h2>
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
              value={name}
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
              value={description}
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
                      waitingTransactionConfirmation &&
                      "animate-spin opacity-50"
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
              value={price}
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
        </div>
      </div>
    </div>
  );
};

export default Create;
