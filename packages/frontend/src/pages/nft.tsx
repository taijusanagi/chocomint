import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
const ipfsHash = require("ipfs-only-hash");

import { ipfsHttpsBaseUrl, getContract } from "../modules/web3";

export const Asset: React.FC = () => {
  const { cid } = useParams<{ cid: string }>();
  const [choco, setChoco] = React.useState<any>({});
  const [ipfsVerified, setIpfsVerified] = React.useState(false);
  const [blockchainVerified, setBlockchainVerified] = React.useState(false);

  const convertIpfsToHttps = (ipfs: string) => {
    const cid = ipfs.split("://")[1];
    const httpsUrl = `${ipfsHttpsBaseUrl}${cid}`;
    return httpsUrl;
  };

  React.useEffect(() => {
    axios.get(`${ipfsHttpsBaseUrl}${cid}`).then(({ data }) => {
      setChoco(data);
      ipfsHash
        .of(Buffer.from(JSON.stringify(data)))
        .then((calculatedCid: string) => {
          setIpfsVerified(cid === calculatedCid);
        });
      const { tokenId, contractAddress, chainId } = data;
      const contract = getContract(contractAddress, chainId);
      contract
        .tokenURI(tokenId)
        .then((tokenUri: string) => {
          const calculatedCid = tokenUri.split("://")[1];
          setBlockchainVerified(cid === calculatedCid);
        })
        .catch((_err: Error) => console.log("NFT did not minted"));
    });
  }, []);

  return (
    <div>
      {choco.image && (
        <>
          <img src={convertIpfsToHttps(choco.image)} />
          <p>{choco.chainId}</p>
          <p>{choco.name}</p>
          <p>{choco.chainId}</p>
          <p>{choco.address}</p>
          <p>{choco.iss}</p>
          <p>{ipfsVerified && "ipfs verified"}</p>
          <p>{blockchainVerified && "blockchain verified"}</p>
        </>
      )}
    </div>
  );
};

export default Asset;
