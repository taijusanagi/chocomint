import React from "react";
import { Link } from "react-router-dom";

import { Choco } from "../../types";
import "./ChocoList.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import { roundAndFormatPrintPrice } from "../../modules/web3";

export interface ChocoListProps {
  chocos: Choco[];
  prices?: any;
}

export const ChocoList: React.FC<ChocoListProps> = ({ chocos, prices }) => {
  console.log("prices", prices);
  return (
    <section>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                    {prices && prices[choco.chocoId] ? (
                      <>{roundAndFormatPrintPrice(prices[choco.chocoId], 2)} ETH</>
                    ) : (
                      <>
                        sync
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin ml-1" />
                      </>
                    )}
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
