import React from "react";
import { useParams } from "react-router-dom";

import { firestore, collectionName } from "../modules/firebase";

import { Body } from "../components/atoms/Body";
import { Container } from "../components/atoms/Container";
import { Modal, useModal } from "../components/molecules/Modal";
import { Footer } from "../components/organisms/Footer";
import { Header } from "../components/organisms/Header";

interface Metadata {
  name: string;
  description: string;
  image: string;
}

interface Choco {
  chainId: number;
  registry: string;
  ipfsHash: string;
  creator: string;
  signature: string;
  metadata: Metadata;
}

export const NFT: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [choco, setChoco] = React.useState<Choco | undefined>(undefined);
  const { modal, openModal, closeModal } = useModal();

  React.useEffect(() => {
    firestore
      .collection(collectionName)
      .doc(hash)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setChoco(doc.data() as Choco);
        } else {
          openModal("🤦‍♂️ NFT not exist", `/`, "Back", false);
        }
      });
  }, []);

  return (
    <Body>
      <Header />
      <Container>
        <div className="w-full sm:max-w-md p-4">{choco && choco.metadata.name}</div>
      </Container>
      {modal && <Modal {...modal} onClickDismiss={closeModal} />}
      <Footer />
    </Body>
  );
};

export default NFT;
