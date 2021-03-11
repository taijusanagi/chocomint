import { approveCurrency } from "../helpers/migration";

approveCurrency("WETH")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
