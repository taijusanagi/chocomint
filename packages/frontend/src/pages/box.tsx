import React from "react";
import { useHistory } from "react-router-dom";

import { Choco } from "../types";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";

import { firestore, collectionName } from "../modules/firebase";
import { chocomintPublisherContract, selectedAddressState } from "../modules/web3";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";

import { Body } from "../components/atoms/Body";

import { ChocoList } from "../components/molecules/ChocoList";

import { Header } from "../components/organisms/Header";

export const Box: React.FC = () => {
  const history = useHistory();
  const { address } = useParams<{ address: string }>();
  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);
  const [chocos, setChocos] = React.useState<Choco[] | undefined>(undefined);
  const [prices, setPrices] = React.useState<any>(undefined);

  console.log(address);

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
      <div className="flex flex-col items-center mx-auto bg-gray-100 text-gray-600 solidity p-4">
        <img className=" mx-auto h-12 w-auto mb-4" src="/emoji.png" alt="logo" />
        <p className="text-xs font-medium text-gray-600 font-medium mb-4">{address}</p>
        <a
          target="_blank"
          rel="noreferrer"
          href="http://twitter.com/share?text=text goes here&url=http://url goes here&hashtags=hashtag1,hashtag2,hashtag3"
        >
          <span className="rounded-full bg-gray-100 font-medium p-1 shadow-md">
            <FontAwesomeIcon className="text-blue-400" icon={faTwitter} />
          </span>
        </a>
      </div>
      <h3 className="text-center text-2xl text-gray-600 font-bold p-12">Newly Created NFTs</h3>
      <div className="container px-8 mx-auto max-w-5xl">
        {chocos ? <ChocoList chocos={chocos} prices={prices}></ChocoList> : <></>}
      </div>
    </Body>
  );
};

export default Box;
