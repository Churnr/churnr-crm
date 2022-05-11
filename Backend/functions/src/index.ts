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

admin.initializeApp();

const pubsubClient = new PubSub();
const app = express();
const slackApp = express();

// Enables middleware for slackApp endpoints
app.use(express.json());
app.use(middleware.validateFirebaseIdToken);
slackApp.use(middleware.validateSlackSigningSecret);

const signingSecret: string | (() => PromiseLike<string>) =
 process.env.SLACK_SIGNING_SECRET as string | (() => PromiseLike<string>);
const expressReceiver = new ExpressReceiver({
  signingSecret: signingSecret,
  endpoints: "/events",
  processBeforeResponse: true,
});
const apps = new App({
  receiver: expressReceiver,
  token: process.env.SLACK_BOT_TOKEN,
  processBeforeResponse: true,

});

console.log(apps.error);

apps.command("/echo-from-firebase", async ({command, ack, say}) => {
  // Acknowledge command request
  await ack();

  // Requires:
  // Add chat:write scope + invite the bot user to the channel you run this command
  // Add chat:write.public + run this command in a public channel
  await say(`You said "${command.text}"`);
});

exports.slack = functions.https.onRequest(expressReceiver.app);

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

/**
 * Test endpoint
*/
slackApp.post("/halloworld", async (req, res) => {
  // try {
  //   const response = slackUtils.slackAcknowledgmentResponse(req, jsonSlackExample);
  //   functions.logger.error(response);
  //   res.status(200).send(response);
  // } catch (error) {
  //   functions.logger.error(error);
  // }
});
slackApp.get("/halloworld1", async (req, res) => {
  res.status(200).send("DER HUL IGENNEM!");
});

exports.app = functions.https.onRequest(app);
exports.slackApp = functions
    .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(slackApp);

