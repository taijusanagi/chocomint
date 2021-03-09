import React from "react";
import { useParams } from "react-router-dom";

import { firestore, collectionName } from "../modules/firebase";
import { ethers } from "ethers";
import { chainId, chocomintPublisherContract, getEthersSigner } from "../modules/web3";

import { Modal } from "../components/molecules/Modal";
import { Header } from "../components/organisms/Header";

const emoji = require("../assets/emoji.png").default;
import "./box.scss";

export const Box: React.FC = () => {
  const [pairmints, setPairmints] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [hasProfile, setHasProfile] = React.useState<boolean>(false);
  const [modals, setModals] = React.useState({
    success: false,
    error: false,
  });
  const [errorMsg, setErrorMsg] = React.useState("");
  const [exploreUrl, setExploreUrl] = React.useState("");

  const { address } = useParams<{ address: string }>();
  React.useEffect(() => {
    firestore
      .collection(collectionName)
      .where("creator", "==", address)
      .get()
      .then((querySnapshot) => {
        const pairmints: any = [];
        querySnapshot.forEach((doc) => {
          pairmints.push(doc.data());
        });
        setPairmints(pairmints);
      });

    // const filter = chocomintPublisherContract.filters.Mint(null, address);
    // contract.queryFilter(filter).then((events) => {
    //   const args = events.map((event) => event.args);
    //   setEvents(args as any);
    // });
  }, []);

  const checkAlreadyMinted = (ipfsHash: string) => {
    const result = false;
    // events.forEach((event) => {
    //   if (ipfsHash == event.ipfsHash) {
    //     result = true;
    //   }
    // });
    return result;
  };

  const mint = async (i: number) => {
    const pairmint = pairmints[i];
    const signer = await getEthersSigner();
    const chainId = await signer.getChainId();

    // if (chainId != pairmint.chainId) {
    //   setErrorModal("chain id is invalid");
    //   return;
    // }
    // const { explore } = getNetwork(chainId as ChainIdType);
    // const contract = getContract(chainId as ChainIdType);
    // const { hash } = await contract
    //   .connect(signer)
    //   .pairmint(
    //     pairmint.metadataIpfsHash,
    //     pairmint.creator,
    //     pairmint.recipient,
    //     pairmint.root,
    //     pairmint.proof,
    //     pairmint.signature,
    //     {
    //       value: pairmint.value,
    //     }
    //   );
    // setExploreUrl(`${explore}${hash}`);
    setSuccessModal();
  };

  const openModal = async (target: "success" | "error") => {
    setModals({
      ...modals,
      [target]: true,
    });
  };

  const closeModal = async (target: "success" | "error") => {
    setModals({
      ...modals,
      [target]: false,
    });
  };

  const setSuccessModal = () => {
    openModal("success");
  };

  const setErrorModal = (msg: string) => {
    setErrorMsg(msg);
    openModal("error");
  };

  return (
    <div className="mx-auto h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center">
          <div className="w-5/6 mt-4 mx-auto">
            <div className="p-8 mx-auto bg-gray-100 text-center rounded-xl border-b-4 border-gray-200 shadow-2xl text-center">
              <img
                className="mx-auto h-12 w-12 rounded-xl"
                src={hasProfile ? "" : emoji}
                alt="profile"
              />
              <div className="mt-2">
                <div className="font-medium text-xs text-gray-800">
                  <p className="font-medium">{address}</p>
                </div>
              </div>
              <div className="mt-1">
                <ul className="flex justify-center space-x-5 mt-4">
                  <li>
                    <a
                      href="//twitter.com/share"
                      className="twitter-share-button"
                      data-text="NFTを発行しました！"
                      data-url=""
                    ></a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <ul className="grid grid-cols-3 gap-x-3">
            {pairmints.map((pairmint, i) => {
              const minted = checkAlreadyMinted("");
              console.log(minted);
              return (
                <li key={i} className="mt-6">
                  <button
                    onClick={() => {
                      if (minted) return;
                      mint(i);
                    }}
                    disabled={minted}
                    className={`frame disabled:opacity-50 transition duration-500 transform hover:-translate-y-1`}
                  >
                    <div className="property-card h-60 w-60 rounded-xl object-cover border-b-4 border-gray-600 shadow-md">
                      <div
                        className="property-image"
                        style={{
                          backgroundImage: `url(${""})`,
                        }}
                      >
                        <div className="property-image-title"></div>
                      </div>
                      {!minted && (
                        <div className="property-description text-left">
                          <p className="text-md font-medium text-white">{""}</p>
                          <p className="text-xs text-white">{ethers.utils.formatEther("1")} ETH</p>
                        </div>
                      )}
                    </div>
                  </button>
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
