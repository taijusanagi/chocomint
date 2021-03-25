import React from "react";
import { useRecoilState } from "recoil";

import { ethers } from "ethers";

import {
  ipfs,
  chainId,
  ipfsHttpsBaseUrl,
  Chocopound,
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
  getAaveTokens,
  networkName,
  roundAndFormatPrintPrice,
  getPrices,
} from "../modules/web3";

import { Choco } from "../types";

import { analytics, functions, firestore, collectionName } from "../modules/firebase";

import { Body } from "../components/atoms/Body";
import { Button } from "../components/atoms/Button";
import { Modal } from "../components/atoms/Modal";
import { ImageUploadIcon } from "../components/atoms/ImageUploadIcon";
import { MessageModal, useMessageModal } from "../components/molecules/MessageModal";
import { Header } from "../components/organisms/Header";
import { Footer } from "../components/organisms/Footer";
const canonicalize = require("canonicalize");

export const Create: React.FC = () => {
  const maxBooster = 128;
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [currency, setCurrency] = React.useState("ETH");
  const [supplyLimit, setSupplyLimit] = React.useState(defaultSupplyLimit);
  const [initialPriceString, setInitialPriceString] = React.useState(
    ethers.utils.formatEther(defaultInitialPrice)
  );
  const [diluter, setDiluter] = React.useState(defaultDiluter);
  const [initialPrice, setInitialPrice] = React.useState(defaultInitialPrice);

  const prices = getPrices(
    defaultSupplyLimit,
    defaultInitialPrice,
    defaultDiluter,
    defaultCrr,
    defaultRoyaltyRatio
  );
  const lastPriceString = prices.pricesAtEachSupply[defaultSupplyLimit - 1].printPrice;
  const [lastPrice, setLastPrice] = React.useState(roundAndFormatPrintPrice(lastPriceString, 3));
  const [isWaitingTransactionConfirmation, setIsWaitingTransactionConfirmation] = React.useState(
    false
  );
  const [aTokens, setAtokens] = React.useState<any>(undefined);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = React.useState(false);

  const [, setSelectedAddress] = useRecoilState(selectedAddressState);
  const { connectWallet } = useWallet();
  const { messageModal, openModal, closeModal } = useMessageModal();

  const toggelCurrencyModal = () => {
    setIsCurrencyModalOpen(!isCurrencyModalOpen);
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

  const handleSupplyLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(event.target.value);
    if (val > 0 && val < 257) {
      setSupplyLimit(parseInt(event.target.value));
    } else {
      setSupplyLimit(1);
    }
  };

  const handleInitialPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(event.target.value);
    if (val > 0.001 && val < 10000) {
      setInitialPriceString(event.target.value);
      setInitialPrice(ethers.utils.parseEther(event.target.value).toString());
    } else {
      setInitialPriceString("0");
      setInitialPrice("0");
    }
  };

  const handleDiluterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiluter(parseInt(event.target.value));
  };

  const updateSalePlanning = () => {
    const reverseDiluter = maxBooster + 1 - diluter;
    const tempLimit = supplyLimit;
    const prices = getPrices(
      tempLimit,
      initialPrice,
      reverseDiluter,
      defaultCrr,
      defaultRoyaltyRatio
    );
    const lastPrice = prices.pricesAtEachSupply[tempLimit - 1].printPrice;

    const roundedPrice = roundAndFormatPrintPrice(lastPrice, 3);
    setLastPrice(roundedPrice);
    toggelCurrencyModal();
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
    setAtokens(getAaveTokens(networkName));
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processImage(event.target.files[0]);
    }
  };

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrency(event.target.value);
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

      const metadata = {
        name,
        description,
        image: imageUrl,
      };
      const metadataString = canonicalize(metadata);
      const { cid } = await ipfs.add(metadataString);
      const ipfsHash = cidToIpfsHash(cid);

      let currencyAddress;
      if (currency == "WETH") {
        currencyAddress = nullAddress;
      } else {
        const aToken = aTokens.filter((aToken: any) => aToken.symbol == currency);
        currencyAddress = aToken[0].address;
      }

      const chocoId = hashChoco(
        chainId,
        Chocopound,
        currencyAddress,
        creatorAddress,
        ipfsHash,
        supplyLimit,
        initialPrice,
        diluter,
        defaultCrr,
        defaultRoyaltyRatio
      );

      const doc = await firestore.collection(collectionName).doc(chocoId).get();
      if (doc.exists) {
        clearForm();
        setIsWaitingTransactionConfirmation(false);
        openModal(
          "🤔",
          "This NFT is already listed in Chocomint!",
          "Check",
          `/creator/${creatorAddress}`,
          false
        );
        return;
      } else {
        const signature = await web3.eth.personal.sign(chocoId, creatorAddress, "");
        const choco: Choco = {
          chocoId,
          chainId,
          chocopoundAddress: Chocopound,
          currencyAddress,
          creatorAddress,
          ipfsHash,
          supplyLimit,
          initialPrice,
          diluter,
          crr: defaultCrr,
          royaltyRatio: defaultRoyaltyRatio,
          signature,
          metadata,
        };
        await functions.httpsCallable("createChoco")({ chocoId, choco });
        clearForm();
        setIsWaitingTransactionConfirmation(false);
        openModal(
          "🎉",
          "NFT is created in Chocomint!",
          "Check",
          `/creator/${creatorAddress}`,
          false
        );
        analytics.logEvent("click", {
          type: "button",
          name: "create_nft",
        });
      }
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
          <img className=" mx-auto h-12 w-auto solidity" src="/logo.png" alt="logo" />
          <div className="mt-4">
            <label htmlFor="name" className="block text-sm font-bold text-gray-600">
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
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-bold text-gray-600">
              Description
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              id="description"
              className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
            ></textarea>
          </div>
          <div className="mt-4" id="dropContainer">
            <label htmlFor="cover_photo" className="block text-sm font-bold text-gray-600">
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
          <div className="mt-4">
            <p className="block text-sm font-bold text-gray-600">Sales Planning</p>
            <div className="flex">
              <p className="h-8 leading-8 align-bottom text-sm font-medium text-gray-500">
                {supplyLimit} prints / {initialPriceString} {currency} to {lastPrice} {currency}
              </p>
              <div className="flex-auto"></div>
              <button
                onClick={toggelCurrencyModal}
                className="focus:outline-none text-xs text-gray-700 font-bold bg-gray-100 px-2 solidity"
              >
                Update
              </button>
            </div>
          </div>
          <div className="mt-8">
            <Button onClick={createNft} disabled={!isFormReady()} type="primary">
              Create <span className="ml-1">💎</span>
            </Button>
          </div>
        </div>
      </div>
      {isCurrencyModalOpen && (
        <Modal icon="🔧">
          <div className="p-4">
            <h3 className="text-center text-xl text-gray-600 font-bold mb-4">Sales Planning</h3>
            <div className="mt-4">
              <label htmlFor="name" className="block text-left text-sm font-bold text-gray-600">
                Supply Limit
              </label>
              <input
                min="1"
                max="256"
                value={supplyLimit}
                onChange={handleSupplyLimitChange}
                type="number"
                id="supplyLimit"
                className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="name" className="block text-left text-sm font-bold text-gray-600">
                Initial Price ( {currency} )
              </label>
              <input
                min="0.001"
                step="0.001"
                value={initialPriceString}
                onChange={handleInitialPriceChange}
                type="number"
                id="initialPrice"
                className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="name" className="block text-left text-sm font-bold text-gray-600">
                Bonded Curve Booster
              </label>
              <input
                type="range"
                className="w-full mt-2"
                onChange={handleDiluterChange}
                value={diluter}
                min="1"
                max={maxBooster}
              />
            </div>
            <ul className="flex mt-2">
              {aTokens &&
                aTokens.map((atoken: any, i: number) => {
                  return (
                    <li key={i} className="items-center p-2">
                      <label>
                        <img
                          className={`w-10 h-10 ${atoken.symbol != currency && "opacity-20"}`}
                          src={`/coins/${atoken.symbol}.svg`}
                        />
                        <input
                          type="radio"
                          name="currency"
                          value={atoken.symbol}
                          className="sr-only"
                          checked={atoken.symbol == currency}
                          onChange={handleCurrencyChange}
                        ></input>
                      </label>
                    </li>
                  );
                })}
            </ul>
            <div className="mt-4">
              <Button onClick={updateSalePlanning} type="tertiary">
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* pricing */}
      {/* <Modal icon="🔧">{aTokens && <>ok</>}</Modal> */}
      {messageModal && <MessageModal {...messageModal} onClickDismiss={closeModal} />}
      <Footer />
    </Body>
  );
};

export default Create;
