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

  it("case: mint is ok / check: tokenURI", async function () {
    const fee = 100;
    const chainId = 31337;
    const name = "name";

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
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "address", "uint256", "bytes32", "bytes32", "address"],
      [chainId, chocomint.address, fee, choco.name, choco.image, choco.iss]
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    const signature = await signer.signMessage(messageHashBinary);
    const r = `0x${signature.substring(2, 66)}`;
    const s = `0x${signature.substring(66, 130)}`;
    const v = ethers.BigNumber.from(
      `0x${signature.substring(130, 132)}`
    ).toString();
    await chocomint.mint(choco.name, choco.image, r, s, v, choco.iss, {
      value: fee,
    });
    const tokenId = ethers.BigNumber.from(messageHash).toString();
    const metadataString = JSON.stringify({
      chainId: chainId.toString(),
      contractAddress: chocomint.address.toLowerCase(),
      tokenId,
      name,
      image: `${baseTokenUri}${imageCid}`,
      signature,
      iss,
    });
    expect(await chocomint.getMetadata(tokenId)).to.equal(metadataString);
    const metadataBuffer = Buffer.from(metadataString);
    const cid = await ipfsHash.of(metadataBuffer);
    const tokenURI = await chocomint.tokenURI(tokenId);
    expect(tokenURI).to.equal(`${baseTokenUri}${cid}`);
  });
});
