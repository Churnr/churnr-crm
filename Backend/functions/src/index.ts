/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as reepayUtils from "../utils/reepayUtils";
import {PubSub} from "@google-cloud/pubsub";
// import * as cors from "cors";
// import * as middleware from "../middleware/middleware";
import * as slackUtils from "../utils/slackUtils";
import * as express from "express";

admin.initializeApp();

const pubsubClient = new PubSub();
const app = express();
const slackApp = express();

// Enables middleware for slackApp endpoints
app.use(express.json());
// app.use(middleware.validateFirebaseIdToken);
// Enables middleware for slackApp endpoints
// slackApp.use(middleware.validateSlackSigningSecret);


// eslint-disable-next-line require-jsdoc
function getKeyByValue(object:any, value:string) {
  for (const [key, values] of Object.entries(object)) {
    if (key == value) {
      return values;
    }
  }
}
/**
 * Fetches invoices in dunning state from paymentGateway
 * Reepay ready
 */
app.get("/getdunning", async (req, res) => {
  const customers:any = await firestoreUtils.getCustomers();
  const urls: any = await firestoreUtils.getDunningUrlsFromFirestore();
  for (const customer of customers) {
    const customerName :string = customer.companyName;
    const customerApiKey :string = customer.apiKey;
    const paymentGateway : string = customer.paymentGateway;
    const url = getKeyByValue(urls, paymentGateway) as string;

    if (paymentGateway === "Reepay") {
      const options = reepayUtils.createHttpOptionsForReepay(customerApiKey);
      const contentArray: Array<any> =
          await reepayUtils.retriveReepayList(url, options);
      await reepayUtils.addNewReepayInvoicesToCustomerInFirestore(contentArray, customerName);
    }
  }
  res.status(201).send("ay okay");
});

// Kig på publishmessage istedet for publish
/** @deprecated */
slackApp.post("/createcustomer", async (req, res) => {
  const data = Buffer.from(JSON.stringify(req.body));
  await pubsubClient.topic("create-customer").publish(data);
  res.status(200).send("Handling process: Create Customer");
});

exports.createCustomer = functions.runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .pubsub.topic("create-customer").onPublish(async (message) => {
      const data = JSON.parse(Buffer.from(message.data, "base64").toString("utf-8"));

      try {
        const customer = slackUtils.retriveCustomerInfoFromSlackReq(data.text);
        firestoreUtils.addCustomerToFirestore(customer, customer.companyName);
        slackUtils.sendMessageToChannel(`${customer.companyName} was added to the customer database.`, "C03CJBT6AE5");
      } catch (error) {
        functions.logger.error("pubsub topic(create-customer): ", error);
      }
    });

/**
 * Test endpoint
*/
slackApp.get("/halloworld", async (req, res) => {
  res.status(200).send("fedt!");
  // const _url = "https://api.reepay.com/v1/list/invoice?size=100&state=dunning";
});

exports.app = functions.https.onRequest(app);
exports.slackApp = functions
    .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(slackApp);

