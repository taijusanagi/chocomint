import React from "react";
import { useParams } from "react-router-dom";

import { firestore, collectionName } from "../modules/firebase";
import {
  ipfsHashToIpfsUrl,
  verifyMetadata,
  chocomintRegistryContract,
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
  }, []);

  const openDescription = (desc: string) => {
    const messageText = desc ? desc : "This NFT does not have description.";
    openModal("📝", messageText);
  };

  const publish = async () => {
    if (!choco) {
      return;
    }
    const signer = await getEthersSigner();
    const signerNetwork = await signer.provider.getNetwork();
    // const signer.

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
            <div className="flex flex-col items-center mx-auto bg-gradient-to-r from-green-100 via-blue-100 to-green-100 p-8">
              <div className="w-60">
                <img
                  className="rounded-xl border-b-2 border-gray-400 shadow-md"
                  src={choco.metadata.image}
                />
                <div className="pt-8 px-8">
                  <Button type="tertiary" onClick={() => openDescription(choco.metadata.name)}>
                    {choco.metadata.name}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Container>
            <div className="p-8">
              <Button onClick={publish} type="primary">
                Publish
              </Button>
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
