import React from "react";
import { useHistory } from "react-router-dom";

import { Choco } from "../types";

import { firestore, collectionName } from "../modules/firebase";
import { chocomintPublisherContract } from "../modules/web3";

import { Body } from "../components/atoms/Body";

import { ChocoList } from "../components/molecules/ChocoList";
import { Hero } from "../components/molecules/Hero";

import { Header } from "../components/organisms/Header";

export const Home: React.FC = () => {
  const history = useHistory();
  const [chocos, setChocos] = React.useState<Choco[] | undefined>(undefined);
  const [prices, setPrices] = React.useState<any>(undefined);

  const onClockHero = () => {
    history.push("/create");
  };

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
    const MintEvent = chocomintPublisherContract.filters.PrintMinted(
      null,
      null,
      null,
      null,
      null,
      null
    );
    const BurnEvent = chocomintPublisherContract.filters.PrintBurned(null, null, null, null, null);
    Promise.all([
      chocomintPublisherContract.queryFilter(MintEvent, 0, "latest"),
      chocomintPublisherContract.queryFilter(BurnEvent, 0, "latest"),
    ]).then((resolved) => {
      const events = resolved[0].concat(resolved[1]);
      events.sort((a, b) => (a.blockNumber > b.blockNumber ? 1 : -1));
      console.log(events);
      const prices = {} as any;
      events.forEach((event) => {
        console.log(event.args!.nextPrintPrice.toString());
        prices[event.args!.tokenId.toHexString()] = event.args!.nextPrintPrice.toString();
      });
      setPrices(prices);
    });
  }, []);

  return (
    <Body>
      <Header />
      <Hero src="/ogp.png" onClick={onClockHero} />
      <h3 className="text-center text-2xl text-gray-600 font-bold p-12">Newly Created NFTs</h3>
      <div className="container px-8 mx-auto max-w-5xl">
        {chocos ? <ChocoList chocos={chocos} prices={prices}></ChocoList> : <></>}
      </div>
    </Body>
  );
};

export default Home;
