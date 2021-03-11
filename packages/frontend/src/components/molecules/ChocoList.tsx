import React from "react";
import { Link } from "react-router-dom";

import { Choco } from "../../types";
import "./ChocoList.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import { roundAndFormatPrintPrice, chocomintPublisherContract, getPrice } from "../../modules/web3";

export interface ChocoListProps {
  chocos: Choco[];
  prices?: any;
}

export const ChocoList: React.FC<ChocoListProps> = ({ chocos, prices }) => {
  const [supplies, setSupplies] = React.useState<any>(undefined);
  const [reserves, setReserves] = React.useState<any>(undefined);

  const getCurrentPrice = (chocoId: string, initialPrice: string, diluter: number, crr: number) => {
    if (!supplies || !reserves) {
      return;
    }
    const supply = supplies[chocoId];
    if (supply > 0) {
      const reserve = reserves[chocoId];
      return getPrice(supply, reserve, initialPrice, diluter, crr);
    } else {
      return initialPrice;
    }
  };

  React.useEffect(() => {
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
      // get total supplies
      const totalSupplies = {} as any;
      const totalReserves = {} as any;
      events.forEach((event) => {
        totalReserves[event.args!.tokenId.toHexString()] = event.args!.currentReserve.toString();
        totalSupplies[event.args!.tokenId.toHexString()] = event.args!.currentSupply.toString();
      });
      setSupplies(totalSupplies);
      setReserves(totalReserves);
    });
  }, []);

  return (
    <section>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 font-way">
        {chocos.map((choco, i) => {
          return (
            <Link key={i} to={`/nft/${choco.chocoId}`}>
              <li className="chocolist-container grab-animation">
                <div className="chocolist-dummy"></div>
                <div className="chocolist-element">
                  <img
                    className="absolute h-full w-full object-cover solidity"
                    src={choco.metadata.image}
                  />
                  <div className="absolute z-50 top-0 right-0 p-2 m-1 bg-gray-100 text-gray-600 font-bold rounded-full solidity text-xs opacity-75">
                    {getCurrentPrice(
                      choco.chocoId,
                      choco.initialPrice,
                      choco.diluter,
                      choco.crr
                    ) ? (
                      <>
                        {roundAndFormatPrintPrice(
                          getCurrentPrice(
                            choco.chocoId,
                            choco.initialPrice,
                            choco.diluter,
                            choco.crr
                          ) as string,
                          3
                        )}
                      </>
                    ) : (
                      <>
                        sync
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin ml-1" />
                      </>
                    )}
                    ETH
                  </div>
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
    </section>
  );
};
