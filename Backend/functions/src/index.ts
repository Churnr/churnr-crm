/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as reepayUtils from "../utils/reepayUtils";
// import * as sendgridUtils from "../utils/sendgridUtils";
import {PubSub} from "@google-cloud/pubsub";
// import * as cors from "cors";
import * as middleware from "../middleware/middleware";
import * as slackUtils from "../utils/slackUtils";
import * as express from "express";
// import {SocketModeClient} from "@slack/socket-mode";
// import {WebClient} from "@slack/web-api";
import {App, ExpressReceiver} from "@slack/bolt";
import "dotenv/config";
// const config = functions.config();
// const config = process.env;
admin.initializeApp();

const pubsubClient = new PubSub();
const apps = express();
const slackApp = express();

// Enables middleware for slackApp endpoints
apps.use(express.json());
apps.use(middleware.validateFirebaseIdToken);
slackApp.use(middleware.validateSlackSigningSecret);
const signingSecret: string | (() => PromiseLike<string>) =
 process.env.SLACK_SIGNING_SECRET as string | (() => PromiseLike<string>);
const expressReceiver = new ExpressReceiver({
  signingSecret: signingSecret,
  endpoints: "/events",
  processBeforeResponse: true,
});

const app = new App({
  receiver: expressReceiver,
  token: process.env.SLACK_BOT_TOKEN,
  processBeforeResponse: true,
});
// Handle a view_submission request
app.view("view_1", async ({ack, body, view, client, logger}) => {
  // Acknowledge the view_submission request
  await ack();

  // Do whatever you want with the input data -

  // Assume there's an input block with `block_1` as the block_id and `input_a`
  const email = view["state"]["values"]["input_c"].dreamy_input.value as string;
  const category = view["state"]["values"]["input_a"].dreamy_input.value as string;
  const company = view["state"]["values"]["input_b"].dreamy_input.value as string;
  if (email || company || category != undefined || "") {
    const customerObject = await firestoreUtils.getCustomerObjectBasedOnEmailFromCompany(company, email);
    const customerId = customerObject.handle;
    await firestoreUtils.updateActiveInvoiceWithActiveFlowVariables(company, customerId, category);
    const user = body["user"]["id"];
    // Message to send user
    const msg = `Customer flow activated with email: ${email} `;
    try {
      await client.chat.postMessage({
        channel: user,
        text: msg,
      });
    } catch (error) {
      logger.error(error);
    }
  } else {
    const user = body["user"]["id"];
    const msg = "Some of the variables were undefined";
    try {
      await client.chat.postMessage({
        channel: user,
        text: msg,
      });
    } catch (error) {
      logger.error(error);
    }
  }
});


app.command("/sendemail", async ({ack, body, client, logger}) => {
  // Acknowledge the command request
  await ack();

  try {
    // Call views.open with the built-in client
    await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: {
        type: "modal",
        // View identifier
        callback_id: "view_1",
        title: {
          type: "plain_text",
          text: "Churnr Activate Flow",
        },
        blocks: [
          {
            type: "input",
            block_id: "input_b",
            label: {
              type: "plain_text",
              text: "Company Name",
            },
            element: {
              type: "plain_text_input",
              action_id: "dreamy_input",
            },
          },
          {
            type: "input",
            block_id: "input_c",
            label: {
              type: "plain_text",
              text: "Email",
            },
            element: {
              type: "plain_text_input",
              action_id: "dreamy_input",
            },
          }, {
            type: "input",
            block_id: "input_a",
            label: {
              type: "plain_text",
              text: "Category",
            },
            element: {
              type: "plain_text_input",
              action_id: "dreamy_input",
            },
          },
        ],
        submit: {
          type: "plain_text",
          text: "Submit",
        },
      },
    });
  } catch (error) {
    logger.error(error);
  }
});

app.error(async (error) => {
  functions.logger.log("err", error);
});

app.command("/simon-say-hello", async ({command, ack, say}) => {
  await ack();

  await say(`You said "${command.text}"`);
});

export const slack = functions.runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .region("europe-west3")
    .https.onRequest(expressReceiver.app);
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

//  runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
exports.sendEmail = functions.
    pubsub.topic("send-email").onPublish(async (message) => {
      const data = JSON.parse(Buffer.from(message.data, "base64").toString("utf-8"));
      // const {event} = message.json;


      console.log(data);
      // try {
      //   const emailInfo = slackUtils.retriveSendEmailInfoFromSlackReq(data.text);
      //   const messageInfo = await sendgridUtils.sendEmail(emailInfo.companyName,
      //       emailInfo.customerId, emailInfo.templateId);
      //   const emailTo = await messageInfo[0];
      //   const message = await messageInfo[1];
      //   slackUtils.sendMessageToChannel(`${emailTo} has been sent an email.
      //   With this message ${message}`, "C03CJBT6AE5");
      // } catch (error) {
      //   functions.logger.error("pubsub topic(send-email): ", error);
      // }
    });

// SendEmail Schedular pubsub
// Retrive all Active Invoices from firebase with activeflow == true - Done
// For loop over Array of Active Invoices - Done
// Get current date - Done
// get emailcount and start date
// Check if current date is 1 day from start date if email count == 0
// If true send email
// set lastEmailedSent to current date
// Check if current date is 3 days from last email sent and email count != 7
// If true send email
// set last email sent to current date
// Else set flow status to False
/**
 * Test endpoint
*/
slackApp.get("/halloworld", async (req, res) => {
  const data = await firestoreUtils.getInvoicesObjectBasedOnStatusFromCompany("LALA");
  const today = new Date();
  const date = today.getDate()+"-"+(today.getMonth()+1)+"-"+today.getFullYear();
  console.log(today + "today" + date);

  for (const invoice of data) {
    console.log(invoice);
  }
  // try {
  //   const response = slackUtils.slackAcknowledgmentResponse(req, jsonSlackExample);
  //   functions.logger.error(response);
  //   res.status(200).send(response);
  // } catch (error) {
  //   functions.logger.error(error);
  // }
  res.status(200).send("DER HUL IGENNEM!");
});
slackApp.get("/activeflow", async (req, res) => {
  const email = "awdwad";
  const company = "LALA";
  const invoiceError = "YES";
  const customerObject = await firestoreUtils.getCustomerObjectBasedOnEmailFromCompany(company, email);
  const customerId = customerObject.handle;
  await firestoreUtils.updateActiveInvoiceWithActiveFlowVariables(company, customerId, invoiceError);
  res.status(200).send("Invoice Was Updated");
});


exports.app = functions.https.onRequest(apps);
exports.slackApp = functions
    .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(slackApp);


