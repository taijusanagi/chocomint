import React from "react";
import { useParams, Link } from "react-router-dom";

import { firestore, collectionName } from "../modules/firebase";
import {
  verifyMetadata,
  chocomintPublisherContract,
  getEthersSigner,
  chainId,
  networkName,
  explore,
  getPrices,
  roundAndFormatPrintPrice,
  roundAndFormatBurnPrice,
  useWallet,
} from "../modules/web3";

import { shortenAddress, shortenName } from "../modules/util";

import { Body } from "../components/atoms/Body";
import { Button } from "../components/atoms/Button";
import { Modal, useModal } from "../components/molecules/Modal";
import { Shares } from "../components/molecules/Shares";
import { Header } from "../components/organisms/Header";
import { Footer } from "../components/organisms/Footer";
import { Choco } from "../types";

export const NFT: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const [choco, setChoco] = React.useState<Choco | undefined>(undefined);
  const { modal, openModal, closeModal } = useModal();

  const [printCount, setPrintCount] = React.useState(0);
  const [printPrice, setPrintPrice] = React.useState(0);
  const [burnPrice, setBurnPrice] = React.useState(0);
  const [slippage, setSlippage] = React.useState(0);
  const [pricesAtEachSupply, setPricesAtEachSupply] = React.useState<any>();

  const slippageList = [0, 1, 2, 3];

  const { connectWallet } = useWallet();

  // this only calls blockchian once so perfomance would be ok
  React.useEffect(() => {
    firestore
      .collection(collectionName)
      .doc(hash)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          openModal("😲", "It seems you're searching for non existing NFT.", "Home", "/", false);
          return;
        }

        const choco = doc.data() as Choco;
        const { ipfsHash, metadata } = choco;
        const ipfsVerified = verifyMetadata(ipfsHash, metadata);
        if (!ipfsVerified) {
          openModal("😲", "This NFT is not verified by IPFS.", "Home", "/", false);
          return;
        }
        setChoco(choco);

        chocomintPublisherContract.totalSupplies(hash).then((printCountBN) => {
          const printCount = parseInt(printCountBN.toString());
          setPrintCount(printCount);
          const { pricesAtEachSupply } = getPrices(
            choco.supplyLimit,
            choco.initialPrice,
            choco.diluter,
            choco.crr,
            choco.royaltyRatio
          );
          setPricesAtEachSupply(pricesAtEachSupply);
          // fixme: contracts/util cannot have type setting because of react loader issue
          const { printPrice, burnPrice } = pricesAtEachSupply[printCountBN.toNumber()] as any;
          setPrintPrice(printPrice);
          setBurnPrice(burnPrice);
        });
      });
  }, []);

  const validateNetworkAndGetSigner = async () => {
    const provider = await connectWallet();
    const signer = await getEthersSigner(provider);
    const signerNetwork = await signer.provider.getNetwork();
    if (signerNetwork.chainId != chainId) {
      openModal("😲", `Wrong network detected, please connect to ${networkName}.`);
      return;
    } else {
      return signer;
    }
  };

  const print = async () => {
    if (!choco || !pricesAtEachSupply) {
      return;
    }
    try {
      const signer = await validateNetworkAndGetSigner();
      if (!signer) {
        return;
      }

      const { printPrice } = pricesAtEachSupply[printCount + slippage];

      const { hash: tx } = await chocomintPublisherContract
        .connect(signer)
        .publishAndMintPrint(
          choco.currencyAddress,
          choco.creatorAddress,
          choco.ipfsHash,
          choco.supplyLimit,
          choco.initialPrice,
          choco.diluter,
          choco.crr,
          choco.royaltyRatio,
          choco.signature,
          printPrice,
          0,
          { value: printPrice }
        );
      openModal("🎉", "Transaction is send to blockchain.", "Check", `${explore}${tx}`, true);
    } catch (err) {
      openModal("🙇‍♂️", err.message);
    }
  };

  const burn = async () => {
    if (!choco || !burnPrice) {
      return;
    }
    try {
      const signer = await validateNetworkAndGetSigner();
      if (!signer) {
        return;
      }
      const { hash: tx } = await chocomintPublisherContract
        .connect(signer)
        .burnPrint(hash, printCount - slippage);
      openModal("🎉", "Transaction is send to blockchain.", "Check", `${explore}${tx}`, true);
    } catch (err) {
      openModal("🙇‍♂️", err.message);
    }
  };

  return (
    <Body>
      <Header />
      {choco && (
        <div className="grid grid-cols-1 sm:grid-cols-2 flex">
          <div className="p-4 flex justify-center sm:justify-end relative">
            <div className="flex">
              <div className="absolute opacity-90 m-4">
                <button
                  onClick={connectWallet}
                  className="solidity bg-gray-100 text-xs p-2 text-gray-700 text-xs font-medium"
                >
                  {printCount}/ {choco.supplyLimit}
                </button>
              </div>
              <img className="object-cover max-h-96 max-w-sm olidity" src={choco.metadata.image} />
            </div>
          </div>

          <div className="p-4 w-full sm:w-7/12 flex justify-start flex-col">
            <Link to={`/creator/${choco.creatorAddress}`}>
              <button className="w-40 bg-white text-gray-700 text-xs font-medium rounded-full shadow-md p-2">
                <span className="pr-2">👩‍🎨</span>
                {shortenAddress(choco.creatorAddress)}
              </button>
            </Link>
            <p className="break-all text-gray-700 text-5xl sm:text-7xl font-medium mb-2">
              {shortenName(choco.metadata.name)}
            </p>
            <p className="break-all text-gray-400 text-xs font-medium mb-4">
              {choco.metadata.description}
            </p>
            <div className="grid grid-cols-2 mb-4">
              <div>
                {printPrice > 0 && (
                  <>
                    <p className="text-lg text-gray-500 font-medium">Buy Price</p>
                    <p className="text-2xl sm:text-3xl text-gray-700 font-medium">
                      {roundAndFormatPrintPrice(printPrice, 3)} ETH
                    </p>
                  </>
                )}
              </div>
              <div>
                {printPrice > 0 && (
                  <>
                    <p className="text-lg text-gray-500 font-medium">Sell Price</p>
                    <p className="text-2xl sm:text-3xl text-gray-700 font-medium">
                      {roundAndFormatBurnPrice(burnPrice, 3)} ETH
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-xs font-medium">Slippage Settings</p>
              <div className="flex">
                {slippageList.map((_slippage, i) => {
                  return (
                    <div key={i}>
                      <button
                        className={`cursor-pointer text-xs text-gray-500 focus:outline-none focus:bg-gray-200 hover:bg-gray-100 py-1 px-2 font-medium rounded-md ${
                          slippage === _slippage ? "bg-gray-200" : ""
                        }`}
                        onClick={() => setSlippage(_slippage)}
                      >
                        {_slippage}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mb-4">
              <div className="grid grid-cols-2 space-x-2">
                {printPrice > 0 && (
                  <Button onClick={print} type="primary">
                    Buy
                    <span className="ml-1">💎</span>
                  </Button>
                )}
                {burnPrice > 0 && (
                  <Button onClick={burn} type="tertiary">
                    Sell
                    <span className="ml-1">🔥</span>
                  </Button>
                )}
              </div>
            </div>
            <Shares />
          </div>
        </div>
      )}
      {modal && <Modal {...modal} onClickDismiss={closeModal} />}
      <Footer />
    </Body>
  );
};

export default NFT;
