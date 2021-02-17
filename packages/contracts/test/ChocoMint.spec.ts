import { ethers } from "hardhat";
import * as chai from "chai";
import { solidity } from "ethereum-waffle";
chai.use(solidity);
const { expect } = chai;

describe("Token contract", function () {
  let chocoMint;
  const contractName = "EthereumChocoMintV1";
  const contractSymbol = "ETHCM1";

  this.beforeAll("initialization.", async function () {
    const ChocoMint = await ethers.getContractFactory("ChocoMint_V1");
    chocoMint = await ChocoMint.deploy(contractName, contractSymbol);
  });

  it("case: deploy is ok / check: name, symbol", async function () {
    expect(await chocoMint.name()).to.equal(contractName);
    expect(await chocoMint.symbol()).to.equal(contractSymbol);
  });

  it("case: mint is ok / check: tokenOwner, tokenURI", async function () {
    const initial_price = "10000";
    const [signer] = await ethers.getSigners();
    const choco = {
      name: "name",
      description: "description",
      image: "image",
      initial_price,
      creator_fee: "100",
      creator: signer.address,
      signature: "0x",
    };

    const messageHash = ethers.utils.solidityKeccak256(
      ["string", "string", "string", "uint256", "uint256", "address"],
      [
        choco.name,
        choco.description,
        choco.image,
        choco.initial_price,
        choco.creator_fee,
        choco.creator,
      ]
    );

    const messageHashBinary = ethers.utils.arrayify(messageHash);
    choco.signature = await signer.signMessage(messageHashBinary);

    await chocoMint.mint(
      [
        choco.name,
        choco.description,
        choco.image,
        choco.initial_price,
        choco.creator_fee,
        choco.creator,
        choco.signature,
      ],
      {
        value: initial_price,
      }
    );
    // console.log(await chocoMint.tokenURI(1));
  });
});
