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
  await approveCurrency("WETH");
  await approveCurrency("UNI");
  return { chocopound, chocopoundOwnership };
};
