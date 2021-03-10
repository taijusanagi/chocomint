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
            chocomintPublisherContract
              .calculatePrintPrice(choco?.virtualReserve, choco?.virtualSupply, choco.crr)
              .then((printPriceBN) => {
                setPrintPrice(printPriceBN);
              });
          } else {
            chocomintPublisherContract.getPrintPrice(hash).then((printPriceBN) => {
              setPrintPrice(printPriceBN);
            });
            chocomintPublisherContract.getBurnPrice(hash).then((burnPriceBN) => {
              setBurnPrice(burnPriceBN);
            });
          }
        });
      });
  }, []);

  const openDescription = (desc: string) => {
    const messageText = desc ? desc : "This NFT does not have description.";
    openModal("📝", messageText);
  };

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
          choco.ipfsHash,
          choco.creatorAddress,
          choco.supplyLimit,
          choco.virtualSupply,
          choco.virtualReserve,
          choco.crr,
          choco.royalityRatio,
          choco.signature,
          { value: printPrice }
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
      <div className="flex flex-col">
        {choco && (
          <div className="px-6 sm:px-0 mb-6">
            <div className="flex flex-wrap justify-center pt-6 sm:pt-28">
              <a className="mb-4" onClick={() => openDescription(choco.metadata.description)}>
                <img
                  className="solidity max-h-96 sm:min-w-5xl sm:mr-24"
                  src={choco.metadata.image}
                />
              </a>
              <div className="sm:w-72 px-2 sm:px-0">
                <div className="flex my-4 mb-8">
                  <Link to={`/box/${selectedAddress}`}>
                    <button className="w-44 bg-white text-black font-medium rounded-full shadow-md mr-2 sm:mr-3 p-2">
                      👩‍🎨
                      <span className="pl-3">{shortenAddress(choco.creatorAddress)}</span>
                    </button>
                  </Link>
                  <button className="w-full bg-green-400 text-white font-medium rounded-full shadow-md p-2">
                    {printCount} / {choco.supplyLimit}
                  </button>
                </div>
                <div className="sm:w-96">
                  <p className="break-all text-black text-5xl sm:text-7xl font-semibold px-2 sm:px-0 mb-5">
                    {shortenName(choco.metadata.name)}
                  </p>
                  <div className="grid grid-cols-2 gap-5 m-2">
                    <div>
                      {printPrice ? (
                        <>
                          <p className="text-lg text-gray-600 font-medium px-2 mb-1">Print Price</p>
                          <p className="text-2xl sm:text-3xl text-gray-800 font-medium px-2 mb-7">
                            {roundAndFormatPrintPrice(printPrice, 3)} ETH
                          </p>
                        </>
                      ) : burnPrice ? (
                        <>
                          <p className="text-lg text-gray-600 font-medium px-2 mb-1">Burn Price</p>
                          <p className="text-2xl sm:text-3xl text-gray-800 font-medium px-2 mb-7">
                            {roundAndFormatBurnPrice(burnPrice, 3)} ETH
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg text-gray-600 font-medium px-2 mb-1">Price</p>
                          <p className="text-2xl sm:text-3xl text-gray-800 font-medium px-2 mb-7">
                            Not privce
                          </p>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="text-lg text-gray-600 font-medium px-2 mb-1">Roylatity Ratio</p>
                      <p className="text-2xl sm:text-3xl text-gray-800 font-medium px-2 mb-7">
                        50%
                        {/* 仮 */}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5 mb-5">
                    {!selectedAddress ? (
                      <Button onClick={connectWallet} type="primary">
                        Connect <span className="ml-1">🔐</span>
                      </Button>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* <div>他のアセットへの繋ぎのリスト</div> */}
      </div>
      {modal && <Modal {...modal} onClickDismiss={closeModal} />}
    </Body>
  );
};

export default NFT;
