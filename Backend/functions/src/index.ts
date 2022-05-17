/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getInvoicesObjectBasedOnStatusFromCompany,
  getFieldValueFromComapnyInFirestore,
  getCustomerFromFirestore,
  updateInvoiceEmailLastSendValue,
  getCompanys,
  updateInvoiceEmailCountValue,
  updateInvoiceActiveFlowValue,
  retriveCustomersDocDataFromCompany,
  retriveDatasFromDocData,
  retriveActiveInvoicesDocDataFromCompany,
} from "../utils/firestoreUtils";
import * as reepayUtils from "../utils/reepayUtils";
// import * as sendgridUtils from "../utils/sendgridUtils";
import {PubSub} from "@google-cloud/pubsub";
import * as cors from "cors";
import * as middleware from "../middleware/middleware";
import {slackAppFunctions} from "../utils/slackUtils";
import {emailMessage} from "../utils/sendgridUtils";
import * as express from "express";
// import {send} from "@sendgrid/mail";
// import {SocketModeClient} from "@slack/socket-mode";
// import {WebClient} from "@slack/web-api";
import "dotenv/config";
import {Dunning, ActiveDunning, Retained} from "../types/interface";
// const config = functions.config();
// const config = process.env;
admin.initializeApp();
const corsHandler = cors();
const pubsubClient = new PubSub();
const apps = express();
const slackApp = express();

// Enables middleware for slackApp endpoints
apps.use(corsHandler);
apps.use(express.json());
apps.use(middleware.validateFirebaseIdToken);
slackApp.use(corsHandler);
// slackApp.use(middleware.validateSlackSigningSecret);

// .runWith({secrets: ["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"]})
export const slack = functions
    .region("europe-west3")
    .https.onRequest(slackAppFunctions().app);
/**
 * Fetches invoices in dunning state from paymentGateway
 * Reepay ready
 */
