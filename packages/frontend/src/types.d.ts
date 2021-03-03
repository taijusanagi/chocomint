export interface Choco {
  name: string;
  image: string;
  description: string;
}

export interface Minamints {
  chainId: number;
  contractAddress: string;
  metadataIpfsHash: string;
  value: string;
  recipient: string;
  root: string;
  proof: string[];
  signature: string;
  creator: string;
  choco: Choco;
}
