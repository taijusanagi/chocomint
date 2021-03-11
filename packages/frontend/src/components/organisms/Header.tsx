import React from "react";
import { Link } from "react-router-dom";

import { useRecoilState } from "recoil";

import { initializeWeb3Modal, web3Modal, selectedAddressState } from "../../modules/web3";

import { shortenAddress } from "../../modules/util";
import { Button } from "../atoms/Button";

export const Header: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);

  const connectWallet = async () => {
    const provider = await initializeWeb3Modal();
    setSelectedAddress(provider.selectedAddress);
  };

  React.useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  return (
    <header>
      <div className="relative h-24 font-way">
        <Link to="/">
          <div className="px-4 py-8 absolute left-0 font-bold">Chocomint 🌱</div>
        </Link>
        <div className="p-4 absolute right-0">
          {!selectedAddress ? (
            <Button onClick={connectWallet} type="tertiary">
              Connect<span className="ml-1">🔌</span>
            </Button>
          ) : (
            <Link to={`/creator/${selectedAddress}`}>
              <Button type="tertiary">
                <span className="mr-1">👩‍🎨</span>
                {shortenAddress(selectedAddress)}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
