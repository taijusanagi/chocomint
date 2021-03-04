export interface Choco {
  name: string;
  image: string;
  description: string;
}

export interface Pairmints {
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

export interface MintEvent {
  ipfsHash: string;
  creator: string;
  minter: string;
  address: string;
  tokenId: string;
  string: string;
}
