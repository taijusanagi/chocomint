const functions = require("firebase-functions");

// export interface Choco {
//     name: string;
//     image: string;
//     description: string;
//   }

//   export interface Pairmints {
//     chainId: number;
//     contractAddress: string;
//     metadataIpfsHash: string;
//     value: string;
//     recipient: string;
//     root: string;
//     proof: string[];
//     signature: string;
//     creator: string;
//     choco: Choco;
//   }

exports.addPairmint = functions.https.onRequest((request, response) => {
  const { chainId } = request.body;
  console.log(chainId);
  response.send("Hello from Firebase!");
});
