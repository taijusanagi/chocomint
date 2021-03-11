import { initializeChocopoundOwnership } from "../helpers/migration";

initializeChocopoundOwnership()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
