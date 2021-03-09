import React from "react";
import { useParams } from "react-router-dom";
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
import { Container } from "../components/atoms/Container";
import { Hero } from "../components/molecules/Hero";
import { Modal, useModal } from "../components/molecules/Modal";
import { Footer } from "../components/organisms/Footer";
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
      {choco && (
        <>
          <Hero src={choco.metadata.image} onClick={() => openDescription(choco.metadata.name)} />
          <Container>
            <div className="w-80">
              <div className="mt-6 space-y-6">
                <p className="text-center text-sm text-gray-600 font-medium">
                  {printCount} / {choco.supplyLimit} Printed
                </p>
                {!selectedAddress ? (
                  <Button onClick={connectWallet} type="primary">
                    Connect <span className="ml-1">🔐</span>
                  </Button>
                ) : (
                  <>
                    {printPrice && (
                      <Button onClick={print} type="primary">
                        Mint Print
                        <span className="ml-1">Ξ {roundAndFormatPrintPrice(printPrice)} </span>
                        <span className="ml-1">💎</span>
                      </Button>
                    )}
                    {burnPrice && (
                      <Button onClick={burn} type="tertiary">
                        Burn Print
                        <span className="ml-1">Ξ {roundAndFormatBurnPrice(burnPrice)} </span>
                        <span className="ml-1">🔥</span>
                      </Button>
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
