import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
import * as ipfsHash from "ipfs-only-hash";

chai.use(solidity);
const { expect } = chai;

describe("Chocomint Copy", function () {
  let chocomintOriginal;
  let chocomintCopy;
  let originalId;

  this.beforeAll("initialization.", async function () {
    const ChocomintOriginal = await ethers.getContractFactory(
      "ChocomintOriginal"
    );
    const ChocomintCopy = await ethers.getContractFactory("ChocomintCopy");
    chocomintOriginal = await ChocomintOriginal.deploy("", "");
    chocomintCopy = await ChocomintCopy.deploy(chocomintOriginal.address);

    const fee = 100;
    const chainId = 31337;
    const name = "name";
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
      [
        chainId,
        chocomintOriginal.address,
        fee,
        choco.name,
        choco.image,
        choco.iss,
      ]
    );
    const messageHashBinary = ethers.utils.arrayify(messageHash);
    const signature = await signer.signMessage(messageHashBinary);
    const r = `0x${signature.substring(2, 66)}`;
    const s = `0x${signature.substring(66, 130)}`;
    const v = ethers.BigNumber.from(
      `0x${signature.substring(130, 132)}`
    ).toString();
    await chocomintOriginal.mint(choco.name, choco.image, r, s, v, choco.iss, {
      value: fee,
    });
    originalId = ethers.BigNumber.from(messageHash).toString();
  });

  it("case: mint is ok / check: tokenURI", async function () {
    const [signer] = await ethers.getSigners();
    await chocomintCopy.mint(originalId);
    expect(await chocomintCopy.balanceOf(signer.address, originalId)).to.equal(
      1
    );
    await chocomintCopy.mint(originalId);
    await chocomintCopy.mint(originalId);
    await chocomintCopy.mint(originalId);
    await chocomintCopy.mint(originalId);
    await chocomintCopy.mint(originalId);
    await chocomintCopy.burn(originalId);
    await chocomintCopy.burn(originalId);
    await chocomintCopy.burn(originalId);
    await chocomintCopy.burn(originalId);
    await chocomintCopy.burn(originalId);
    await chocomintCopy.burn(originalId);

    // await chocomintCopy.mint(originalId);
    // await chocomintCopy.mint(originalId);
    // await chocomintCopy.mint(originalId);
    // await chocomintCopy.mint(originalId);
    // await chocomintCopy.mint(originalId);
    // await chocomintCopy.burn(originalId);
    // await chocomintCopy.burn(originalId);
    // await chocomintCopy.burn(originalId);
    // await chocomintCopy.burn(originalId);
    // await chocomintCopy.burn(originalId);
  });
});
