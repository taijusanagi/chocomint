import React from "react";
import { Link, useParams } from "react-router-dom";

import { useRecoilState } from "recoil";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import {
  initializeWeb3Modal,
  clearWeb3Modal,
  web3Modal,
  selectedAddressState,
} from "../../modules/web3";
import { Button } from "../atoms/Button";

export const Header: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useRecoilState(selectedAddressState);
  const { address } = useParams<{ address: string }>();

  const connectWallet = async () => {
    const provider = await initializeWeb3Modal();
    setSelectedAddress(provider.selectedAddress);
  };

  const disconnetWallet = async () => {
    await clearWeb3Modal();
    setSelectedAddress("");
  };

  const shortenAddress = (rawAddress: string) => {
    const pre = rawAddress.substring(0, 5);
    const post = rawAddress.substring(38);
    return `${pre}...${post}`;
  };

  React.useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  return (
    <header>
      <div className="relative h-24">
        <Link to="/">
          <div className="px-4 py-8 absolute left-0 font-bold">Chocomint 🌱</div>
        </Link>
        <div className="p-4 absolute right-0">
          {!selectedAddress ? (
            <Button onClick={connectWallet} type="tertiary">
              Connect<span className="ml-1">🔐</span>
            </Button>
          ) : (
            <Link to={`/box/${selectedAddress}`}>
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
