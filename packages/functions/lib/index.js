"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChoco = void 0;
const functions = require("firebase-functions");
exports.addChoco = functions.https.onCall((data, context) => {
    console.log(data);
    //   const { chainId } = request.body;
    //   console.log(chainId);
    //   response.send("Hello from Firebase!");
});
//# sourceMappingURL=index.js.map