import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const firestore = admin.firestore();

export const registerChoco = functions.https.onCall(async (data, context) => {
  const { chocoId, choco } = data;

  // TODO: organize config value
  const collectionName = process.env.NODE_ENV == "production" ? "nft_production" : "nft_staging";

  // TODO: add validate
  await firestore.collection(collectionName).doc(chocoId).set(choco);
  return { chocoId, choco };
});
