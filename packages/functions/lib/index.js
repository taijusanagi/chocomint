"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChoco = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const firestore = admin.firestore();
exports.createChoco = functions.https.onCall(async (data, context) => {
    const { chocoId, choco } = data;
    const createdAt = Date.now();
    // TODO: organize config value
    const collectionName = process.env.REACT_APP_NETWORK_NAME == "mainnet" ? "nft_production" : "nft_staging";
    // TODO: add validate
    await firestore
        .collection(collectionName)
        .doc(chocoId)
        .set(Object.assign({ createdAt }, choco));
    return { chocoId, choco };
});
//# sourceMappingURL=index.js.map