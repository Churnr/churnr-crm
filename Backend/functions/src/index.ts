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
import * as firestoreUtils from "../utils/firestoreUtils";
// import * as sendgridUtils from "../utils/sendgridUtils";
// import {PubSub} from "@google-cloud/pubsub";
import * as cors from "cors";
import * as middleware from "../middleware/middleware";
import {slackAppFunctions,
  publishMessage,
  // dailyUpdateForSlack,
  updatesForPhoneSmsAndEndedFlows,
  noUpdatesToday,
  updatesForNewUpdateInInvoices,
  // updatesForNewUpdateInInvoices,
} from "../utils/slackUtils";
import {sendgridLogic} from "../utils/sendgridUtils";
import * as express from "express";
import "dotenv/config";
import {reepayGetDataForDashboard, reepayGetTotalGrossIncome} from "../utils/reepayUtils";
// const config = functions.config();
// const config = process.env;
admin.initializeApp();
const corsHandler = cors();
// const pubsubClient = new PubSub();
const apps = express();
const dataApi = express();

// Enables middleware for slackApp endpoints
apps.use(corsHandler);
apps.use(express.json());
apps.use(middleware.validateFirebaseIdToken);
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
        for (const company of companys) {
          const companyName: string = company.companyName;
          const companyApykey: string = company.apiKey;
          const paymentGateway: string = company.paymentGateway;
          if (paymentGateway === "Reepay") {
            const updateLogic:any = await reepayUtils.reepayLogic(companyApykey, companyName);
            if ((updateLogic.dunning).length != 0 ||
             (updateLogic.retained).length != 0 ||
             (updateLogic.onhold).length != 0) {
              const message = await updatesForNewUpdateInInvoices(updateLogic, companyName);
              publishMessage("C02U1337UPJ", message);
            }
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
         const customerdata = await retriveDatasFromDocData(data);
         const companyMap = reepayGetDataForDashboard(customerdata, invoiceData );
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
// apps.get("/halloworld", async (req, res) => {
//   const activeInvoiceDocData =
//       await firestoreUtils.retriveActiveInvoicesDocDataFromCompany("LALA");
//   const activeInvoiceIdArray = firestoreUtils.retriveDocIdsFromDocData(activeInvoiceDocData);
//   const activeInvoiceDataArray = activeInvoiceDocData.map((invoice) => {
//     return invoice.data();
//   });
//   for (const invoiceId of activeInvoiceIdArray) {
//     const invoice = activeInvoiceDataArray.find((invoice) => invoice.invoice.handle === invoiceId);
//     if (invoice != undefined) {
//       const customer = invoice.invoice.customer;
//       console.log(customer);
//     }
//   }

//   res.status(200).send("DER HUL IGENNEM!"+JSON.stringify("WHAT"));
// }
// );

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


