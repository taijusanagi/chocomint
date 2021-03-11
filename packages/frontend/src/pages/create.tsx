import React from "react";
import { useRecoilState } from "recoil";

import {
  ipfs,
  chainId,
  ipfsHttpsBaseUrl,
  publisherAddress,
  getWeb3,
  selectedAddressState,
  cidToIpfsHash,
  hashChoco,
  defaultSupplyLimit,
  defaultDiluter,
  defaultInitialPrice,
  defaultCrr,
  defaultRoyaltyRatio,
  nullAddress,
  useWallet,
} from "../modules/web3";

import { Choco } from "../types";

import { functions } from "../modules/firebase";

import { Body } from "../components/atoms/Body";
import { Button } from "../components/atoms/Button";

import { ImageUploadIcon } from "../components/atoms/ImageUploadIcon";
import { MessageModal, useMessageModal } from "../components/molecules/MessageModal";
import { Header } from "../components/organisms/Header";
import { Footer } from "../components/organisms/Footer";
const canonicalize = require("canonicalize");

export const Create: React.FC = () => {
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isWaitingTransactionConfirmation, setIsWaitingTransactionConfirmation] = React.useState(
    false
  );
  const [, setSelectedAddress] = useRecoilState(selectedAddressState);
  const { connectWallet } = useWallet();
  const { messageModal, openModal, closeModal } = useMessageModal();

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

  const createNft = async () => {
    if (!isFormReady()) {
      return;
    }
    setIsWaitingTransactionConfirmation(true);
    try {
      const provider = await connectWallet();
      const web3 = await getWeb3(provider);
      const [creatorAddress] = await web3.eth.getAccounts();
      setSelectedAddress(creatorAddress);

      const currencyAddress = nullAddress;
      const metadata = {
        name,
        description,
        image: imageUrl,
      };
      const metadataString = canonicalize(metadata);
      const { cid } = await ipfs.add(metadataString);
      const ipfsHash = cidToIpfsHash(cid);

      const chocoId = hashChoco(
        chainId,
        publisherAddress,
        currencyAddress,
        creatorAddress,
        ipfsHash,
        defaultSupplyLimit,
        defaultInitialPrice,
        defaultDiluter,
        defaultCrr,
        defaultRoyaltyRatio
      );
      const signature = await web3.eth.personal.sign(chocoId, creatorAddress, "");
      const choco: Choco = {
        chocoId,
        chainId,
        publisherAddress,
        currencyAddress,
        creatorAddress,
        ipfsHash,
        supplyLimit: defaultSupplyLimit,
        initialPrice: defaultInitialPrice,
        diluter: defaultDiluter,
        crr: defaultCrr,
        royaltyRatio: defaultRoyaltyRatio,
        signature,
        metadata,
      };
      console.log(choco);
      await functions.httpsCallable("createChoco")({ chocoId, choco });
      clearForm();
      setIsWaitingTransactionConfirmation(false);
      openModal("🎉", "NFT is created in Chocomint!", "Check", `/nft/${chocoId}`, false);
    } catch (err) {
      openModal("🙇‍♂️", err.message);
    }
  };

  return (
    <Body>
      <Header />
      <div className="flex justify-center flex-grow container mx-auto">
        {/* TODO: align center for smart phone */}
        <div className="w-full sm:max-w-md p-4">
          <img className=" mx-auto h-20 w-auto solidity" src="/logo.png" alt="logo" />
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
                  <div className={`${imageLoading && "animate-bounce"}`}>
                    <ImageUploadIcon />
                  </div>
                ) : (
                  <img
                    className={`object-cover mx-auto h-20 w-20 solidity ${
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
          <div className="text-sm font-bold text-gray-600 sm:mt-px sm:pt-2">Advanced</div>
          <div className="flex flex-row justify-start">
            <button
              onClick={() =>
                openModal("🎉", "NFT is created in Chocomint!", "Check", `/nft`, false)
              }
              className="focus:outline-none grab-animation m-2 text-xs text-gray-700 font-bold bg-gray-100 solidity p-2"
            >
              Currency
            </button>
            <button className="focus:outline-none grab-animation m-2 text-xs text-gray-700 font-bold bg-gray-100 solidity p-2">
              Pricing
            </button>
          </div>
          <div className="mt-8">
            <Button onClick={createNft} disabled={!isFormReady()} type="primary">
              Create <span className="ml-1">💎</span>
            </Button>
          </div>
        </div>
      </div>
      {messageModal && <MessageModal {...messageModal} onClickDismiss={closeModal} />}
      <Footer />
    </Body>
  );
};

export default Create;
