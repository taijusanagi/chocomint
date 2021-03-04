import React from "react";
import { useParams } from "react-router-dom";
import { Modal } from "../components/molecules";
import { db, collectionName } from "../modules/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faInstagram,
  faYoutube,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { ethers } from "ethers";
import { getContract, getEthersSigner, ChainIdType } from "../modules/web3";
import { Pairmints, MintEvent } from "../types";
const emoji = require("../assets/emoji.png").default;
import "./box.scss";

export const Box: React.FC = () => {
  const [pairmints, setPairmints] = React.useState<Pairmints[]>([]);
  const [events, setEvents] = React.useState<MintEvent[]>([]);
  const [hasProfile, setHasProfile] = React.useState<boolean>(false);
  const [modals, setModals] = React.useState({
    success: false,
    error: false,
  });
  const [errorMsg, setErrorMsg] = React.useState("");

  const { address } = useParams<{ address: string }>();
  React.useEffect(() => {
    db.collection(collectionName)
      .where("creator", "==", address)
      .get()
      .then((querySnapshot) => {
        const pairmints: Pairmints[] = [];
        querySnapshot.forEach((doc) => {
          pairmints.push(doc.data() as Pairmints);
        });
        setPairmints(pairmints);
      });
    const contract = getContract(31337);
    const filter = contract.filters.Mint(null, address);
    contract.queryFilter(filter).then((events) => {
      const args = events.map((event) => event.args);
      setEvents(args as any);
    });
  }, []);

  const checkAlreadyMinted = (ipfsHash: string) => {
    let result = false;
    events.forEach((event) => {
      if (ipfsHash == event.ipfsHash) {
        result = true;
      }
    });
    return result;
  };

  const mint = async (i: number) => {
    const pairmint = pairmints[i];
    const signer = await getEthersSigner();
    const chainId = await signer.getChainId();

    if (chainId != pairmint.chainId) {
      setErrorModal("chain id is invalid");
      return;
    }
    const contract = getContract(chainId as ChainIdType);
    await contract
      .connect(signer)
      .pairmint(
        pairmint.metadataIpfsHash,
        pairmint.creator,
        pairmint.recipient,
        pairmint.root,
        pairmint.proof,
        pairmint.signature,
        {
          value: pairmint.value,
        }
      );
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
        {modals.success && (
          <Modal
            type="single"
            execValue="閉じる"
            onClickClose={() => {
              closeModal("success");
            }}
          >
            <div className="mx-4 my-4">
              <div className="text-center">
                <h3
                  className="text-xl leading-6 font-medium text-gray-900 mb-8"
                  id="modal-headline"
                >
                  🎉 Congratulation!!🎉
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    発行できました！SNSで知らせよう！
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        )}
        {modals.error && (
          <Modal
            type="single"
            execColor="red"
            execValue="閉じる"
            onClickExec={() => {
              closeModal("error");
            }}
          >
            <div className="mx-4">
              <div className="text-center mt-2">
                <h2
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-headline"
                >
                  ERROR
                </h2>
                <div className="mt-2">
                  <p className="text-sm text-gray-800">
                    以下のようなエラーが発生しました。
                  </p>
                </div>
                <div className="overflow-auto mt-4 p-3 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-400">{errorMsg}</p>
                </div>
              </div>
            </div>
          </Modal>
        )}
        <div className="flex justify-center">
          <div className="w-5/6 mt-4 mx-auto">
            <div className="p-8 mx-auto bg-green-400 text-center rounded-xl border-b-4 border-green-700 shadow-2xl text-center">
              <img
                className="mx-auto h-12 w-12 rounded-xl"
                src={hasProfile ? "" : emoji}
                alt="profile"
              />
              <div className="mt-2">
                <div className="font-medium text-xs">
                  <p className="extra-small ont-medium">{address}</p>
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
              const minted = checkAlreadyMinted(pairmint.metadataIpfsHash);
              return (
                <li key={i} className="mt-6">
                  <button
                    onClick={() => {
                      mint(i);
                    }}
                    disabled={minted}
                    className={`frame disabled:opacity-50 ${
                      minted
                        ? "cursor-default"
                        : "transition duration-500 transform hover:-translate-y-1"
                    }`}
                  >
                    <div className="property-card h-60 w-60 rounded-xl object-cover border-b-4 border-gray-600 shadow-md">
                      <div
                        className="property-image"
                        style={{
                          backgroundImage: `url(${pairmint.choco.image})`,
                        }}
                      >
                        <div className="property-image-title"></div>
                      </div>
                      {!minted && (
                        <div className="property-description text-left">
                          <p className="text-md font-medium text-white">
                            {pairmint.choco.name}
                          </p>
                          <p className="text-xs text-white">
                            {ethers.utils.formatEther(pairmint.value)} ETH
                          </p>
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
