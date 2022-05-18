/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  getCompanys,
  retriveCustomersDocDataFromCompany,
  retriveDatasFromDocData,
  retriveActiveInvoicesDocDataFromCompany,
} from "../utils/firestoreUtils";
import * as reepayUtils from "../utils/reepayUtils";
// import * as sendgridUtils from "../utils/sendgridUtils";
// import {PubSub} from "@google-cloud/pubsub";
import * as cors from "cors";
import * as middleware from "../middleware/middleware";
import {slackAppFunctions} from "../utils/slackUtils";
import {sendgridLogic} from "../utils/sendgridUtils";
import * as express from "express";
import "dotenv/config";
import {Dunning, ActiveDunning, Retained} from "../types/interface";
// const config = functions.config();
// const config = process.env;
admin.initializeApp();
const corsHandler = cors();
// const pubsubClient = new PubSub();
const apps = express();
const slackApp = express();

// Enables middleware for slackApp endpoints
apps.use(corsHandler);
apps.use(express.json());
apps.use(middleware.validateFirebaseIdToken);
slackApp.use(corsHandler);
slackApp.use(middleware.validateFirebaseIdToken);
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

export const sendEmails =
functions.region("europe-west2").pubsub.schedule("0 17 * * *")
    .timeZone("Europe/Copenhagen").onRun(async (context) => {
      const companys: any = await getCompanys();
      for (const company of companys) {
        sendgridLogic(company);
      }
      return null;
    });

// // Kig på publishmessage istedet for publish
// /** @deprecated */
// slackApp.post("/createcompany", async (req, res) => {
//   const data = Buffer.from(JSON.stringify(req.body));
//   await pubsubClient.topic("create-company").publish(data);
//   res.status(200).send("Handling process: Create Company");
// });

// // Kig på publishmessage istedet for publish
// /** @deprecated */
// slackApp.post("/sendEmail", async (req, res) => {
//   const data = Buffer.from(JSON.stringify(req.body));
//   await pubsubClient.topic("send-email").publish(data);
//   res.status(200).send("Handling process: Create Company");
// });

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
// exports.sendEmail = functions.
//     pubsub.topic("send-email").onPublish(async (message) => {
//       const data = JSON.parse(Buffer.from(message.data, "base64").toString("utf-8"));
//       // const {event} = message.json;


