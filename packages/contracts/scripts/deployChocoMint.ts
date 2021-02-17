import { ethers } from "hardhat";

const main = async () => {
  const ChocoMint = await ethers.getContractFactory("ChocoMint");
  const chocoMint = await ChocoMint.deploy("ChocoMintEthereum", "ChocoMint");
  console.log("ChocoMint deployed to:", chocoMint.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
