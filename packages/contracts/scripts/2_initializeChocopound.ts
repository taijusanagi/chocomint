import { initializeChocopound } from "../helpers/migration";

initializeChocopound()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
