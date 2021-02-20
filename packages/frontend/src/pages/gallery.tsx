import React from "react";
import { useParams } from "react-router-dom";

import Web3Modal from "web3modal";
import Ceramic from "@ceramicnetwork/http-client";
const ceramic = new Ceramic("https://ceramic-clay.3boxlabs.com");

import { IDX } from "@ceramicstudio/idx";

import { ThreeIdConnect, EthereumAuthProvider } from "3id-connect";
export const threeID = new ThreeIdConnect();

import { definitions } from "../configs/idx.json";
const idx = new IDX({ ceramic, aliases: definitions });

export const Asset: React.FC = () => {
  const [basicProfile, setBasicProfile] = React.useState<any>();
  const [createdChocomint, setCreatedChocomint] = React.useState<any>();
  const [likedChocomint, setLikedChocomint] = React.useState<any>();
  const [followedChocominter, setFollowedChocominter] = React.useState<any>();
  const { did } = useParams<{ did: string }>();
  React.useEffect(() => {
    idx
      .get("basicProfile", did)
      .then((basicProfile) => setBasicProfile(basicProfile));
    idx
      .get("createdChocomint", did)
      .then(({ chocomints }: any) => setCreatedChocomint(chocomints));
    idx
      .get("likedChocomint", did)
      .then(({ chocomints }: any) => setLikedChocomint(chocomints));
    idx
      .get("followedChocominter", did)
      .then(({ chocomints }: any) => setFollowedChocominter(chocomints));
  }, []);

  return (
    <div>
      {basicProfile && (
        <>
          <p>{basicProfile.name}</p>
          <p>{basicProfile.description}</p>
        </>
      )}
      {createdChocomint && (
        <>
          <ul>
            {createdChocomint.map((chocomint: string, i: number) => {
              return <li key={i}>{chocomint}</li>;
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default Asset;
