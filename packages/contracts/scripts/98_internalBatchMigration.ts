import {
  deployChocopound,
  deployChocopoundOwnership,
  initializeChocopound,
  initializeChocopoundOwnership,
  approveCurrency,
} from "../helpers/migration";

export const main = async () => {
  const chocopound = await deployChocopound();
  const chocopoundOwnership = await deployChocopoundOwnership();
  await initializeChocopound();
  await initializeChocopoundOwnership();
  await approveCurrency("ETH");
  await approveCurrency("UNI");
  await approveCurrency("DAI");
  return { chocopound, chocopoundOwnership };
};
