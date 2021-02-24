import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import * as ipfsHash from "ipfs-only-hash";

chai.use(solidity);
const { expect } = chai;

describe("Chocomint Original", function () {
  let chocomint;
  const contractName = "NFT";
  const contractSymbol = "NFT";
  this.beforeAll("initialization.", async function () {
    const Chocomint = await ethers.getContractFactory("ChocomintOriginal");
    chocomint = await Chocomint.deploy(contractName, contractSymbol);
  });

  it("case: deploy is ok / check: name, symbol", async function () {
    expect(await chocomint.name()).to.equal(contractName);
    expect(await chocomint.symbol()).to.equal(contractSymbol);
  });

  it("case: mintByCreator is ok / check: tokenURI", async function () {
    const chainId = 31337;
    const name = "name1";
    const baseTokenUri = "ipfs://";
    const imageCid = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";
    const imageHash =
      "0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89";
    const [signer] = await ethers.getSigners();
    const iss = signer.address.toLowerCase();
    const choco = {
      name: ethers.utils.formatBytes32String(name),
      image: imageHash,
      iss,
    };
    const tokenHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "bytes32", "address"],
      [chainId, chocomint.address, choco.name, choco.image, choco.iss]
    );
    const tokenId = ethers.BigNumber.from(tokenHash).toString();
    await chocomint.mintByCreator(choco.name, choco.image);

    const metadataString = JSON.stringify({
      chainId: chainId.toString(),
      contractAddress: chocomint.address.toLowerCase(),
      tokenId,
      name,
      image: `${baseTokenUri}${imageCid}`,
      iss,
    });
    const metadataBuffer = Buffer.from(metadataString);
    const cid = await ipfsHash.of(metadataBuffer);
    const tokenURI = await chocomint.tokenURI(tokenId);
    expect(tokenURI).to.equal(`${baseTokenUri}${cid}`);
  });

  it("case: mintByPurchaser is ok / check: tokenURI", async function () {
    const fee = 100;
    const chainId = 31337;
    const name = "name2";
    const baseTokenUri = "ipfs://";
    const imageCid = "QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz";
    const imageHash =
      "0x7D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89";
    const [signer] = await ethers.getSigners();
    const iss = signer.address.toLowerCase();
    const choco = {
      name: ethers.utils.formatBytes32String(name),
      image: imageHash,
      iss,
    };
    const tokenHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "bytes32", "bytes32", "address"],
      [chainId, chocomint.address, choco.name, choco.image, choco.iss]
    );
    const tokenId = ethers.BigNumber.from(tokenHash).toString();
    const delegateHash = ethers.utils.solidityKeccak256(
      ["uint256", "uint256"],
      [tokenId, fee]
    );
    const delegateHashBinary = ethers.utils.arrayify(delegateHash);
    const signature = await signer.signMessage(delegateHashBinary);
    const r = `0x${signature.substring(2, 66)}`;
    const s = `0x${signature.substring(66, 130)}`;
    const v = ethers.BigNumber.from(
      `0x${signature.substring(130, 132)}`
    ).toString();

    await chocomint.mintByPurchaser(choco.name, choco.image, r, s, v, fee, iss);

    const metadataString = JSON.stringify({
      chainId: chainId.toString(),
      contractAddress: chocomint.address.toLowerCase(),
      tokenId,
      name,
      image: `${baseTokenUri}${imageCid}`,
      iss,
    });
    const metadataBuffer = Buffer.from(metadataString);
    const cid = await ipfsHash.of(metadataBuffer);
    const tokenURI = await chocomint.tokenURI(tokenId);
    expect(tokenURI).to.equal(`${baseTokenUri}${cid}`);
  });
});
