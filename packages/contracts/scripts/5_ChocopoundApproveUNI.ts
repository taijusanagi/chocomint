import { approveCurrency } from "../helpers/migration";

approveCurrency("UNI")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
