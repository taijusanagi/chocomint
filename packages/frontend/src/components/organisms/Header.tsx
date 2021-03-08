import React from "react";
import { Link } from "react-router-dom";

import { useRecoilState } from "recoil";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

import {
  initializeWeb3Modal,
  clearWeb3Modal,
  web3Modal,
  selectedAddressState,
} from "../../modules/web3";
import { Button } from "../atoms/Button";

export const Header: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);

  const connectWallet = async () => {
    const provider = await initializeWeb3Modal();
    setSelectedAddress(provider.selectedAddress);
  };

  const disconnetWallet = async () => {
    await clearWeb3Modal();
    setSelectedAddress("");
  };

  const shortenAddress = (address: string) => {
    const pre = address.substring(0, 5);
    const post = address.substring(38);
    return `${pre}...${post}`;
  };

  React.useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  return (
    <header>
      <div className="relative h-16 mb-2">
        <Link to="/">
          <div className="px-4 py-6 absolute left-0 font-bold">Chocomint 🌱</div>
        </Link>
        <div className="p-4 absolute right-0">
          {!selectedAddress ? (
            <Button onClick={connectWallet} type="tertiary">
              Connect<span className="ml-2">🔐</span>
            </Button>
          ) : (
            <Button onClick={disconnetWallet} type="tertiary">
              {shortenAddress(selectedAddress)}
              <FontAwesomeIcon className="ml-2 text-xs" color="gray" icon={faSignOutAlt} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
