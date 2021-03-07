import firebase from "firebase";

import firebaseJson from "../../../../firebase.json";

const firebaseConfig = {
  apiKey: "AIzaSyDThONNzesmZYFpnXvIoSBTn6eIm69I4tQ",
  authDomain: "chocomint-prod.firebaseapp.com",
  projectId: "chocomint-prod",
  storageBucket: "chocomint-prod.appspot.com",
  messagingSenderId: "464874047282",
  appId: "1:464874047282:web:323cf0fc34b53c2e6ab92b",
  measurementId: "G-VZ4DF3ZNTH",
};

const app = firebase.initializeApp(firebaseConfig);

const firestore = app.firestore();
const functions = app.functions();

if (process.env.NODE_ENV === "development") {
  firestore.settings({
    host: `localhost:${firebaseJson.emulators.firestore.port}`,
    ssl: false,
  });
  functions.useEmulator("localhost", firebaseJson.emulators.functions.port);
}

export const collectionName =
  process.env.REACT_APP_NETWORK_ID == "mainnet" ? "pairmints_production" : "pairmints_staging";

export { firestore, functions };
