import React from "react";
import {
  ipfs,
  getEthersSigner,
  ChainIdType,
  getNetworkConfig,
  ipfsBaseUrl,
  getContract,
} from "../modules/web3";

const bs58 = require("bs58");
const logo = require("../assets/icon.png").default;

export const Create: React.FC = () => {
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState("");
  const [
    waitingTransactionConfirmation,
    setWaitingTransactionConfirmation,
  ] = React.useState(false);
  const [statusAlert, setStatusAlert] = React.useState({
    success: {
      status: false,
      msg: "",
    },
    error: {
      status: false,
      msg: "",
    },
  });
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [exploreUrl, setExploreUrl] = React.useState("");

  const readAsArrayBufferAsync = (file: File) => {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result);
      };
      fr.readAsArrayBuffer(file);
    });
  };

  const uploadFileToIpfs = async (file: File) => {
    const fileBuffer = await readAsArrayBufferAsync(file);
    const fileUint8Array = new Uint8Array(fileBuffer as Buffer);
    const { cid } = await ipfs.add(fileUint8Array);
    return `${ipfsBaseUrl}${cid}`;
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(event.target.value);
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    //This can be processed when file presents
    setImagePreview("");
    setImageLoading(true);
    const file = event.target.files![0];
    const preview = URL.createObjectURL(file);
    const imageUrl = await uploadFileToIpfs(file);
    setImagePreview(preview);
    setImageUrl(imageUrl);
    setImageLoading(false);
  };

  const createNft = async () => {
    if (!name || !description || !imageUrl) {
      return;
    }
    setWaitingTransactionConfirmation(true);
    try {
      const signer = await getEthersSigner();
      const chainId = await signer.getChainId();
      if (chainId != 4 && chainId != 80001) {
        setError("Please connect to Rinkeby or Matic Testnet.");
        return;
      }
      const { contractAddress, explore } = getNetworkConfig(
        chainId.toString() as ChainIdType
      );
      const choco = {
        name,
        description,
        image: imageUrl,
      };
      const metadataString = JSON.stringify(choco);
      const { cid } = await ipfs.add(metadataString);
      const contract = getContract(contractAddress).connect(signer);
      const digest = `0x${bs58
        .decode(cid.toString())
        .slice(2)
        .toString("hex")}`;
      const { hash } = await contract.mint(digest);
      setExploreUrl(`${explore}${hash}`);
      setSuccess(`TxHash: \n${hash}`);
    } catch (err) {
      setError("Please connect to Rinkeby or Matic Testnet.");
    }
  };

  const setSuccess = (msg: string) => {
    setWaitingTransactionConfirmation(false);
    setName("");
    setDescription("");
    setImageUrl("");
    setStatusAlert({
      success: {
        status: true,
        msg,
      },
      error: {
        status: false,
        msg: "",
      },
    });
  };

  const setError = (msg: string) => {
    setWaitingTransactionConfirmation(false);
    setStatusAlert({
      success: {
        status: false,
        msg: "",
      },
      error: {
        status: true,
        msg,
      },
    });
  };

  const resetAlert = () => {
    setWaitingTransactionConfirmation(false);
    setStatusAlert({
      success: {
        status: false,
        msg: "",
      },
      error: {
        status: false,
        msg: "",
      },
    });
  };

  return (
    <div className="mx-auto h-screen bg-white">
      <div className="flex justify-center">
        <div className="w-full max-w-md p-4">
          <div>
            <img
              className="mx-auto h-20 rounded-xl w-auto border-b-4 border-green-700 shadow-md"
              src={logo}
              alt="logo"
            />
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Let’s create NFTs!
            </h2>
            <p className="text-center text-gray-500 text-sm">
              Rinkeby & Mumbai is available
            </p>
          </div>
          <div className="mt-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Name
            </label>
            <input
              onChange={handleNameChange}
              type="text"
              name="name"
              id="name"
              autoComplete="given-name"
              className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
            />
          </div>
          <div className="mt-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Description
            </label>
            <textarea
              onChange={handleDescriptionChange}
              id="description"
              name="description"
              className="mt-1 block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border-gray-300 rounded-xl"
            ></textarea>
          </div>

          <div className="mt-2">
            <label
              htmlFor="cover_photo"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Image
            </label>

            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
              <div className="space-y-4 text-center">
                {!imagePreview ? (
                  <svg
                    className={`mx-auto h-20 w-20 text-gray-400 ${
                      imageLoading && "animate-bounce"
                    }`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <img
                    className={`mx-auto h-20 w-20 rounded-xl border-b-4 border-gray-600 shadow-md ${
                      waitingTransactionConfirmation &&
                      "animate-spin opacity-50"
                    }`}
                    src={imagePreview}
                  />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>Upload a file</span>
                    <input
                      onChange={handleImageChange}
                      id="file"
                      name="file"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">to ipfs. It takes some time.</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={createNft}
              disabled={!name || !description || !imageUrl}
              className="disabled:opacity-50 w-full rounded-xl max-w-md bg-green-500 text-white font-bold py-2 px-4 border-b-4 border-green-700 rounded shadow-2xl"
            >
              {"Mint"}
            </button>
          </div>

          <div className="mt-8">
            {statusAlert.success.status && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Success 🎉
                    </h3>
                    <div className="mt-2 text-xs text-green-700">
                      <p className="truncate w-60">{statusAlert.success.msg}</p>
                    </div>
                    <div className="mt-4">
                      <div className="-mx-2 -my-1.5 flex">
                        <a
                          href={exploreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600">
                            View status
                          </button>
                        </a>
                        <button
                          className="ml-3 bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                          onClick={resetAlert}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {statusAlert.error.status && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {statusAlert.error.msg}
                    </h3>
                    <div className="mt-4">
                      <div className="-mx-2 -my-1.5 flex">
                        <button
                          className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                          onClick={resetAlert}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
