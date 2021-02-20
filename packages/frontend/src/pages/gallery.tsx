import React from "react";
import { useParams } from "react-router-dom";
import { idx } from "../modules/web3";

export const Gallery: React.FC = () => {
  const { did } = useParams<{ did: string }>();
  const [createdChocomint, setCreatedChocomint] = React.useState<
    undefined | string[]
  >(undefined);

  React.useEffect(() => {
    console.log("get createdChocomint");
    idx.get("createdChocomint", did).then(({ chocomints }: any) => {
      console.log("get createdChocomint done", chocomints);
      setCreatedChocomint(chocomints);
    });
  }, []);

  return (
    <div>
      <p>{did}</p>
      {createdChocomint &&
        createdChocomint.map((chocomint, i) => {
          return <p key={i}>{chocomint}</p>;
        })}
    </div>
  );
};

export default Gallery;
