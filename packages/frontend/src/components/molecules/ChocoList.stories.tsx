import React from "react";
import { MemoryRouter } from "react-router-dom";

import { ChocoList, ChocoListProps } from "./ChocoList";

import { Choco } from "../../types";

const choco1: Choco = {
  chocoId: "4435690493372526655330147267588841630046410064741316095447846859281088522158",
  chainId: 31337,
  creatorAddress: "0x84e9445f43995b0c6a4d4c1d40bb123571c2eb06",
  crr: "1000",
  ipfsHash: "0xd88823c26d58f4901fbd5bc23bad8b1f22cc90663d6ffdb3b37c3ac72674f420",
  metadata: {
    name: "chocomint name",
    description: "chocomint desc",
    image: "https://ipfs.io/ipfs/QmZdMu4uEkmmygxt99GnZeN3EEPQfx8aJoCLgkDbApaBuB/nft.png",
  },
  publisherAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  royalityRatio: "1000",
  signature:
    "0xb17722d2bfd23b5ec12c8eb921cdf7ea35a43c0673dc62b20d9b3a80e578f8f5324e72131880045072f0c9fde7620030697a291ebc76c4f573c6bc28475eaf7b1b",
  supplyLimit: "128",
  virtualReserve: "100000000000000000",
  virtualSupply: "64",
};

const choco2: Choco = {
  chocoId: "51442300240555014016623932697986773926116258888507822246197410255769692108486",
  chainId: 31337,
  creatorAddress: "0x84e9445f43995b0c6a4d4c1d40bb123571c2eb06",
  crr: "1000",
  ipfsHash: "0xd88823c26d58f4901fbd5bc23bad8b1f22cc90663d6ffdb3b37c3ac72674f420",
  metadata: {
    name: "chocomint name",
    description: "chocomint desc",
    image: "https://ipfs.io/ipfs/QmWecESkkNGPcQzyCDeATx127VWNA7ccFhTFgMFwfMupHN/nft.jpg",
  },
  publisherAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  royalityRatio: "1000",
  signature:
    "0xb17722d2bfd23b5ec12c8eb921cdf7ea35a43c0673dc62b20d9b3a80e578f8f5324e72131880045072f0c9fde7620030697a291ebc76c4f573c6bc28475eaf7b1b",
  supplyLimit: "128",
  virtualReserve: "100000000000000000",
  virtualSupply: "64",
};

const choco3: Choco = {
  chocoId: "54880312000758586603641038366832891953162885824902367771385943563178378782527",
  chainId: 31337,
  creatorAddress: "0x84e9445f43995b0c6a4d4c1d40bb123571c2eb06",
  crr: "1000",
  ipfsHash: "0xd88823c26d58f4901fbd5bc23bad8b1f22cc90663d6ffdb3b37c3ac72674f420",
  metadata: {
    name: "chocomint name",
    description: "chocomint desc",
    image: "https://ipfs.io/ipfs/QmWYJDgg9we8jdjV3gqr4fBeZk9CbpfetCyKR4iVnNmMjY/nft.png",
  },
  publisherAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  royalityRatio: "1000",
  signature:
    "0xb17722d2bfd23b5ec12c8eb921cdf7ea35a43c0673dc62b20d9b3a80e578f8f5324e72131880045072f0c9fde7620030697a291ebc76c4f573c6bc28475eaf7b1b",
  supplyLimit: "128",
  virtualReserve: "100000000000000000",
  virtualSupply: "64",
};

const prices = {
  "4435690493372526655330147267588841630046410064741316095447846859281088522158":
    "1754807692307000",
  "51442300240555014016623932697986773926116258888507822246197410255769692108486":
    "1562500000000000",
  "54880312000758586603641038366832891953162885824902367771385943563178378782527":
    "140625000000000000",
};

const args: ChocoListProps = {
  // put 3 kind of image
  // put 7 same data for layout test
  chocos: [choco1, choco2, choco3, choco1, choco1, choco1, choco1],
  prices,
};

export default {
  title: "Molecules/ChocoList",
  component: ChocoList,
  args,
};

export const Control: React.FC<ChocoListProps> = (props) => (
  <MemoryRouter>
    <ChocoList {...props} />
  </MemoryRouter>
);
