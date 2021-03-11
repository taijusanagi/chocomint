import { deployChocopoundOwnership } from "../helpers/migration";

deployChocopoundOwnership()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
