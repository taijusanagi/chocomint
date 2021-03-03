import React from "react";
import { useParams } from "react-router-dom";
import { db } from "../modules/firebase";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";

import {
  getContract,
  validateChainId,
  getEthersSigner,
  ChainIdType,
} from "../modules/web3";

import { Minamints, MintEvent } from "../types";

import "./box.css";

export const Box: React.FC = () => {
  const [minamints, setMinamints] = React.useState<Minamints[]>([]);
  const [events, setEvents] = React.useState<MintEvent[]>([]);

  const { address } = useParams<{ address: string }>();
  React.useEffect(() => {
    db.collection("minamints")
      .where("creator", "==", address)
      .get()
      .then((querySnapshot) => {
        const minamints: Minamints[] = [];
        querySnapshot.forEach((doc) => {
          minamints.push(doc.data() as Minamints);
        });
        setMinamints(minamints);
      });

    const contract = getContract(31337);
    const filter = contract.filters.Mint(null, address);
    contract.queryFilter(filter).then((events) => {
      const args = events.map((event) => event.args);
      setEvents(args as any);
    });
  }, []);

  const mint = async (i: number) => {
    const minamint = minamints[i];
    const signer = await getEthersSigner();
    const chainId = await signer.getChainId();
    if (chainId != minamint.chainId) {
      alert("chain id is invalid");
      return;
    }
    const contract = getContract(chainId as ChainIdType);
    await contract
      .connect(signer)
      .minamint(
        minamint.metadataIpfsHash,
        minamint.creator,
        minamint.recipient,
        minamint.root,
        minamint.proof,
        minamint.signature,
        {
          value: minamint.value,
        }
      );
  };

  return (
    <div className="mx-auto h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center">
          <div className="w-full mt-4 mx-auto">
            <div className="p-8 w-60 mx-auto bg-green-400 text-center rounded-xl border-b-4 border-green-700 shadow-2xl text-center">
              <img
                className="mx-auto h-12 w-12 rounded-xl shadow-md"
                src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixqx=4LE1N9O1HK&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80"
                alt="profile"
              />
              <div className="mt-2">
                <div className="font-medium text-sm">
                  <h3>unnamed</h3>
                  <p className="extra-small">
                    0x70997970C51812dc3A010C7d01b50e0d17dc79C8
                  </p>
                </div>
              </div>
              <div className="mt-1">
                <ul className="flex justify-center space-x-5">
                  <li>
                    <a href="#" className="text-white hover:text-blue-400">
                      <FontAwesomeIcon icon={faTwitter} />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <ul className="grid grid-cols-3 gap-x-6">
            {minamints.map((minamint, i) => {
              return (
                <li key={i} className="mt-6">
                  <div
                    onClick={() => {
                      mint(i);
                    }}
                    className="cursor-pointer transition duration-500 transform hover:-translate-y-1"
                  >
                    <img
                      className="h-60 w-60 rounded-xl object-cover border-b-4 border-gray-600 shadow-md"
                      src={minamint.choco.image}
                      alt=""
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Box;
