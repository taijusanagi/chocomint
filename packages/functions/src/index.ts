import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const firestore = admin.firestore();

export const createChoco = functions.https.onCall(async (data, context) => {
  const { chocoId, choco } = data;

  const createdAt = Date.now();

  // TODO: organize config value
  const collectionName =
    process.env.REACT_APP_NETWORK_NAME == "mainnet" ? "nft_production" : "nft_staging";

  // TODO: add validate
  await firestore
    .collection(collectionName)
    .doc(chocoId)
    .set({ createdAt, ...choco });
  return { chocoId, choco };
});
