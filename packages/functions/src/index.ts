import * as functions from "firebase-functions";

export const addChoco = functions.https.onCall((data, context) => {
  console.log(data);
  //   const { chainId } = request.body;
  //   console.log(chainId);
  //   response.send("Hello from Firebase!");
});
