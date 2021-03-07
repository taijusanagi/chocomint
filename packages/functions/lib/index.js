"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChoco = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const firestore = admin.firestore();
exports.addChoco = functions.https.onCall(async (data, context) => {
    const { orderId, record } = data;
    const collectionName = process.env.NODE_ENV == "production" ? "nft_production" : "nft_staging";
    await firestore.collection(collectionName).doc(orderId).set(record);
    return { orderId, record };
});
//# sourceMappingURL=index.js.map