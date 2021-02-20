import React from "react";

import { signer } from "../modules/web3";

export const Header: React.FC = () => {
  const [did, setDid] = React.useState("");

  const connectWallet = () => {
    signer.init().then(({ did }) => {
      setDid(did);
    });
  };
  return (
    <div>
      {!did ? (
        <button id="connectWallet" onClick={connectWallet}>
          Connect Web3
        </button>
      ) : (
        <p>{did}</p>
      )}
    </div>
  );
};

export default Header;
