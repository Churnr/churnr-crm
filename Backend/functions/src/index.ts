import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import * as sendGrid from "@sendgrid/mail";
// import * as customType from "../types/types";
// import * as firestoreUtils from "../utils/firestoreUtils";
// import * as httpUtils from "../utils/httpUtils";
// import * as cors from "cors";
// import * as middleware from "../middleware/middleware";
import * as express from "express";
const app = express();
admin.initializeApp();
// const options2: cors.CorsOptions = {
//   origin: "http://localhost:3000",
// };
// app.use(cors(options2));
app.use(express.json());
// app.use(middleware.validateFirebaseIdToken);

// const db = getFirestore(app);
// const citiesRef = collection(db, "cities");
// FUNCTION #1 Filtering and checking - scheduler
//      1. fetch API data - DONE
//      2. filtrér data (invoice id)
//      3. Check if same customer, but different invoice ids
//      4. Cross reference with Current invoice collection and Reepay API
//      5. Save remaining data
// export const fetchDunningInvoices =
// functions.region("europe-west2").pubsub.schedule("0 23 * * *")
//     .timeZone("Europe/Copenhagen").onRun(async (context) => {
//       const _url = "https://api.reepay.com/v1/list/invoice?size=100&state=dunning";

//       const headers: customType.headers = {
//         "Content-Type": "application/json",
//         "Authorization": `Basic ${process.env.API_KEY_LALATOYS}`,
//       };

//       const options: customType.options = {
//         method: "GET",
//         headers: headers,
//         json: true,
//       };

//       const invoiceIdArray =
//       await firestoreUtils.getInvoiceIdsFromCollection("ActiveDunning");

//       const contentArray: Array<any> =
//       await httpUtils.retriveReepayList(_url, options);

//       for (const dunningInvoices of contentArray) {
//         if (invoiceIdArray.indexOf(dunningInvoices.id) == -1) {
//           await admin.firestore().collection("ActivDunning")
//               .add(dunningInvoices);
//         }
//       }

//       return null;
//     });

// export const helloWorld = functions.https.onRequest(async (req, res) => {
//   console.log("not working");

//   const invoiceIdArray:Array<string> = [];
//   const dbInvoice = await admin.firestore()
//       .collection("test").listDocuments();
//   for (const s of dbInvoice) {
//     const QueryDocumentSnapshot = await s.get();
//     const data: any = QueryDocumentSnapshot.data();
//     const dataID: string = data.test;
//     console.log(dataID);
//     invoiceIdArray.push(dataID);
//   }
//   // check user access or do whatever we need here
//   res.json(invoiceIdArray);
// });
app.post("/helloWorld2", (req:functions.Request<any>,
    res:functions.Response<any>) => {
  res.json("Hello World");
});

exports.app = functions.https.onRequest(app);
