/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  getCompanys,
  retriveCustomersDocDataFromCompany,
  retriveDatasFromDocData,
  addDashboardDataToCompany,
  retriveDataFromFirestoreToDisplayOnDasboard,
  retriveInvoicesDocDataFromCompany,
} from "../utils/firestoreUtils";
import * as reepayUtils from "../utils/reepayUtils";
// import * as sendgridUtils from "../utils/sendgridUtils";
// import {PubSub} from "@google-cloud/pubsub";
import * as cors from "cors";
import * as middleware from "../middleware/middleware";
import {slackAppFunctions,
  publishMessage,
  dailyUpdateForSlack,
  updatesForPhoneSmsAndEndedFlows,
  noUpdatesToday,
} from "../utils/slackUtils";
import {sendgridLogic} from "../utils/sendgridUtils";
import * as express from "express";
import "dotenv/config";
import {Dunning, ActiveDunning, Retained} from "../types/interface";
import {reepayGetTotalGrossIncome} from "../utils/reepayUtils";
// const config = functions.config();
// const config = process.env;
admin.initializeApp();
const corsHandler = cors();
// const pubsubClient = new PubSub();
const apps = express();
const dataApi = express();

// Enables middleware for slackApp endpoints
apps.use(corsHandler);
// apps.use(express.json());
// apps.use(middleware.validateFirebaseIdToken);
dataApi.use(corsHandler);
dataApi.use(middleware.validateFirebaseIdToken);
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
  functions
      .region("europe-west2").pubsub.schedule("0 6 * * *")
      .timeZone("Europe/Copenhagen").onRun(async (context) => {
        const companys: any = await getCompanys();
        // const urls: any = await firestoreUtils.getDunningUrlsFromFirestore();
        for (const company of companys) {
          const companyName: string = company.companyName;
          const companyApykey: string = company.apiKey;
          const paymentGateway: string = company.paymentGateway;
          if (paymentGateway === "Reepay") {
            const updateLogic = await reepayUtils.reepayLogic(companyApykey, companyName);

            const message = dailyUpdateForSlack(updateLogic);
            publishMessage("C02U1337UPJ", message);
          }
        }
        return null;
      }
      );

/**
 * Function made because of slow load time for dashboard,
 * therefor this function makes the logic and the put the end result to firestore.
 * This way we get data to analyse on and the possibilty to show data on frontend with
 * slackApp/getData function
 */
