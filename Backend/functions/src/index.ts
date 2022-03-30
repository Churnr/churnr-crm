import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as customType from "../types/types";
import * as utils from "../utils/utils";
// import { doc, setDoc } from "firebase/firestore";
admin.initializeApp();

// FUNCTION #1 Filtering and checking - scheduler
//      1. fetch API data - DONE
//      2. filtrér data (invoice id)
//      3. Check if same customer, but different invoice ids
//      4. Cross reference with Current invoice collection and Reepay API
//      5. Save remaining data
exports.fetchDunningInvoices = functions.https.onRequest(async (req, res) => {
  const _url = "https://api.reepay.com/v1/list/invoice?size=100&state=dunning";

  const headers: customType.headers = {
    "Content-Type": "application/json",
    "Authorization": `Basic ${process.env.API_KEY_LALATOYS}`,
  };

  const options: customType.options = {
    method: "GET",
    headers: headers,
    json: true,
  };

  const contentArray: Array<any> =
  await utils.retriveReepayList(_url, options);
  // const writeResult = await admin.firestore()
  // .collection('ActivDunning').add(content_array)
  for (const dunningInvoices of contentArray) {
    await admin.firestore().collection("ActivDunning").add(dunningInvoices);
  }

  res.json({result: "Invoices fetched ."});
});


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from");
});


// F#1 -> F#2
// FUNCTION #2 Updating the active dunning list (not failed) - scheduler
//      1.
//      2.

