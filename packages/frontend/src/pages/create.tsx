import React from "react";
import { useRecoilState } from "recoil";

import { ethers } from "ethers";
import {
  ipfs,
  chainId,
  ipfsHttpsBaseUrl,
  chocomintRegistryContract,
  getWeb3,
  selectedAddressState,
  initializeWeb3Modal,
} from "../modules/web3";
import "react-toastify/dist/ReactToastify.css";
import { functions } from "../modules/firebase";

import { Button } from "../components/atoms/Button";
import { Modal } from "../components/molecules/Modal";
import { Footer } from "../components/organisms/Footer";
import { Header } from "../components/organisms/Header";

const bs58 = require("bs58");
const logo = require("../assets/icon.png").default;

export const Create: React.FC = () => {
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isWaitingTransactionConfirmation, setIsWaitingTransactionConfirmation] = React.useState(
    false
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");
  const [modalUrl, setModalUrl] = React.useState<string | undefined>(undefined);
  const [modalNewTab, setModalNewTab] = React.useState<boolean | undefined>(undefined);
  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);

  const openModal = (message: string, url?: string, newTab?: boolean) => {
    setModalMessage(message);
    setModalUrl(url);
    setModalNewTab(newTab);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
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

  const clickInputFile = () => {
    document.getElementById("file")!.click();
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

  React.useEffect(() => {
    const dropContainer = document.getElementById("dropContainer") as any;
    dropContainer.ondragover = dropContainer.ondragenter = function (event: any) {
      event.preventDefault();
    };
    dropContainer.ondrop = function (event: any) {
      if (event.target.files) {
        processImage(event.target.files[0]);
      }
      event.preventDefault();
    };
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processImage(event.target.files[0]);
    }
  };

  const isFormReady = () => {
    return name && description && imageUrl;
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

  const createNft = async () => {
    if (!isFormReady() || !selectedAddress) {
      return;
    }
    setIsWaitingTransactionConfirmation(true);
    try {
      const choco = {
        name,
        description,
        image: imageUrl,
      };
      const metadataString = JSON.stringify(choco);
      const { cid } = await ipfs.add(metadataString);
      const ipfsHash = `0x${bs58.decode(cid.toString()).slice(2).toString("hex")}`;
      const registry = chocomintRegistryContract.address;
      const creator = selectedAddress;
      const messageHash = ethers.utils.solidityKeccak256(
        ["uint256", "address", "bytes32", "address"],
        [chainId, registry, ipfsHash, selectedAddress]
      );
      const web3 = await getWeb3();
      const signature = await web3.eth.personal.sign(messageHash, creator, "");
      const record = {
        chainId,
        registry,
        ipfsHash,
        creator,
        signature,
        choco,
      };
      const orderId = ethers.utils.solidityKeccak256(
        ["uint256", "address", "bytes32", "address"],
        ["1", registry, ipfsHash, creator]
      );
      await functions.httpsCallable("addChoco")({ orderId, record });
      clearForm();
      setIsWaitingTransactionConfirmation(false);
      openModal("🎉 Your NFT is ready to publish", `/nft/${orderId}`, false);
    } catch (err) {
      openModal(`🤦‍♂️ ${err.message}`);
    }
  };

  return (
    <div className="mx-auto h-screen bg-white flex flex-col">
      <Header />
      <div className="flex justify-center flex-grow container mx-auto">
        <div className="w-full sm:max-w-md p-4">
          <img
            onClick={() => openModal("🤫 Tutorial?", "/about", false)}
            className="cursor-pointer mx-auto h-20 rounded-xl w-auto border-b-2 border-green-600 shadow-md"
            src={logo}
            alt="logo"
          />

          <div className="mt-2">
            <label
              htmlFor="name"
              className="block text-sm font-bold text-gray-600 sm:mt-px sm:pt-2"
            >
              Name
            </label>
            <input
              value={name}
              onChange={handleNameChange}
              type="text"
              id="name"
              className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
            />
          </div>
          <div className="mt-2">
            <label
              htmlFor="description"
              className="block text-sm font-bold text-gray-600 sm:mt-px sm:pt-2"
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              id="description"
              className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
            ></textarea>
          </div>
          <div className="mt-2" id="dropContainer">
            <label
              htmlFor="cover_photo"
              className="block text-sm font-bold text-gray-600 sm:mt-px sm:pt-2"
            >
              Image
            </label>
            <div className="mt-1 flex justify-center p-8 border-2 border-gray-300 border-dashed rounded-xl">
              <div className={"cursor-pointer"} onClick={clickInputFile}>
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
                    className={`object-cover mx-auto h-20 w-20 rounded-xl border-b-2 border-gray-400 shadow-md ${
                      isWaitingTransactionConfirmation && "animate-spin opacity-50"
                    }`}
                    src={imagePreview}
                  />
                )}
                <input
                  onChange={handleImageChange}
                  id="file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                />
              </div>
            </div>
          </div>
          <div className="mt-8">
            {!selectedAddress ? (
              <Button onClick={connectWallet} type="primary">
                Connect <span className="ml-1">🔐</span>
              </Button>
            ) : (
              <Button onClick={createNft} disabled={!isFormReady()} type="primary">
                Create <span className="ml-1">💎</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <Modal text={modalMessage} url={modalUrl} newTab={modalNewTab} onClickDismiss={closeModal}>
          {modalMessage}
        </Modal>
      )}
      <Footer />
    </div>
  );
};

export default Create;
