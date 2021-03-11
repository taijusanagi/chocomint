import { deployChocopound } from "../helpers/migration";

deployChocopound()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
