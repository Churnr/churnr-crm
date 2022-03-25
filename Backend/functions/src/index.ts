import * as functions from "firebase-functions";
import * as admin from "firebase-admin"
import fetch from "node-fetch";
// import { doc, setDoc } from "firebase/firestore"; 

admin.initializeApp();

exports.fetchInvoices = functions.https.onRequest(async (req, res) => {
    const _url = 'https://api.reepay.com/v1/list/invoice?size=10&state=dunning'
    const _headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.API_KEY_LALATOYS}`
    }
    const options = {
        method: 'GET',
        headers: _headers,
        json: true
    };

    await fetch(_url, options)
    .then(respons => respons.json())
    .then(respons => {  
        const ress = respons
        console.log(ress)
    });
    res.json({result: `Message with ID: added.`});
  });
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
 export const helloWorld = functions.https.onRequest((request, response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from");
});

// FUNCTION #1 Filtering and checking - scheduler
//      1. fetch API data
//      2. filtrér data (invoice id)
//      3. Check if same customer, but different invoice ids
//      4. Cross reference with Current invoice collection and Reepay API
//      5. Save remaining data

// F#1 -> F#2
// FUNCTION #2 Updating the active dunning list (not failed) - scheduler
//      1.
//      2. 

