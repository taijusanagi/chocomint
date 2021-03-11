import {
  deployChocopound,
  deployChocopoundOwnership,
  initializeChocopound,
  initializeChocopoundOwnership,
  approveCurrency,
} from "../helpers/migration";

export const main = async () => {
  await deployChocopound();
  await deployChocopoundOwnership();
  await initializeChocopound();
  await initializeChocopoundOwnership();
  await approveCurrency("WETH");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
