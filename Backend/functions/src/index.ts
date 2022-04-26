/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import * as sendGrid from "@sendgrid/mail";
import * as customType from "../types/types";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as httpUtils from "../utils/httpUtils";
import {PubSub} from "@google-cloud/pubsub";
// import * as cors from "cors";
import * as middleware from "../middleware/middleware";
import * as slackUtils from "../utils/slackUtils";
import * as express from "express";
const pubsubClient = new PubSub();
const app = express();
const slackApp = express();
slackApp.use(middleware.validateSlackSigningSecret);
admin.initializeApp();
// const options2: cors.CorsOptions = {
//   origin: "http://localhost:3000",
// };
// app.use(cors(options2));
app.use(express.json());
// app.use(middleware.validateFirebaseIdToken);

app.get("/getdunning", async (req, res) => {
  const customers:any = await firestoreUtils.getCustomers();
  for (const customer of customers) {
    const customerName :any = customer.companyName;
    const customerApiKey :any = customer.apiKey;
    console.log(customerName, customerApiKey);

    const _url = "https://api.reepay.com/v1/list/invoice?size=100&state=dunning";

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

    const contentArray: Array<any> =
    await httpUtils.retriveReepayList(_url, options);

    for (const dunningInvoices of contentArray) {
      if (invoiceIdArray.indexOf(dunningInvoices.id) == -1) {
        await admin.firestore()
            .collection("Customers")
            .doc(customerName)
            .collection("ActiveDunning")
            .add(dunningInvoices);
      }
    }
  }
  res.status(201).send("ay okay");
});
// Create new user s
/** @deprecated */
slackApp.post("/createcustomer", async (req, res) => {
  const data = Buffer.from(JSON.stringify(req.body));
  await slackUtils.slackAcknowledgmentResponse(req, "Request recived");
  await pubsubClient.topic("create-customer").publish(data);
  res.status(200).send("Handling process: Create Customer");
});

exports.createCustomer = functions.pubsub.topic("create-customer").onPublish(async (message) => {
  const data = JSON.parse(Buffer.from(message.data, "base64").toString("utf-8"));
  try {
    const customer = await slackUtils.retriveCustomerInfoFromSlackReq(data.text);
    await firestoreUtils.addCustomerToFirestore(customer, customer.companyName);
  } catch (error) {
    functions.logger.error("pubsub topic: create-customer: ", error);
  }
});

slackApp.post("/halloworld", async (req, res) => {
  const payload = {
    text: "nice...",
    channel: "C03CJBT6AE5",
  };

  try {
    await slackUtils.requestSlack("POST", "chat.postMessage", payload);
    res.status(200).send("ay Okay");
  } catch (error) {
    functions.logger.warn("slackApp/halloworld", error);
    res.status(503).send("Service unavailable for now");
  }
});

exports.app = functions.https.onRequest(app);
exports.slackApp = functions
    .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(slackApp);

