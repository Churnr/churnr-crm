/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as reepayUtils from "../utils/reepayUtils";
import {PubSub} from "@google-cloud/pubsub";
// import * as cors from "cors";
import * as middleware from "../middleware/middleware";
import * as slackUtils from "../utils/slackUtils";
import * as express from "express";
admin.initializeApp();

const pubsubClient = new PubSub();
const app = express();
const slackApp = express();

// Enables middleware for slackApp endpoints
app.use(express.json());
app.use(middleware.validateFirebaseIdToken);
// Enables middleware for slackApp endpoints
slackApp.use(middleware.validateSlackSigningSecret);


// eslint-disable-next-line require-jsdoc
// function getKeyByValue(object:any, value:string) {
//   for (const [key, values] of Object.entries(object)) {
//     if (key == value) {
//       return values;
//     }
//   }
// }
/**
 * Fetches invoices in dunning state from paymentGateway
 * Reepay ready
 */
export const fetchDunningInvoices =
 functions.region("europe-west2").pubsub.schedule("0 23 * * *")
     .timeZone("Europe/Copenhagen").onRun(async (context) => {
       const companys:any = await firestoreUtils.getCompanys();
       // const urls: any = await firestoreUtils.getDunningUrlsFromFirestore();
       for (const company of companys) {
         const companyName :string = company.companyName;
         const companyApykey :string = company.apiKey;
         const paymentGateway : string = company.paymentGateway;
         // const url = getKeyByValue(urls, paymentGateway) as string;

         if (paymentGateway === "Reepay") {
           reepayUtils.reepayLogic(companyApykey, companyName);
         }
       }
       return null;
     }
     );

// Kig på publishmessage istedet for publish
/** @deprecated */
slackApp.post("/createcompany", async (req, res) => {
  const data = Buffer.from(JSON.stringify(req.body));
  await pubsubClient.topic("create-company").publish(data);
  res.status(200).send("Handling process: Create Company");
});

exports.createCompany = functions.runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .pubsub.topic("create-company").onPublish(async (message) => {
      const data = JSON.parse(Buffer.from(message.data, "base64").toString("utf-8"));

      try {
        const company = slackUtils.retriveCompanyInfoFromSlackReq(data.text);
        firestoreUtils.addCompanyToFirestore(company, company.companyName);
        slackUtils.sendMessageToChannel(`${company.companyName} was added to the company database.`, "C03CJBT6AE5");
      } catch (error) {
        functions.logger.error("pubsub topic(create-company): ", error);
      }
    });

/**
 * Test endpoint
*/
slackApp.get("/halloworld", async (req, res) => {
  const data = Buffer.from(JSON.stringify(req.body));
  await pubsubClient.topic("halloworld").publish(data);
  res.status(200).send("Handling process: Create Company");
  // const _url = "https://api.reepay.com/v1/list/invoice?size=100&state=dunning";
});

export const testing = functions.region("europe-west2").pubsub.schedule("0 23 * * *")
    .timeZone("Europe/Copenhagen").onRun(async (context) => {
      try {
        const list = await firestoreUtils.getDocIdsFromCompanyCollection("Lalatoys", "ActivDunning");
        for (const id of list) {
          firestoreUtils.deleteAndMoveDoc("Lalatoys", "ActivDunning", "ActiveDunning", id);
        }
      } catch (error) {
        functions.logger.error("pubsub topic(halloworld): ", error);
      }
    });

exports.app = functions.https.onRequest(app);
exports.slackApp = functions
    .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(slackApp);

