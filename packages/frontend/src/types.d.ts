export interface Metadata {
  name: string;
  description: string;
  image: string;
}

export interface Choco {
  chainId: number;
  registry: string;
  ipfsHash: string;
  creator: string;
  signature: string;
  metadata: Metadata;
}
