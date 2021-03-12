import React from "react";
import { ethers } from "ethers";

import { Choco } from "../types";
import { useParams } from "react-router-dom";

import { firestore, collectionName } from "../modules/firebase";
import { chocopoundContract } from "../modules/web3";
import { middlenAddress } from "../modules/util";

import { Body } from "../components/atoms/Body";
import { ChocoList } from "../components/molecules/ChocoList";
import { Shares } from "../components/molecules/Shares";
import { Header } from "../components/organisms/Header";
import { Footer } from "../components/organisms/Footer";
export const Creator: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [chocos, setChocos] = React.useState<Choco[] | undefined>(undefined);
  const [prices, setPrices] = React.useState<any>(undefined);

  React.useEffect(() => {
    const chocos: Choco[] = [];

    firestore
      .collection(collectionName)
      .orderBy("createdAt", "desc")
      .where("creatorAddress", "==", ethers.utils.getAddress(address))
      .limit(32)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          chocos.push(doc.data() as Choco);
        });
        setChocos(chocos);
      });
  }, []);

  return (
    <Body>
      <Header />
      <h3 className="text-center text-2xl text-gray-600 font-bold mb-2">Created By</h3>
      <button className="cursor-default focus:outline-none mx-auto w-60 bg-white text-gray-700 text-xs font-medium rounded-full shadow-md p-2 mb-6">
        <span className="pr-2">👩‍🎨</span>
        {middlenAddress(address)}
      </button>
      <div className="text-center mb-6">
        <Shares />
      </div>
      <div className="container px-2 mx-auto max-w-5xl">
        {chocos ? <ChocoList chocos={chocos}></ChocoList> : <></>}
      </div>
      <Footer />
    </Body>
  );
};

export default Creator;
