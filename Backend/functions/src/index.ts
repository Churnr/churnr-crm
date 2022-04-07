import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import * as sendGrid from "@sendgrid/mail";
import * as customType from "../types/types";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as httpUtils from "../utils/httpUtils";
import * as cors from "cors";
admin.initializeApp();

const corsHandler = cors({
  origin: [
    'http://localhost:3000',
  ],
})


// const validateFirebaseIdToken = async (req:any, res:any, next:any) => {
//   functions.logger.log("Check if request is authorized with Firebase ID token");

//   if ((!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) &&
//       !(req.cookies && req.cookies.__session)) {
//     functions.logger.error(
//         "No Firebase ID token was passed as a Bearer token in the Authorization header.",
//         "Make sure you authorize your request by providing the following HTTP header:",
//         "Authorization: Bearer <Firebase ID Token>",
//         "or by passing a \"__session\" cookie."
//     );
//     res.status(403).send("Unauthorized");
//     return;
//   }

//   let idToken;
//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
//     functions.logger.log("Found \"Authorization\" header");
//     // Read the ID Token from the Authorization header.
//     idToken = req.headers.authorization.split("Bearer ")[1];
//   } else if (req.cookies) {
//     functions.logger.log("Found \"__session\" cookie");
//     // Read the ID Token from cookie.
//     idToken = req.cookies.__session;
//   } else {
//     // No cookie
//     res.status(403).send("Unauthorized");
//     return;
//   }

//   try {
//     const decodedIdToken = await admin.auth().verifyIdToken(idToken);
//     functions.logger.log("ID Token correctly decoded", decodedIdToken);
//     req.user = decodedIdToken;
//     next();
//     return;
//   } catch (error) {
//     functions.logger.error("Error while verifying Firebase ID token:", error);
//     res.status(403).send("Unauthorized");
//     return;
//   }
// };
// app.use(validateFirebaseIdToken);

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

      const invoiceIdArray =
      await firestoreUtils.getInvoiceIdsFromCollection("ActiveDunning");

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


export const helloWorld = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const token:any = req.headers.authorization
      const userData:any = await (await admin.auth().verifyIdToken(token)).uid;
      console.log(userData) // here we have uid of verified user
      console.log(token)
      const invoiceIdArray:Array<string> = [];
      const dbInvoice = await admin.firestore()
          .collection("test").listDocuments();
      for (const s of dbInvoice) {
        const QueryDocumentSnapshot = await s.get();
        const data: any = QueryDocumentSnapshot.data();
        const dataID: string = data.test; 
        console.log(dataID)
        invoiceIdArray.push(dataID);
      }
      // check user access or do whatever we need here
      res.json(invoiceIdArray);
    } catch (e) {
      console.log("NOT ALLOWED MYMAN")
      res.status(403).json("NOT ALLOWED MYMAN")
    }
  })
});


export const helloWorld2 = functions.https.onRequest(async (req, res) => {
  const invoiceIdArray:Array<string> = [];
  const dbInvoice = await admin.firestore()
      .collection("tes").listDocuments();
  for (const s of dbInvoice) {
    const QueryDocumentSnapshot = await s.get();
    const data: any = QueryDocumentSnapshot.data();
    const dataID: string = data.id;
    invoiceIdArray.push(dataID);
  }




     // check user access or do whatever we need here
     const jsonExample = {
       "essential": [
         "store",
         -1509028413.9262555,
         "perfectly",
         [
           -1808610733,
           false,
           "keep",
           -1020454813,
           false,
           "movie",
         ],
         true,
         {
           "further": "consider",
           "policeman": "red",
           "concerned": "alphabet",
           "passage": "one",
           "wave": false,
           "picture": 1698654544.095453,
         },
       ],
       "ability": "other",
       "policeman": 31538672,
       "development": 765898294,
       "no": true,
       "occasionally": "exchange",
     };
     res.json(jsonExample);

 });
 