import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const firestore = admin.firestore();

export const addChoco = functions.https.onCall(async (data, context) => {
  const { orderId, record } = data;
  const collectionName = process.env.NODE_ENV == "production" ? "nft_production" : "nft_staging";
  await firestore.collection(collectionName).doc(orderId).set(record);
  return { orderId, record };
});
