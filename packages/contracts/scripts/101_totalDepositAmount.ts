import { totalDepositAmountForToken } from "../helpers/tally";

totalDepositAmountForToken(23876961, 23943262)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
