import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import {
  ipfsHttpsBaseUrl,
  ChainIdType,
  getChainIds,
  getContract,
  getNetworkConfig,
  nullAddress,
} from "../modules/web3";

export const Gallery: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();

  const getTokensMetadata = async () => {
    const chainIds = getChainIds();
    const eventPromises = [];
    const contracts: any = [];
    for (const chainId of chainIds) {
      const { contractAddress } = getNetworkConfig(chainId);
      const contract = getContract(contractAddress, chainId);
      const filter = contract.filters.Transfer(nullAddress, walletAddress);
      eventPromises.push(contract.queryFilter(filter, 0, "latest"));
      contracts.push(contract);
    }

    const allChainEvents = await Promise.all(eventPromises);
    allChainEvents.forEach((chainEvents, i) => {
      chainEvents.forEach((event, j) => {
        const { args } = event;
        const { tokenId } = args as any;
        contracts[i]
          .tokenURI(tokenId)
          .then((tokenURL: string) => console.log(tokenURL));
      });
    });
  };

  React.useEffect(() => {
    getTokensMetadata();
    // contract
    //   .tokenURI(tokenId)
    //   .then((tokenUri: string) => {
    //     const calculatedCid = tokenUri.split("://")[1];
    //     setBlockchainVerified(cid === calculatedCid);
    //   })
    //   .catch((_err: Error) => console.log("NFT did not minted"));
  }, []);

  return <div></div>;
};

export default Gallery;
