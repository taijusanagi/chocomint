import React from "react";

import { Choco } from "../types";
import { firestore, collectionName } from "../modules/firebase";
import { Body } from "../components/atoms/Body";
import { ChocoList } from "../components/molecules/ChocoList";
import { Hero } from "../components/molecules/Hero";
import { Header } from "../components/organisms/Header";

export const Home: React.FC = () => {
  const [chocos, setChocos] = React.useState<Choco[] | undefined>(undefined);

  React.useEffect(() => {
    const chocos: Choco[] = [];
    firestore
      .collection(collectionName)
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
      <Hero src="/hero.png" />
      <h3 className="text-center text-2xl text-gray-600 font-bold p-12">Newly Created</h3>
      <div className="container px-2 mx-auto max-w-5xl">
        {chocos ? <ChocoList chocos={chocos}></ChocoList> : <></>}
      </div>
    </Body>
  );
};

export default Home;
