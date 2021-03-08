import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";

import { ethers } from "ethers";

import { firestore, collectionName } from "../modules/firebase";
import {
  ipfsHashToIpfsUrl,
  verifyMetadata,
  chocomintRegistryContract,
  chocomintPrintContract,
  getEthersSigner,
  chainId,
  networkName,
  selectedAddressState,
  initializeWeb3Modal,
  explore,
} from "../modules/web3";

import { Body } from "../components/atoms/Body";
import { Button } from "../components/atoms/Button";
import { Container } from "../components/atoms/Container";
import { Modal, useModal } from "../components/molecules/Modal";
import { Footer } from "../components/organisms/Footer";
import { Header } from "../components/organisms/Header";

import { Choco } from "../types";

export const NFT: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [choco, setChoco] = React.useState<Choco | undefined>(undefined);
  const [ipfsUrl, setIpfsUrl] = React.useState("");
  const { modal, openModal, closeModal } = useModal();

  const [published, setPublished] = React.useState(false);
  const [genesisRoyalityPool, setRoyalityPool] = React.useState("");
  const [creatorRoyalityPool, setCreatorRoyalityPool] = React.useState("");
  const [publisherRoyalityPool, setPublisherRoyalityPool] = React.useState("");
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
          openModal("😲", "It seems you're searching non existing NFT.", "Home", "/", false);
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
      });
    chocomintRegistryContract.ipfsHashes(hash).then((ipfsHash: string) => {
      const published =
        ipfsHash != "0x0000000000000000000000000000000000000000000000000000000000000000";
      setPublished(published);
      if (!published) {
        return;
      }
      chocomintPrintContract.totalSupply(hash).then((printCountBN) => {
        const printCount = parseInt(printCountBN.toString());
        setPrintCount(printCount);
        chocomintPrintContract.getPrintPrice(printCount + 1).then((printPriceBN) => {
          setPrintPrice(printPriceBN);
        });
        chocomintPrintContract.getPrintPrice(printCount).then((burnPriceBN) => {
          setBurnPrice(burnPriceBN);
        });
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

  const publish = async () => {
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
      const { hash: tx } = await chocomintRegistryContract
        .connect(signer)
        .publish(choco.ipfsHash, choco.creator, choco.signature);
      openModal("🎉", "Transaction is send to blockchain.", "Check", `${explore}${tx}`, true);
    } catch (err) {
      openModal("🙇‍♂️", err.message);
    }
  };

  const print = async () => {
    if (!choco || !printPrice) {
      return;
    }
    try {
      const signer = await getEthersSigner();
      const signerNetwork = await signer.provider.getNetwork();
      if (signerNetwork.chainId != chainId) {
        openModal("😲", `Wrong network detected, please connect to ${networkName}.`);
        return;
      }
      const { hash: tx } = await chocomintPrintContract
        .connect(signer)
        .mintPrint(hash, { value: printPrice });
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
      const { hash: tx } = await chocomintPrintContract.connect(signer).burnPrint(hash, 0);
      openModal("🎉", "Transaction is send to blockchain.", "Check", `${explore}${tx}`, true);
    } catch (err) {
      openModal("🙇‍♂️", err.message);
    }
  };

  return (
    <Body>
      <Header />
      {choco && (
        <>
          <div className="w-full">
            <div className="flex flex-col items-center mx-auto bg-gradient-to-r from-green-100 via-blue-100 to-green-100 p-8">
              <img
                onClick={() => openDescription(choco.metadata.name)}
                className="max-w-96 max-h-80 cursor-pointer transition duration-500 transform hover:-translate-y-1 rounded-xl border-b-2 border-gray-400 shadow-md"
                src={choco.metadata.image}
              />
            </div>
          </div>
          <Container>
            <div className="w-80">
              <div className="mt-6 space-y-6">
                <p className="text-center text-sm text-gray-600 font-medium">{printCount} Prints</p>
                {!selectedAddress ? (
                  <Button onClick={connectWallet} type="primary">
                    Connect <span className="ml-1">🔐</span>
                  </Button>
                ) : (
                  <>
                    {!printPrice || !burnPrice ? (
                      <Button onClick={publish} type="primary">
                        Mint Publisher NFT <span className="ml-1">💎</span>
                      </Button>
                    ) : (
                      <>
                        <Button onClick={print} type="primary">
                          Mint Print
                          <span className="ml-1">Ξ {ethers.utils.formatEther(printPrice)} </span>
                          <span className="ml-1">💎</span>
                        </Button>
                        <Button onClick={burn} type="tertiary">
                          Burn Print
                          <span className="ml-1">Ξ {ethers.utils.formatEther(burnPrice)} </span>
                          <span className="ml-1">🔥</span>
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </Container>
        </>
      )}
      {modal && <Modal {...modal} onClickDismiss={closeModal} />}

      <Footer />
    </Body>
  );
};

export default NFT;