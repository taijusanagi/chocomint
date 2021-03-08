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
  cidToIpfsHash,
} from "../modules/web3";
import { functions } from "../modules/firebase";

import { Body } from "../components/atoms/Body";
import { Button } from "../components/atoms/Button";
import { Container } from "../components/atoms/Container";
import { ImageUploadIcon } from "../components/atoms/ImageUploadIcon";
import { Modal, useModal } from "../components/molecules/Modal";
import { Footer } from "../components/organisms/Footer";
import { Header } from "../components/organisms/Header";

const logo = require("../assets/icon.png").default;
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
  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);

  const { modal, openModal, closeModal } = useModal();

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

  const registerNft = async () => {
    if (!isFormReady() || !selectedAddress) {
      return;
    }
    setIsWaitingTransactionConfirmation(true);
    try {
      const metadata = {
        name,
        description,
        image: imageUrl,
      };
      const metadataString = canonicalize(metadata);
      const { cid } = await ipfs.add(metadataString);
      const ipfsHash = cidToIpfsHash(cid);
      const registry = chocomintRegistryContract.address;
      const creator = selectedAddress;
      const messageHash = ethers.utils.solidityKeccak256(
        ["uint256", "address", "bytes32", "address"],
        [chainId, registry, ipfsHash, selectedAddress]
      );
      const web3 = await getWeb3();
      const signature = await web3.eth.personal.sign(messageHash, creator, "");
      const choco = {
        chainId,
        registry,
        ipfsHash,
        creator,
        signature,
        metadata,
      };
      const chocoId = ethers.utils.solidityKeccak256(
        ["uint256", "address", "bytes32", "address"],
        [chainId, registry, ipfsHash, creator]
      );
      await functions.httpsCallable("registerChoco")({ chocoId, choco });
      clearForm();
      setIsWaitingTransactionConfirmation(false);
      openModal("🎉", "NFT is registered in Chocomint!", "Check", `/nft/${chocoId}`, false);
    } catch (err) {
      openModal("🙇‍♂️", err.message);
    }
  };

  return (
    <Body>
      <Header />
      <Container>
        <div className="w-full sm:max-w-md p-4">
          <img
            onClick={() => openModal("🤫", "Tutorial?", "Check", "/about", false)}
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
                  <div className={`${imageLoading && "animate-bounce"}`}>
                    <ImageUploadIcon />
                  </div>
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
              <Button onClick={registerNft} disabled={!isFormReady()} type="primary">
                Register <span className="ml-1">💎</span>
              </Button>
            )}
          </div>
        </div>
      </Container>
      {modal && <Modal {...modal} onClickDismiss={closeModal} />}
      <Footer />
    </Body>
  );
};

export default Create;
