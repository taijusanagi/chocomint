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

const db = app.firestore();

if (process.env.NODE_ENV === "development") {
  db.settings({
    host: `localhost:${firebaseJson.emulators.firestore.port}`,
    ssl: false,
  });
}

export const collectionName =
  process.env.NODE_ENV == "development"
    ? "pairmints_localhost"
    : process.env.REACT_APP_NETWORK_ID == "localhost"
    ? "pairmints_localhost"
    : process.env.REACT_APP_NETWORK_ID == "rinkeby"
    ? "pairmints_staging"
    : process.env.REACT_APP_NETWORK_ID == "mainnet"
    ? "pairmints_production"
    : "pairmints_localhost";

export { db };
