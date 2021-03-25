import firebase from "firebase";

import firebaseJson from "../../../../firebase.json";

const firebaseConfig = {
  // MEMO: Here we don't want to affect the production's analytics.
  production: {
    apiKey: "AIzaSyDThONNzesmZYFpnXvIoSBTn6eIm69I4tQ",
    authDomain: "chocomint-prod.firebaseapp.com",
    projectId: "chocomint-prod",
    storageBucket: "chocomint-prod.appspot.com",
    messagingSenderId: "464874047282",
    appId: "1:464874047282:web:323cf0fc34b53c2e6ab92b",
    measurementId: "G-VZ4DF3ZNTH",
  },
  development: {
    apiKey: "AIzaSyDThONNzesmZYFpnXvIoSBTn6eIm69I4tQ",
    authDomain: "chocomint-prod.firebaseapp.com",
    projectId: "chocomint-prod",
    storageBucket: "chocomint-prod.appspot.com",
    messagingSenderId: "464874047282",
    appId: "1:464874047282:web:323cf0fc34b53c2e6ab92b",
    measurementId: "G-54TRPXY0KK", // MEMO: Temporary measurement ID
  },
};

const nodeEnv = process.env.NODE_ENV;
const app = firebase.initializeApp(
  firebaseConfig[nodeEnv === "production" ? "production" : "development"]
);

const analytics = app.analytics();
const firestore = app.firestore();
const functions = app.functions();

if (nodeEnv === "development") {
  firestore.settings({
    host: `localhost:${firebaseJson.emulators.firestore.port}`,
    ssl: false,
  });
  functions.useEmulator("localhost", firebaseJson.emulators.functions.port);
}

export const collectionName =
  process.env.REACT_APP_NETWORK_NAME == "mainnet" ? "nft_production" : "nft_staging";

export { analytics, firestore, functions };
