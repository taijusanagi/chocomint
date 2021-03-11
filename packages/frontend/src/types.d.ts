export interface Metadata {
  name: string;
  description: string;
  image: string;
}

export interface Choco {
  chocoId: string;
  chainId: number;
  chocopoundAddress: string;
  currencyAddress: string;
  creatorAddress: string;
  ipfsHash: string;
  supplyLimit: number;
  initialPrice: string;
  diluter: number;
  crr: number;
  royaltyRatio: number;
  signature: string;
  metadata: Metadata;
}
