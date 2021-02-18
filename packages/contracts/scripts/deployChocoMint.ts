import { ethers } from "hardhat";

const main = async () => {
  const Chocomint = await ethers.getContractFactory("Chocomint");
  const chocomint = await Chocomint.deploy();
  console.log("Chocomint deployed to:", chocomint.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