export const fetchDunningInvoices =
  functions.region("europe-west2").pubsub.schedule("0 23 * * *")
      .timeZone("Europe/Copenhagen").onRun(async (context) => {
        const companys: any = await getCompanys();
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

// exports.createCompany = functions.runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
//     .pubsub.topic("create-company").onPublish(async (message) => {
//       const data = JSON.parse(Buffer.from(message.data, "base64").toString("utf-8"));

//       try {
//         const company = retriveCompanyInfoFromSlackReq(data.text);
//         addCompanyToFirestore(company, company.companyName);
//         sendMessageToChannel(`${company.companyName} was added to the company database.`, "C03CJBT6AE5");
//       } catch (error) {
//         functions.logger.error("pubsub topic(create-company): ", error);
//       }
//     });

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
// get emailcount and start date - Done
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
  const companyName = "LALA";
  const data = await getInvoicesObjectBasedOnStatusFromCompany(companyName);
  const templateMap = await getFieldValueFromComapnyInFirestore(companyName, "templateMap");
  const companyEmail = await getFieldValueFromComapnyInFirestore(companyName, "emailGatewayUser");
  const today = new Date();
  for (const invoice of data) {
    const customer = await getCustomerFromFirestore("LALA", invoice.invoice.customer);
    const emailCount:number = invoice.emailCount;
    const emailMsg = emailMessage(customer.email, companyEmail,
        customer.first_name, templateMap[invoice.invoceError][invoice.emailCount]);
    if (emailCount == 0) {
      const flowStartDate = (invoice.flowStartDate).toDate();
      const DifferenceInTime = (today.getTime() - flowStartDate.getTime()) / (1000 * 3600 * 24);
      if (DifferenceInTime >= 1) {
        // send(emailMsg);
        functions.logger.log("EmailCount 0: IT WORKS!!" + JSON.stringify(emailMsg));
        updateInvoiceEmailCountValue(companyName, invoice.invoice.handle, emailCount+1);
        updateInvoiceEmailLastSendValue(companyName, invoice.invoice.handle, today);
      }
    } else if (emailCount == 6) {
      const lastEmailSendDate = (invoice.emailLastSend).toDate();
      const DifferenceInTime = (today.getTime() - lastEmailSendDate.getTime()) / (1000 * 3600 * 24);
      if (DifferenceInTime >= 6) {
        // send(emailMsg);
        functions.logger.log("EmailCount 6: IT WORKS!!: " + JSON.stringify(emailMsg));
        updateInvoiceEmailCountValue(companyName, invoice.invoice.handle, emailCount+1);
        updateInvoiceEmailLastSendValue(companyName, invoice.invoice.handle, today);
        updateInvoiceActiveFlowValue(companyName, invoice.invoice.handle, false);
      }
    } else if (emailCount != 0 && emailCount != 6 && emailCount < 7) {
      const lastEmailSendDate = (invoice.emailLastSend).toDate();
      const DifferenceInTime = (today.getTime() - lastEmailSendDate.getTime()) / (1000 * 3600 * 24);
      console.log(DifferenceInTime);
      if (DifferenceInTime >= 3) {
        // send(emailMsg);
        functions.logger.log("EmailCount All others: IT WORKS!!" + JSON.stringify(emailMsg));
        updateInvoiceEmailCountValue(companyName, invoice.invoice.handle, emailCount+1);
        updateInvoiceEmailLastSendValue(companyName, invoice.invoice.handle, today);
      }
    }
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


slackApp.get("/getData", async (req, res) => {
  const data = await retriveCustomersDocDataFromCompany("LALA");
  const invoices = await retriveActiveInvoicesDocDataFromCompany("LALA");
  const invoiceData = await retriveDatasFromDocData(invoices);
  const customerdata = await retriveDatasFromDocData(data);
  console.log(customerdata, "Invoice data", invoiceData);
  const list = [];
  const dunningList = [];
  const activeDunning = [];
  const retainedList = [];
  // const onHold = [];
  // const reDunning = [];
  for (const cusData of customerdata ) {
    for (const invdata of invoiceData) {
      if (cusData.handle == invdata.invoice.customer) {
        if (invdata.activeFlow === true && invdata.status === "active") {
          const activedunning: ActiveDunning = {
            first_name: cusData.first_name,
            last_name: cusData.last_name,
            handle: cusData.handle,
            flowStartDate: invdata.flowStartDate,
            errorState: invdata.invoice.transactions[0]?.error_state,
            emailCount: invdata.emailCount,
            ordertext: invdata.invoice.order_lines[0].ordertext,
            created: invdata.invoice.created,
            settled_invoices: cusData.settled_invoices,
            amount: invdata.invoice.order_lines[0].amount,
            phone: cusData.phone,
            email: cusData.email,
            error: invdata.invoice.transactions[0]?.error,
            acquirer_message: invdata.invoice.transactions[0]?.acquirer_message,
            activeFlow: invdata.activeFlow,
          };
          activeDunning.push(activedunning);
        } else if (invdata.activeFlow === false && invdata.status === "active") {
          const dunning: Dunning = {
            first_name: cusData.first_name,
            last_name: cusData.last_name,
            handle: cusData.handle,
            errorState: invdata.invoice.transactions[0]?.error_state,
            ordertext: invdata.invoice.order_lines[0].ordertext,
            created: invdata.invoice.created,
            settled_invoices: cusData.settled_invoices,
            amount: invdata.invoice.order_lines[0].amount,
            phone: cusData.phone,
            email: cusData.email,
            error: invdata.invoice.transactions[0]?.error,
            acquirer_message: invdata.invoice.transactions[0]?.acquirer_message,
          };
          dunningList.push(dunning);
        } else if (invdata.status === "retained") {
          const retained: Retained = {
            first_name: cusData.first_name,
            last_name: cusData.last_name,
            handle: cusData.handle,
            flowStartDate: invdata.flowStartDate,
            errorState: invdata.invoice.transactions[0]?.error_state,
            emailCount: invdata.emailCount,
            ordertext: invdata.invoice.order_lines[0].ordertext,
            created: invdata.invoice.created,
            settled_invoices: cusData.settled_invoices,
            amount: invdata.invoice.order_lines[0].amount,
            phone: cusData.phone,
            email: cusData.email,
            error: invdata.invoice.transactions[0]?.error,
            acquirer_message: invdata.invoice.transactions[0]?.acquirer_message,
            activeFlow: invdata.activeFlow,
            retainedDate: invdata.retainedDate,
          };
          retainedList.push(retained);
        }
      }
    }
  }
  list.push(dunningList, activeDunning, retainedList);
  res.status(200).send(list);
});


exports.app = functions.https.onRequest(apps);
exports.slackApp = functions
    .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(slackApp);


