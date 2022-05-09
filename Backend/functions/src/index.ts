/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as reepayUtils from "../utils/reepayUtils";
import * as sendgridUtils from "../utils/sendgridUtils";
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
// slackApp.use(middleware.validateSlackSigningSecret);


/**
 * Fetches invoices in dunning state from paymentGateway
 * Reepay ready
 */
export const fetchDunningInvoices =
  functions.region("europe-west2").pubsub.schedule("0 23 * * *")
      .timeZone("Europe/Copenhagen").onRun(async (context) => {
        const companys: any = await firestoreUtils.getCompanys();
        // const urls: any = await firestoreUtils.getDunningUrlsFromFirestore();
        for (const company of companys) {
          const companyName: string = company.companyName;
          const companyApykey: string = company.apiKey;
          const paymentGateway: string = company.paymentGateway;

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

// Kig på publishmessage istedet for publish
/** @deprecated */
slackApp.post("/sendEmail", async (req, res) => {
  const data = Buffer.from(JSON.stringify(req.body));
  await pubsubClient.topic("send-email").publish(data);
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


exports.sendEmail = functions.runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .pubsub.topic("send-email").onPublish(async (message) => {
      const data = JSON.parse(Buffer.from(message.data, "base64").toString("utf-8"));

      try {
        const emailInfo = slackUtils.retriveSendEmailInfoFromSlackReq(data.text);
        const messageInfo = await sendgridUtils.sendEmail(emailInfo.companyName,
            emailInfo.customerId, emailInfo.templateId);
        const emailTo = await messageInfo[0];
        const message = await messageInfo[1];
        slackUtils.sendMessageToChannel(`${emailTo} has been sent an email.
        With this message ${message}`, "C03CJBT6AE5");
      } catch (error) {
        functions.logger.error("pubsub topic(send-email): ", error);
      }
    });


const jsonSlackExample:object = {
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "New request",
        "emoji": true,
      },
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "<https://example.com|View request>",
      },
    },
    {
      "type": "input",
      "element": {
        "type": "static_select",
        "placeholder": {
          "type": "plain_text",
          "text": "Select an item",
          "emoji": true,
        },
        "options": [
          {
            "text": {
              "type": "plain_text",
              "text": "*this is plain_text text*",
              "emoji": true,
            },
            "value": "value-0",
          },
          {
            "text": {
              "type": "plain_text",
              "text": "*this is plain_text text*",
              "emoji": true,
            },
            "value": "value-1",
          },
          {
            "text": {
              "type": "plain_text",
              "text": "*this is plain_text text*",
              "emoji": true,
            },
            "value": "value-2",
          },
        ],
        "action_id": "static_select-action",
      },
      "label": {
        "type": "plain_text",
        "text": "Label",
        "emoji": true,
      },
    },
    {
      "type": "input",
      "element": {
        "type": "plain_text_input",
        "action_id": "plain_text_input-action",
      },
      "label": {
        "type": "plain_text",
        "text": "Label",
        "emoji": true,
      },
    },
    {
      "type": "input",
      "element": {
        "type": "plain_text_input",
        "action_id": "plain_text_input-action",
      },
      "label": {
        "type": "plain_text",
        "text": "Label",
        "emoji": true,
      },
    },
  ],
};
/**
 * Test endpoint
*/
slackApp.get("/halloworld", async (req, res) => {
  slackUtils.slackAcknowledgmentResponse(req, jsonSlackExample);
  res.status(200).send("DER HUL IGENNEM!");
});

exports.app = functions.https.onRequest(app);
exports.slackApp = functions
// .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(slackApp);

