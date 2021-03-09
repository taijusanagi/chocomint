export interface Metadata {
  name: string;
  description: string;
  image: string;
}

export interface Choco {
  chainId: number;
  publisherAddress: string;
  creatorAddress: string;
  ipfsHash: string;
  supplyLimit: string;
  virtualSupply: string;
  virtualReserve: string;
  crr: string;
  royalityRatio: string;
  signature: string;
  metadata: Metadata;
}
