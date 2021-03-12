import React from "react";

import { Choco } from "../types";
import { firestore, collectionName } from "../modules/firebase";

import { getAtokenWithBalance, roundAndFormatPrintPrice } from "../modules/web3";
import { Body } from "../components/atoms/Body";
import { ChocoList } from "../components/molecules/ChocoList";
import { Hero } from "../components/molecules/Hero";
import { Header } from "../components/organisms/Header";
import { Footer } from "../components/organisms/Footer";
export const Home: React.FC = () => {
  const [createdChocos, setCreatedChocos] = React.useState<Choco[] | undefined>(undefined);
  const [aTokens, setAtokens] = React.useState<any>(undefined);
  React.useEffect(() => {
    const createdChocos: Choco[] = [];
    firestore
      .collection(collectionName)
      .orderBy("createdAt", "desc")
      .limit(9)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          createdChocos.push(doc.data() as Choco);
        });
        console.log(createdChocos);
        if (createdChocos.length > 0) {
          setCreatedChocos(createdChocos);
        }
      });

    getAtokenWithBalance().then((aTokens) => setAtokens(aTokens));
  }, []);

  return (
    <Body>
      <Header />
      <Hero src="/hero.png" />
      {createdChocos && (
        <>
          <h3 className="text-center text-2xl text-gray-600 font-bold font-way p-12">
            New Chocos!
          </h3>
          <div className="container px-2 mx-auto max-w-5xl">
            <ChocoList chocos={createdChocos}></ChocoList>
          </div>
        </>
      )}
      {aTokens && (
        <>
          <h3 className="text-center text-2xl text-gray-600 font-bold mt-12 mb-2">Choco Pound</h3>
          <h3 className="text-center text-xs text-gray-400 font-medium mb-4">
            Bancor Reservation is Lended to Aave for APY!
          </h3>
          <ul className="flex flex-col text-center space-y-4 m-4">
            {aTokens.map((atoken: any, i: number) => {
              return atoken.depositted > 0 ? (
                <li
                  key={i}
                  className="flex mx-auto items-center border border-gray-200 p-4 max-w-xl  w-full"
                >
                  <img className="w-10 h-10" src={`/coins/${atoken.symbol}.svg`} />
                  <p className="p-2 text-sm font-bold">{atoken.symbol}</p>
                  <p className="p-2 text-sm font-bold text-gray-600 text-right flex-auto">
                    {roundAndFormatPrintPrice(atoken.depositted, 3)} {atoken.symbol}
                  </p>
                </li>
              ) : (
                <></>
              );
            })}
          </ul>
        </>
      )}
      <Footer />
    </Body>
  );
};

export default Home;