export const getDataForDashboard =
 functions.region("europe-west2").pubsub.schedule("30 6 * * *")
     .timeZone("Europe/Copenhagen").onRun(async (context) => {
       //  const mainList = new Map();
       const companyList:any = await getCompanys();
       for (const company of companyList) {
         const data = await retriveCustomersDocDataFromCompany(company.companyName);
         const invoices = await retriveInvoicesDocDataFromCompany(company.companyName);
         const invoiceData = await retriveDatasFromDocData(invoices);
         functions.logger.log(invoiceData);
         const customerdata = await retriveDatasFromDocData(data);
         const companyMap = new Map();
         const dunningList = [];
         const activeDunning = [];
         const retainedList = [];
         const onHoldList = [];
         // const reDunning = [];
         for (const cusData of customerdata ) {
           for (const invdata of invoiceData) {
             if (cusData.handle == invdata.invoice.customer) {
               functions.logger.log("first if", invdata);
               if (invdata.activeFlow === true && invdata.status === "active") {
                 const activedunning: ActiveDunning = {
                   first_name: cusData.first_name,
                   last_name: cusData.last_name,
                   handle: cusData.handle,
                   flowStartDate: invdata.flowStartDate ? invdata.flowStartDate : false,
                   errorState: reepayUtils.checkTransactionVariable(invdata.invoice, "error_state"),
                   emailCount: invdata.emailCount ? invdata.emailCount : false,
                   ordertext: invdata.invoice.order_lines[0].ordertext,
                   created: invdata.invoice.created,
                   settled_invoices: cusData.settled_invoices,
                   amount: invdata.invoice.order_lines[0].amount,
                   phone: cusData.phone,
                   email: cusData.email,
                   error: reepayUtils.checkTransactionVariable(invdata.invoice, "error") ?
                   reepayUtils.checkTransactionVariable(invdata.invoice, "error") : false,
                   acquirer_message: reepayUtils.checkTransactionVariable(invdata.invoice, "acquirer_message")?
                   reepayUtils.checkTransactionVariable(invdata.invoice, "acquirer_message") : false,
                   activeFlow: invdata.activeFlow ? invdata.activeFlow : false,
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
                   error: reepayUtils.checkTransactionVariable(invdata.invoice, "error") ?
                   reepayUtils.checkTransactionVariable(invdata.invoice, "error") : false,
                   acquirer_message: reepayUtils.checkTransactionVariable(invdata.invoice, "acquirer_message")?
                   reepayUtils.checkTransactionVariable(invdata.invoice, "acquirer_message") : false,
                 };
                 functions.logger.log("dunning", dunning);
                 dunningList.push(dunning);
               } else if (invdata.status === "retained") {
                 const retained: Retained = {
                   first_name: cusData.first_name,
                   last_name: cusData.last_name,
                   handle: cusData.handle,
                   flowStartDate: invdata.flowStartDate ? invdata.flowStartDate : false,
                   errorState: reepayUtils.checkTransactionVariable(invdata.invoice, "error_state"),
                   emailCount: invdata.emailCount ? invdata.emailCount : false,
                   ordertext: invdata.invoice.order_lines[0].ordertext,
                   created: invdata.invoice.created,
                   settled_invoices: cusData.settled_invoices,
                   amount: invdata.invoice.order_lines[0].amount,
                   phone: cusData.phone,
                   email: cusData.email,
                   error: reepayUtils.checkTransactionVariable(invdata.invoice, "error") ?
                   reepayUtils.checkTransactionVariable(invdata.invoice, "error") : false,
                   acquirer_message: reepayUtils.checkTransactionVariable(invdata.invoice, "acquirer_message")?
                   reepayUtils.checkTransactionVariable(invdata.invoice, "acquirer_message") : false,
                   activeFlow: invdata.activeFlow ? invdata.activeFlow : false,
                   invoiceEndDate: invdata?.invoiceEndDate,
                 };
                 retainedList.push(retained);
               } else if (invdata.status === "onhold") {
                 const onhold: Retained = {
                   first_name: cusData.first_name,
                   last_name: cusData.last_name,
                   handle: cusData.handle,
                   flowStartDate: invdata.flowStartDate ? invdata.flowStartDate : false,
                   errorState: reepayUtils.checkTransactionVariable(invdata.invoice, "error_state"),
                   emailCount: invdata.emailCount ? invdata.emailCount : false,
                   ordertext: invdata.invoice.order_lines[0].ordertext,
                   created: invdata.invoice.created,
                   settled_invoices: cusData.settled_invoices,
                   amount: invdata.invoice.order_lines[0].amount,
                   phone: cusData.phone,
                   email: cusData.email,
                   error: reepayUtils.checkTransactionVariable(invdata.invoice, "error") ?
                   reepayUtils.checkTransactionVariable(invdata.invoice, "error") : false,
                   acquirer_message: reepayUtils.checkTransactionVariable(invdata.invoice, "acquirer_message")?
                   reepayUtils.checkTransactionVariable(invdata.invoice, "acquirer_message") : false,
                   activeFlow: invdata.activeFlow ? invdata.activeFlow : false,
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
         functions.logger.log(companyMap);
         addDashboardDataToCompany(company.companyName, companyMap);
       }
     }
     );


export const sendEmails =
functions.region("europe-west2").pubsub.schedule("0 17 * * *")
    .timeZone("Europe/Copenhagen").onRun(async (context) => {
      const companys: any = await getCompanys();
      for (const company of companys) {
        const updates: any = await sendgridLogic(company);
        if ((updates.phonecall).length != 0 || (updates.sms).length != 0 || (updates.endedflows).length != 0) {
          const message = await updatesForPhoneSmsAndEndedFlows(updates, company.companyName);
          publishMessage("C02U1337UPJ", message);
        } else {
          publishMessage("C02U1337UPJ", noUpdatesToday(company.companyName));
        }
      }
      return null;
    });


/**
 * Månedsrapport
Løbe tid 03/xx - 03/xx
Dunning kunder i alt
kunder fastholdt
kunder on hold
endnu ikke fastholdt.
Brutto Fastholdelse
*/
import * as firestoreUtils from "../utils/firestoreUtils";
apps.get("/halloworld", async (req, res) => {
  const message = "No updates";
  const companys: any = await getCompanys();
  for (const company of companys) {
    const updates: any = await sendgridLogic(company);
    if ((updates.phonecall).length != 0 || (updates.sms).length != 0 || (updates.endedflows).length != 0) {
      const message = await updatesForPhoneSmsAndEndedFlows(updates, company.companyName);
      console.log("NOOOO", message);
      publishMessage("C02U1337UPJ", message);
    } else {
      publishMessage("C02U1337UPJ", noUpdatesToday(company.companyName));
    }

    res.status(200).send("DER HUL IGENNEM!"+JSON.stringify(message));
  }
});

export const creatMonthlyReport =
  functions.region("europe-west2").pubsub.schedule("59 22 3 * *")
      .timeZone("Europe/Copenhagen").onRun(async (context) => {
        const companyName = "LALA";
        const invoiceArray = (await firestoreUtils.retriveInvoicesForMonthlyReportDocDataFromCompany(companyName, 2))
            .map((test) => test.data());
        const activeInvoiceArray = (await firestoreUtils.retriveActiveInvoicesDocDataFromCompany(companyName))
            .map((doc) => doc.data());
        const reportMap = {};
        // total dunning kunder. læg invoiceArray og activeInvoiceArray sammen.
        reportMap["totalDunning"] = invoiceArray.length + activeInvoiceArray.length;
        // Kunder fastholdt. Tag fat i alle kunder der er retained
        reportMap["totalRetained"] = invoiceArray.filter((invoice) => invoice.status === "retained").length;
        // On hold tag fat i kunder der er onhold
        reportMap["totalOnHold"] = invoiceArray.filter((invoice) => invoice.status === "onhold").length;
        // længden af activeInvoiceArray
        reportMap["totalNotRetained"] = activeInvoiceArray.length;
        // total gross income for all retained invoices
        reportMap["totalGrossIncome"] = reepayGetTotalGrossIncome(
            invoiceArray.filter((invoice) => invoice.status === "retained"));
        console.log(invoiceArray);
        return null;
      }
      );

/**
 * Function is made so its possible to get data with the right format to show on dashboard
 */
dataApi.get("/getData", async (req, res) => {
  const companyList:any = await getCompanys();
  const mainList = new Map();
  for (const company of companyList) {
    const dashboardData = await retriveDataFromFirestoreToDisplayOnDasboard(company.companyName) as any;
    mainList[company.companyName] = dashboardData;
  }
  res.status(200).send(mainList);
});


exports.app = functions
    .region("europe-west2").https.onRequest(apps);
exports.dataApi = functions.region("europe-west2")
    // .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(dataApi);


