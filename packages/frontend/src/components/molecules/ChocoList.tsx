import React from "react";

import { Choco } from "../../types";
import "./ChocoList.scss";

export interface ChocoListProps {
  chocos: Choco[];
}

export const ChocoList: React.FC<ChocoListProps> = ({ chocos }) => {
  return (
    <section>
      <ul className="grid grid-cols-3 md:grid-cols-5 gap-1">
        {chocos.map((choco, i) => {
          return (
            <li key={i} className="chocolist-container">
              <div className="chocolist-dummy"></div>
              <div className="chocolist-element">
                <img
                  className="cursor-pointer transition duration-500 transform hover:-translate-y-1 object-cover h-full w-full rounded-xl object-cover border-b-2 border-gray-200 shadow-md"
                  src={choco.metadata.image}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
