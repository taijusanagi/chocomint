import React from "react";
import { Link, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";

import { ethers } from "ethers";

import { firestore, collectionName } from "../modules/firebase";
import {
  ipfsHashToIpfsUrl,
  verifyMetadata,
  chocomintPublisherContract,
  getEthersSigner,
  chainId,
  networkName,
  selectedAddressState,
  initializeWeb3Modal,
  explore,
  roundAndFormatPrintPrice,
  roundAndFormatBurnPrice,
} from "../modules/web3";

import { Body } from "../components/atoms/Body";
import { Button } from "../components/atoms/Button";
import { Modal, useModal } from "../components/molecules/Modal";
import { Header } from "../components/organisms/Header";

import { Choco } from "../types";

export const NFT: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [choco, setChoco] = React.useState<Choco | undefined>(undefined);
  const [ipfsUrl, setIpfsUrl] = React.useState("");
  const { modal, openModal, closeModal } = useModal();

  const [printCount, setPrintCount] = React.useState(0);
  const [printPrice, setPrintPrice] = React.useState<ethers.BigNumber | undefined>(undefined);
  const [burnPrice, setBurnPrice] = React.useState<ethers.BigNumber | undefined>(undefined);
  const [slippage, setSlippage] = React.useState(0);
  const slippageList = [0, 1, 2, 3];

  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);

  React.useEffect(() => {
    firestore
      .collection(collectionName)
      .doc(hash)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          openModal("😲", "It seems you're searching for non existing NFT.", "Home", "/", false);
          return;
        }
        const choco = doc.data() as Choco;
        const { ipfsHash, metadata } = choco;
        const ipfsVerified = verifyMetadata(ipfsHash, metadata);
        if (!ipfsVerified) {
          openModal("😲", "This NFT is not verified by IPFS.", "Home", "/", false);
          return;
        }
        const ipfsUrl = ipfsHashToIpfsUrl(ipfsHash);
        setIpfsUrl(ipfsUrl);
        setChoco(choco);
        chocomintPublisherContract.totalSupplies(hash).then((printCountBN) => {
          const printCount = parseInt(printCountBN.toString());
          setPrintCount(printCount);
          if (printCount == 0) {
            console.log(choco);
            // chocomintPublisherContract
            //   .calculatePrintPrice(choco?.virtualReserve, choco?.virtualSupply, choco.crr)
            //   .then((printPriceBN) => {
            //     setPrintPrice(printPriceBN);
            //   });
          } else {
            chocomintPublisherContract.getPrintPrice(hash).then((printPriceBN) => {
              setPrintPrice(printPriceBN[0]);
            });
            chocomintPublisherContract.getBurnPrice(hash).then((burnPriceBN) => {
              setBurnPrice(burnPriceBN);
            });
          }
        });
      });
  }, []);

  const connectWallet = async () => {
    const provider = await initializeWeb3Modal();
    setSelectedAddress(provider.selectedAddress);
  };

  const shortenAddress = (rawAddress: string) => {
    const pre = rawAddress.substring(0, 5);
    const post = rawAddress.substring(38);
    return `${pre}...${post}`;
  };

  const shortenName = (rawName: string) => {
    if (rawName.length > 10) {
      const name = rawName.substring(0, 10);
      return `${name}...`;
    }
    return rawName;
  };

  const print = async () => {
    if (!choco) {
      return;
    }
    try {
      const signer = await getEthersSigner();
      const signerNetwork = await signer.provider.getNetwork();
      if (signerNetwork.chainId != chainId) {
        openModal("😲", `Wrong network detected, please connect to ${networkName}.`);
        return;
      }

      const { hash: tx } = await chocomintPublisherContract
        .connect(signer)
        .publishAndMintPrint(
          choco.currencyAddress,
          choco.creatorAddress,
          choco.ipfsHash,
          choco.supplyLimit,
          choco.initialPrice,
          choco.diluter,
          choco.crr,
          choco.royaltyRatio,
          choco.signature,
          choco.initialPrice,
          0,
          { value: choco.initialPrice }
        );
      openModal("🎉", "Transaction is send to blockchain.", "Check", `${explore}${tx}`, true);
    } catch (err) {
      openModal("🙇‍♂️", err.message);
    }
  };

  const burn = async () => {
    if (!choco || !burnPrice) {
      return;
    }
    try {
      const signer = await getEthersSigner();
      const signerNetwork = await signer.provider.getNetwork();
      if (signerNetwork.chainId != chainId) {
        openModal("😲", `Wrong network detected, please connect to ${networkName}.`);
        return;
      }
      const { hash: tx } = await chocomintPublisherContract.connect(signer).burnPrint(hash, 0);
      openModal("🎉", "Transaction is send to blockchain.", "Check", `${explore}${tx}`, true);
    } catch (err) {
      openModal("🙇‍♂️", err.message);
    }
  };

  return (
    <Body>
      <Header />
      {choco && (
        <div className="grid grid-cols-1 md:grid-cols-2 flex">
          <div className="p-4 flex justify-center md:justify-end relative">
            <div className="flex">
              <div className="absolute opacity-90 m-4">
                <button
                  onClick={connectWallet}
                  className="solidity bg-gray-100 text-xs p-2 text-gray-700 text-xs font-medium"
                >
                  {printCount} / {choco.supplyLimit}
                </button>
              </div>
              <img
                className="object-contain max-h-96 max-w-sm olidity"
                src={choco.metadata.image}
              />
            </div>
          </div>
          <div className="p-4 w-full md:w-7/12 flex justify-start flex-col">
            <button className="w-40 bg-white text-gray-700 text-xs font-medium rounded-full shadow-md p-2 mb-2">
              <span className="pr-2">👩‍🎨</span>
              {shortenAddress(choco.creatorAddress)}
            </button>
            <p className="break-all text-gray-700 text-5xl sm:text-7xl font-medium mb-2">
              {shortenName(choco.metadata.name)}
            </p>
            <p className="break-all text-gray-400 text-xs font-medium mb-4">
              {choco.metadata.description}
            </p>
            <div className="grid grid-cols-2 mb-4">
              <div>
                <p className="text-lg text-gray-500 font-medium">Print Price</p>
                <p className="text-2xl sm:text-3xl text-gray-700 font-medium">0.01 ETH</p>
              </div>
              <div>
                <p className="text-lg text-gray-500 font-medium">Royality</p>
                <p className="text-2xl sm:text-3xl text-gray-700 font-medium">10%</p>
              </div>
            </div>
            <div className="mb-8">
              <p className="text-gray-500 text-xs font-medium">Slippage Settings</p>
              <div className="flex">
                {slippageList.map((_slippage, i) => {
                  return (
                    <div key={i}>
                      <button
                        className={`cursor-pointer text-xs text-gray-500 focus:outline-none focus:bg-gray-200 hover:bg-gray-100 py-1 px-2 font-medium rounded-md ${
                          slippage === _slippage ? "bg-gray-200" : ""
                        }`}
                        onClick={() => setSlippage(_slippage)}
                      >
                        {_slippage}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              {!selectedAddress ? (
                <Button onClick={connectWallet} type="primary">
                  Connect <span className="ml-1">🔐</span>
                </Button>
              ) : (
                <div className="grid grid-cols-2">
                  {printPrice && (
                    <Button onClick={print} type="secondary">
                      Mint
                      <span className="ml-1">💎</span>
                    </Button>
                  )}
                  {burnPrice && (
                    <Button onClick={burn} type="tertiary">
                      Burn
                      <span className="ml-1">🔥</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {modal && <Modal {...modal} onClickDismiss={closeModal} />}
    </Body>
  );
};

export default NFT;
