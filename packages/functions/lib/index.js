"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChoco = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const firestore = admin.firestore();
exports.registerChoco = functions.https.onCall(async (data, context) => {
    const { chocoId, choco } = data;
    // TODO: organize config value
    const collectionName = process.env.NODE_ENV == "production" ? "nft_production" : "nft_staging";
    // TODO: add validate
    await firestore.collection(collectionName).doc(chocoId).set(choco);
    return { chocoId, choco };
});
//# sourceMappingURL=index.js.map