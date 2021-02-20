import React from "react";
import { Signer } from "../modules/web3";
const signer = new Signer();

interface BasicProfile {
  name: string;
  description: string;
  image: string;
}

export const MyPage: React.FC = () => {
  const [did, setDid] = React.useState("");
  const [basicProfile, setBasicProfile] = React.useState<
    BasicProfile | undefined
  >(undefined);
  const [createdChocomint, setCreatedChocomint] = React.useState<
    undefined | string[]
  >(undefined);

  const connect = async () => {
    await signer.init();
    const did = signer.idx.id;
    setDid(did);
    console.log("did", did);
    console.log("get basicProfile");
    signer.idx.get("basicProfile").then((basicProfile: any) => {
      console.log("got basicProfile done", basicProfile);
      setBasicProfile(basicProfile);
    });
    console.log("get createdChocomint");
    signer.idx.get("createdChocomint").then(({ chocomints }: any) => {
      console.log("get createdChocomint done", chocomints);
      setCreatedChocomint(chocomints);
    });
  };

  return (
    <div>
      {!did ? (
        <button id="connect" onClick={connect}>
          Connect
        </button>
      ) : (
        <div>
          <p>{did}</p>
          {basicProfile && (
            <div>
              <img src={basicProfile.image} />
              <p>{basicProfile.name}</p>
              <p>{basicProfile.description}</p>
            </div>
          )}
          {createdChocomint &&
            createdChocomint.map((chocomint, i) => {
              return <p key={i}>{chocomint}</p>;
            })}
        </div>
      )}
    </div>
  );
};

export default MyPage;