//       console.log(data);
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
// });

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
  const companies:any = await getCompanys();
  for (const company of companies) {
    console.log(company);
    console.log(company.companyName);
  }
  // const companyName = "LALA";
  // const data = await getInvoicesObjectBasedOnStatusFromCompany(companyName);
  // const templateMap = await getFieldValueFromComapnyInFirestore(companyName, "templateMap");
  // const companyEmail = await getFieldValueFromComapnyInFirestore(companyName, "email");
  // const today = new Date();
  // if (process.env.SENDGRID_API_KEY === undefined) {
  //   throw new Error("Sendgrid api key not in enviroment");
  // }
  // for (const invoice of data) {
  //   const customer = await getCustomerFromFirestore("LALA", invoice.invoice.customer);
  //   const emailCount:number = invoice.emailCount;
  //   const emailMsg = emailMessage("benjamin@churnr.dk", companyEmail,
  //       templateMap[invoice.invoiceError][invoice.emailCount], customer);
  //   if (emailCount == 0) {
  //     const flowStartDate = (invoice.flowStartDate).toDate();
  //     const DifferenceInTime = (today.getTime() - flowStartDate.getTime()) / (1000 * 3600 * 24);
  //     if (DifferenceInTime >= 1) {
  //       sendgrid.send(emailMsg);
  //       functions.logger.log("EmailCount 0: IT WORKS!!" + JSON.stringify(emailMsg));
  //       updateInvoiceEmailCountValue(companyName, invoice.invoice.handle, emailCount+1);
  //       updateInvoiceEmailLastSendValue(companyName, invoice.invoice.handle, today);
  //     }
  //   } else if (emailCount == 6) {
  //     const lastEmailSendDate = (invoice.emailLastSend).toDate();
  //     const DifferenceInTime = (today.getTime() - lastEmailSendDate.getTime()) / (1000 * 3600 * 24);
  //     if (DifferenceInTime >= 6) {
  //       sendgrid.send(emailMsg);
  //       functions.logger.log("EmailCount 6: IT WORKS!!: " + JSON.stringify(emailMsg));
  //       updateInvoiceEmailCountValue(companyName, invoice.invoice.handle, emailCount+1);
  //       updateInvoiceEmailLastSendValue(companyName, invoice.invoice.handle, today);
  //       updateInvoiceActiveFlowValue(companyName, invoice.invoice.handle, false);
  //     }
  //   } else if (emailCount != 0 && emailCount != 6 && emailCount < 7) {
  //     const lastEmailSendDate = (invoice.emailLastSend).toDate();
  //     const DifferenceInTime = (today.getTime() - lastEmailSendDate.getTime()) / (1000 * 3600 * 24);
  //     console.log(DifferenceInTime);
  //     if (DifferenceInTime >= 3) {
  //       sendgrid.send(emailMsg);
  //       functions.logger.log("EmailCount All others: IT WORKS!!" + JSON.stringify(emailMsg));
  //       updateInvoiceEmailCountValue(companyName, invoice.invoice.handle, emailCount+1);
  //       updateInvoiceEmailLastSendValue(companyName, invoice.invoice.handle, today);
  //     }
  //   }
  // }
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
  const mainList = new Map();
  const companyList:any = await getCompanys();
  for (const company of companyList) {
    const data = await retriveCustomersDocDataFromCompany(company.companyName);
    const invoices = await retriveActiveInvoicesDocDataFromCompany(company.companyName);
    const invoiceData = await retriveDatasFromDocData(invoices);
    const customerdata = await retriveDatasFromDocData(data);
    console.log(customerdata, "Invoice data", invoiceData);
    const companyMap = new Map();
    const dunningList = [];
    const activeDunning = [];
    const retainedList = [];
    const onHoldList = [];
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
              errorState: reepayUtils.checkTransactionVariable(invdata.invoice, "error_state"),
              emailCount: invdata.emailCount,
              ordertext: invdata.invoice.order_lines[0].ordertext,
              created: invdata.invoice.created,
              settled_invoices: cusData.settled_invoices,
              amount: invdata.invoice.order_lines[0].amount,
              phone: cusData.phone,
              email: cusData.email,
              error: reepayUtils.checkTransactionVariable(invdata.invoice, "error"),
              acquirer_message: invdata.invoice.transactions[0]?.acquirer_message,
              activeFlow: invdata.activeFlow,
            };
            activeDunning.push(activedunning);
          } else if (!invdata.activeFlow && invdata.status === "active") {
            const dunning: Dunning = {
              first_name: cusData.first_name,
              last_name: cusData.last_name,
              handle: cusData.handle,
              errorState: reepayUtils.checkTransactionVariable(invdata.invoice, "error_state"),
              ordertext: invdata.invoice.order_lines[0].ordertext,
              created: invdata.invoice.created,
              settled_invoices: cusData.settled_invoices,
              amount: invdata.invoice.order_lines[0].amount,
              phone: cusData.phone,
              email: cusData.email,
              error: reepayUtils.checkTransactionVariable(invdata.invoice, "error"),
              acquirer_message: invdata.invoice.transactions[0]?.acquirer_message,
            };
            dunningList.push(dunning);
          } else if (invdata.status === "retained") {
            console.log("reatiend", invdata.invoiceEndDate);
            const retained: Retained = {
              first_name: cusData.first_name,
              last_name: cusData.last_name,
              handle: cusData.handle,
              flowStartDate: invdata.flowStartDate,
              errorState: reepayUtils.checkTransactionVariable(invdata.invoice, "error_state"),
              emailCount: invdata.emailCount,
              ordertext: invdata.invoice.order_lines[0].ordertext,
              created: invdata.invoice.created,
              settled_invoices: cusData.settled_invoices,
              amount: invdata.invoice.order_lines[0].amount,
              phone: cusData.phone,
              email: cusData.email,
              error: reepayUtils.checkTransactionVariable(invdata.invoice, "error"),
              acquirer_message: invdata.invoice.transactions[0]?.acquirer_message,
              activeFlow: invdata.activeFlow,
              invoiceEndDate: invdata?.invoiceEndDate,
            };
            retainedList.push(retained);
          } else if (invdata.status === "onhold") {
            const onhold: Retained = {
              first_name: cusData.first_name,
              last_name: cusData.last_name,
              handle: cusData.handle,
              flowStartDate: invdata.flowStartDate,
              errorState: reepayUtils.checkTransactionVariable(invdata.invoice, "error_state"),
              emailCount: invdata.emailCount,
              ordertext: invdata.invoice.order_lines[0].ordertext,
              created: invdata.invoice.created,
              settled_invoices: cusData.settled_invoices,
              amount: invdata.invoice.order_lines[0].amount,
              phone: cusData.phone,
              email: cusData.email,
              error: reepayUtils.checkTransactionVariable(invdata.invoice, "error"),
              acquirer_message: invdata.invoice.transactions[0]?.acquirer_message,
              activeFlow: invdata.activeFlow,
              invoiceEndDate: invdata?.invoiceEndDate,
            };
            onHoldList.push(onhold);
          }
        }
      }
    }
    companyMap["dunningList"] = dunningList;
    companyMap["activeDunning"] = activeDunning;
    companyMap["retainedList"] = retainedList;
    companyMap["onHoldList"] = onHoldList;
    mainList[company.companyName] = companyMap;
    // list.push(dunningList, activeDunning, retainedList, onHoldList);
  }
  res.status(200).send(mainList);
});


exports.app = functions.https.onRequest(apps);
exports.slackApp = functions
    // .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(slackApp);


