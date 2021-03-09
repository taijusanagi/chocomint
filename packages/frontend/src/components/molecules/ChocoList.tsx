import React from "react";

import { Choco } from "../../types";
import "./ChocoList.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import { roundAndFormatPrintPrice } from "../../modules/web3";

export interface ChocoListProps {
  chocos: Choco[];
  prices?: string[];
}

export const ChocoList: React.FC<ChocoListProps> = ({ chocos, prices }) => {
  return (
    <section>
      <ul className="grid grid-cols-2 md:grid-cols-5 gap-1">
        {chocos.map((choco, i) => {
          return (
            <li key={i} className="chocolist-container grab-animation">
              <div className="chocolist-dummy"></div>
              <div className="relative chocolist-element">
                <img
                  className="absolute h-full w-full object-cover solidity"
                  src={choco.metadata.image}
                />

                <div className="absolute z-50 top-0 right-0 p-2 m-1 bg-gray-100 text-gray-600 font-bold rounded-full solidity text-xs opacity-75">
                  {prices ? (
                    <>{roundAndFormatPrintPrice(prices[i], 2)} ETH</>
                  ) : (
                    <>
                      sync
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin ml-1" />
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
