import React from "react";
import { useParams } from "react-router-dom";

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
      });
    });
  }, []);

  const openDescription = (desc: string) => {
    const messageText = desc ? desc : "This NFT does not have description.";
    openModal("📝", messageText);
  };

  const openRoyality = () => {
    openModal("📝", "royality");
  };

  const publish = async () => {
    if (!choco) {
      return;
    }
    const signer = await getEthersSigner();
    const signerNetwork = await signer.provider.getNetwork();
    if (signerNetwork.chainId != chainId) {
      openModal("😲", `Wrong network detected, please connect to ${networkName}.`);
      return;
    }
    await chocomintRegistryContract
      .connect(signer)
      .publish(choco.ipfsHash, choco.creator, choco.signature);
  };

  return (
    <Body>
      <Header />
      {choco && (
        <>
          <div className="w-full">
            <div className="flex flex-col items-center mx-auto bg-gradient-to-r from-green-100 via-blue-100 to-green-100 p-12">
              <div className="w-60">
                <img
                  onClick={() => openDescription(choco.metadata.name)}
                  className="cursor-pointer transition duration-500 transform hover:-translate-y-1 rounded-xl border-b-2 border-gray-400 shadow-md"
                  src={choco.metadata.image}
                />
              </div>
            </div>
          </div>
          <Container>
            <div className="py-6 space-y-4">
              {!published ? (
                <>
                  <Button onClick={publish} type="primary">
                    Publish NFT
                  </Button>
                </>
              ) : (
                <>
                  {printPrice && (
                    <>
                      <p>Printed {printCount}</p>
                      <Button onClick={publish} type="primary">
                        Buy Print{" "}
                        <span className="ml-2">Ξ {ethers.utils.formatEther(printPrice)} </span>
                      </Button>
                      <Button onClick={openRoyality} type="tertiary">
                        Royality
                      </Button>
                    </>
                  )}
                </>
              )}
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
