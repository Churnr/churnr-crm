/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import * as sendGrid from "@sendgrid/mail";
import * as customType from "../types/types";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as httpUtils from "../utils/httpUtils";
// import * as cors from "cors";
// import * as middleware from "../middleware/middleware";
import {requestSlack} from "../utils/slackUtils";
import * as express from "express";
const app = express();
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
app.post("/createcustomer", async (req, res) => {
  try {
    const customer: customType.customer = {
      companyName: req.body["companyName"],
      paymentGateway: req.body["paymentGateway"],
      apiKey: req.body["apiKey"],
      emailGateway: req.body["emailGateway"],
      emailGatewayUser: req.body["emailGatewayUser"],
      emailGatewayPassword: req.body["emailGatewayPassword"],
      contactPerson: req.body["contactPerson"],
      contactPersonEmail: req.body["contactPersonEmail"],
      flowEmails: req.body["flowEmails"],
      flowCalls: req.body["flowCalls"],
    };
    const newDoc = await firestoreUtils.
        addCustomerToFirestore(customer, req.body["companyName"]);
    res.status(201).send(`Created a new user: ${newDoc}`);
  } catch (error) {
    console.log(error);
    res.status(400).send("Body is missing content");
  }
});

app.post("/halloworld", async (req, res) => {
  const payload = {
    text: "nice...",
    channel: "C03CJBT6AE5",
  };
  const response = await requestSlack("POST", "chat.postMessage", payload);
  functions.logger.log("response", response);
  res.status(200).send("ay Okay");
});

exports.halloworld = functions.runWith({secrets: ["SLACK_TOKEN"]})
    .https.onRequest(async (req, res) => {
      const payload = {
        text: "nice...",
        channel: "C03CJBT6AE5",
      };
      const response = await requestSlack("POST", "chat.postMessage", payload);
      functions.logger.log("response", response);
      res.status(200).send("ay Okay");
    });

exports.app = functions.https.onRequest(app);


