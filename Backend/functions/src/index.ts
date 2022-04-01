import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import * as sendGrid from "@sendgrid/mail";
import * as customType from "../types/types";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as httpUtils from "../utils/httpUtils";
admin.initializeApp();
// const db = getFirestore(app);
// const citiesRef = collection(db, "cities");
// FUNCTION #1 Filtering and checking - scheduler
//      1. fetch API data - DONE
//      2. filtrér data (invoice id)
//      3. Check if same customer, but different invoice ids
//      4. Cross reference with Current invoice collection and Reepay API
//      5. Save remaining data
export const fetchDunningInvoices =
functions.region("europe-west2").pubsub.schedule("0 23 * * *")
    .timeZone("Europe/London").onRun(async (context) => {
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

      const invoiceIdArray = await firestoreUtils.getInvoiceIdsFromCollection("ActiveDunning");

      const contentArray: Array<any> =
      await httpUtils.retriveReepayList(_url, options);

      for (const dunningInvoices of contentArray) {
        if (invoiceIdArray.indexOf(dunningInvoices.id) == -1) {
          await admin.firestore().collection("ActivDunning")
              .add(dunningInvoices);
        }
      }

      return null;
    });


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld =
//   functions.pubsub.schedule("every 1 minutes").onRun((context) => {
//     const API_KEY: string = process.env.SENDGRIDKEY!;
//     const TEMPLATE_ID: string = process.env.SENDGRIDTEMPLATE!;
//     sendGrid.setApiKey(API_KEY);
//     const msg: sendGrid.MailDataRequired = {
//       "to": "c.k.foldager@protonmail.com",
//       "from": "c.k.foldager@gmail.com",
//       "subject": "TEST",
//       "templateId": TEMPLATE_ID,
//     };
//     functions.logger.log(TEMPLATE_ID);
//     sendGrid.send(msg);
//     return null;
//   });

// F#1 -> F#2
// FUNCTION #2 Updating the active dunning list (not failed) - scheduler
//      1.
//      2.


// export const getData2 = functions.https.onRequest(async (req, res) => {
//   let invoiceIdArray:Array<string> = []
//   const dbInvoice = await admin.firestore()
//    .collection("ActivDunning").listDocuments()
//   for (const s of dbInvoice) {
//     const QueryDocumentSnapshot = await s.get()
//     const data: any = QueryDocumentSnapshot.data()
//     const dataID: string = data.id
//     // console.log(dataID)
//     invoiceIdArray.push(dataID)
//   }
//   console.log(invoiceIdArray.length)
//   res.json({ result: "Invoices fetched ." });
// });
