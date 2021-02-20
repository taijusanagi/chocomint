import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
const ipfsHash = require("ipfs-only-hash");

import { ipfsBaseUrl, getEthersSigner, getContract } from "../modules/web3";

export const Asset: React.FC = () => {
  const { cid } = useParams<{ cid: string }>();
  const [choco, setChoco] = React.useState<any>({});
  const [ipfsVerified, setIpfsVerified] = React.useState(false);
  const [blockchainVerified, setBlockchainVerified] = React.useState(false);

  React.useEffect(() => {
    axios.get(`${ipfsBaseUrl}${cid}`).then(({ data }) => {
      setChoco(data);
      ipfsHash
        .of(Buffer.from(JSON.stringify(data)))
        .then((calculatedCid: string) =>
          setIpfsVerified(cid === calculatedCid)
        );
      const { tokenId, contractAddress, chainId } = data;
      console.log(tokenId, contractAddress, chainId);
      const contract = getContract(contractAddress, chainId);
      contract
        .tokenURI(tokenId)
        .then((data: string) => {
          console.log(data);
          setBlockchainVerified(cid === data.split("//")[1]);
        })
        .catch((_err: Error) => console.log("NFT did not minted"));
    });
  }, []);

  const mintNft = async () => {
    const signer = await getEthersSigner();
    const contract = getContract(choco.contractAddress).connect(signer);
    const { hash } = await contract.mint(
      [
        choco.name,
        choco.description,
        choco.image,
        choco.animation_url,
        choco.initial_price,
        choco.fees,
        choco.recipients,
        choco.iss,
        choco.sub,
        choco.root,
        choco.proof,
        choco.signature,
      ],
      { value: choco.initial_price }
    );
    console.log(hash);
  };

  return (
    <div>
      <img src={choco.image} />
      <p>{choco.network}</p>
      <p>{choco.name}</p>
      <p>{choco.description}</p>
      <p>{choco.chainId}</p>
      <p>{choco.address}</p>
      <p>{choco.iss}</p>
      <p>{choco.initialPrice}</p>
      <p>ipfsVerified: {ipfsVerified.toString()}</p>
      <p>blockchainVerified: {blockchainVerified.toString()}</p>
      {!blockchainVerified && <button onClick={mintNft}>Mint</button>}
    </div>
  );
};

export default Asset;
