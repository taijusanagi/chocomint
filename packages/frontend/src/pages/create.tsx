import React from "react";
import { useRecoilState } from "recoil";

import { ethers } from "ethers";
import {
  ipfs,
  chainId,
  ipfsHttpsBaseUrl,
  nullAddress,
  getWeb3,
  selectedAddressState,
  initializeWeb3Modal,
  clearWeb3Modal,
} from "../modules/web3";
import "react-toastify/dist/ReactToastify.css";
import { firestore, functions, collectionName } from "../modules/firebase";

import { Button } from "../components/atoms/Button";
import { Modal } from "../components/molecules/Modal";
import { Header } from "../components/organisms/Header";

const bs58 = require("bs58");
const logo = require("../assets/icon.png").default;

export const Create: React.FC = () => {
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState("");
  const [waitingTransactionConfirmation, setWaitingTransactionConfirmation] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);

  const [modals, setModals] = React.useState("");
  // const [modalMessage setModalMessage] =  React.useState("");

  React.useEffect(() => {
    const dropContainer = document.getElementById("dropContainer") as any;
    dropContainer.ondragover = dropContainer.ondragenter = function (event: any) {
      event.preventDefault();
    };
    dropContainer.ondrop = function (event: any) {
      const file = event.dataTransfer.files[0];
      processImage(file);
      event.preventDefault();
    };
  }, []);

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

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const processImage = async (file: File) => {
    setImagePreview("");
    setImageLoading(true);
    const preview = URL.createObjectURL(file);
    const imageUrl = await uploadFileToIpfs(file);
    setImagePreview(preview);
    setImageUrl(imageUrl);
    setImageLoading(false);
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    processImage(file);
  };

  const isFormNotReady = () => {
    return !name || !description || !imageUrl;
  };

  const clearForm = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setImagePreview("");
  };

  const connectWallet = async () => {
    const provider = await initializeWeb3Modal();
    setSelectedAddress(provider.selectedAddress);
  };

  const clickInputFile = () => {
    const inputFile = document.getElementById("file") as any;
    inputFile.click();
  };

  const createNft = async () => {
    if (isFormNotReady() || !selectedAddress) {
      return;
    }
    setWaitingTransactionConfirmation(true);
    const value = ethers.utils.parseEther("1").toString();
    try {
      const web3 = await getWeb3();
      const contractAddress = "";
      const choco = {
        name,
        description,
        image: imageUrl,
      };
      const metadataString = JSON.stringify(choco);
      const { cid } = await ipfs.add(metadataString);
      const [creator] = await web3.eth.getAccounts();
      const metadataIpfsHash = `0x${bs58.decode(cid.toString()).slice(2).toString("hex")}`;
      const recipient = nullAddress;
      const messageHash = ethers.utils.solidityKeccak256(
        ["uint256", "address", "bytes32", "uint256", "address"],
        [1, contractAddress, metadataIpfsHash, value, recipient]
      );
      const signature = await web3.eth.personal.sign(messageHash, creator, "");
      const record = {
        chainId: 1,
        contractAddress,
        metadataIpfsHash,
        value,
        recipient,
        signature,
        creator,
        choco,
      };
      const orderId = ethers.utils.solidityKeccak256(
        ["uint256", "address", "bytes32", "address"],
        ["1", contractAddress, metadataIpfsHash, creator]
      );
      await firestore.collection(collectionName).doc(orderId).set(record);
      // setSuccessModal();
    } catch (err) {
      console.log(err);
      // setErrorModal(`Error: ${err.message}`);
    }
  };

  // const openModal = async (target: "success" | "error") => {
  //   setModals({
  //     ...modals,
  //     [target]: true,
  //   });
  // };

  // const closeModal = async (target: "success" | "error") => {
  //   setModals({
  //     ...modals,
  //     [target]: false,
  //   });
  // };

  // const setSuccessModal = () => {
  //   resetStatus();
  //   openModal("success");
  // };

  // const setErrorModal = (msg: string) => {
  //   setWaitingTransactionConfirmation(false);
  //   setErrorMsg(msg);
  //   openModal("error");
  // };

  const resetStatus = () => {
    setWaitingTransactionConfirmation(false);
    clearForm();
  };

  return (
    <div className="mx-auto h-screen bg-white">
      <Header />
      <div className="flex justify-center container mx-auto">
        <div className="w-full max-w-md p-2">
          {/* <Modal
            onClickDismiss={() => {
              closeModal("success");
            }}
          >
            Modal
          </Modal> */}
          <div>
            <img
              className="mx-auto h-20 rounded-xl w-auto border-b-2 border-green-600 shadow-md"
              src={logo}
              alt="logo"
            />
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Chocomint!</h2>
            <p className="text-center text-gray-500 text-sm">Let&apos;s create NFTs</p>
          </div>
          <div className="mt-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Name
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
              Description
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              id="description"
              name="description"
              className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
            ></textarea>
          </div>
          <div className="mt-2 cursor-pointer" onClick={clickInputFile} id="dropContainer">
            <label
              htmlFor="cover_photo"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Image
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
                    className={`object-cover mx-auto h-20 w-20 rounded-xl border-b-2 border-gray-600 shadow-md ${
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
                    <span>Upload image to IPFS</span>
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
          <div className="mt-8">
            {!selectedAddress ? (
              <Button onClick={connectWallet} type="primary">
                Connect <span className="ml-1">🔐</span>
              </Button>
            ) : (
              <Button onClick={createNft} disabled={isFormNotReady()} type="primary">
                Create <span className="ml-1">💎</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
