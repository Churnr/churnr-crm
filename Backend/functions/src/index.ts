/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as customType from "../types/types";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as httpUtils from "../utils/httpUtils";
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
    console.log(`what ${key}: ${values}`);
    if (key == value) {
      return values;
    }
  }
}
app.get("/getdunning", async (req, res) => {
  const customers:any = await firestoreUtils.getCustomers();
  const urls: any = await firestoreUtils.getDunningUrlsFromFirestore();
  console.log(typeof urls);
  for (const customer of customers) {
    const customerName :any = customer.companyName;
    const customerApiKey :any = customer.apiKey;
    const paymentGateway : any = customer.paymentGateway;

    const url = getKeyByValue(urls, paymentGateway) as string;
    console.log("WORKS????", url);
    // const _url = "https://api.reepay.com/v1/list/invoice?size=100&state=dunning";
    const headers: customType.headers = {
      "Content-Type": "application/json",
      "Authorization": `Basic ${customerApiKey}`,
    };

    const options: customType.options = {
      method: "GET",
      headers: headers,
      json: true,
    };

    const invoiceIdArray =
    await firestoreUtils.getInvoiceIdsFromCompanyCollection(customerName);
    console.log(invoiceIdArray);

    const contentArray: Array<any> =
    await httpUtils.retriveReepayList(url, options);

    for (const dunningInvoices of contentArray) {
      if (invoiceIdArray.indexOf(dunningInvoices.id) == -1) {
        await admin.firestore()
            .collection("Customers")
            .doc(customerName)
            .collection("ActiveDunning")
            .doc(dunningInvoices.id).set(dunningInvoices);
      }
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

        const payload = {
          text: `${customer.companyName} was added to the customer database.`,
          channel: "C03CJBT6AE5",
        };
        slackUtils.requestSlack("POST", "chat.postMessage", payload);
      } catch (error) {
        functions.logger.error("pubsub topic(create-customer): ", error);
      }
    });

slackApp.get("/halloworld", async (req, res) => {
  const customers:any = await firestoreUtils.getCustomers();
  for (const customer of customers) {
    const customerName :any = customer.companyName;
    const customerApiKey :any = customer.apiKey;
    const paymentGateway : any = customer.paymentGateway;

    firestoreUtils.getInvoiceIdsFromCompanyCollection(customerName);
  }
  res.status(200).send("fedt!");
});

exports.app = functions.https.onRequest(app);
exports.slackApp = functions
    .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(slackApp);

