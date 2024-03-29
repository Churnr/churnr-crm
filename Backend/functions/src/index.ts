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
  getCustomerFromFirestore,
  addMonthlyDataToCompany,
  retriveRapportFromFirestoreToDisplayOnDasboard,
} from "../utils/firestoreUtils";
import * as reepayUtils from "../utils/reepayUtils";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as cors from "cors";
import * as middleware from "../middleware/middleware";
import {slackAppFunctions,
  publishMessage,
  noUpdatesToday,
  updatesForNewUpdateInInvoices,
} from "../utils/slackUtils";
import {sendgridLogic} from "../utils/sendgridUtils";
import * as express from "express";
import "dotenv/config";
import {reepayGetDataForDashboard, reepayGetTotalGrossIncome} from "../utils/reepayUtils";
import {Retained, OnHold, Expired, NotRetained} from "../types/types";
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
 * Function is made so its possible to get data from a paymentgateway, and process it.
 * When its processed it will give a update with relevant information to slack
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
              if ((updateLogic.dunning).length != 0) {
                const dunning = await updatesForNewUpdateInInvoices(updateLogic.dunning, companyName
                    , " dunning", " dunning");
                publishMessage("C03E3GB54JD", dunning);
              }
              if ((updateLogic.retained).length != 0) {
                const retained = await updatesForNewUpdateInInvoices(updateLogic.retained, companyName,
                    " retained", " retained");
                publishMessage("C03E3GB54JD", retained);
              }
              if ( (updateLogic.onhold).length != 0) {
                const onhold = await updatesForNewUpdateInInvoices(updateLogic.onhold, companyName,
                    " onhold", " onhold");
                publishMessage("C03E3GB54JD", onhold);
              }
            } else {
              publishMessage("C03E3GB54JD",
                  noUpdatesToday(company.companyName, ` ${company.companyName} when fetched new data for invoices.`));
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
         addDashboardDataToCompany(company.companyName, companyMap);
       }
     }
     );


/**
 * Functions made so that customers will get a email on certian days in their flow.
 * This wil then run every day 5pm UTC+2
 * If a phonecall or a sms is needed, it will give a notification to slack
 * But also if a flow is ended.
 */
export const sendEmails =
functions.region("europe-west2").pubsub.schedule("0 17 * * *")
    .timeZone("Europe/Copenhagen").onRun(async (context) => {
      const companys: any = await getCompanys();
      for (const company of companys) {
        const updates: any = await sendgridLogic(company);
        const companyName = company.companyName;
        if ((updates.endedflows).length != 0 || (updates.phonecall).length != 0 || (updates.sms).length != 0) {
          if ((updates.endedflows).length != 0) {
            const endedflows = await updatesForNewUpdateInInvoices(updates.endedflows, companyName
                , " endedflows", "'s flow ended");
            publishMessage("C03E3GB54JD", endedflows);
          } if ((updates.phonecall).length != 0 ) {
            const phonecall = await updatesForNewUpdateInInvoices(updates.phonecall, companyName
                , " phonecall", " needs a phonecall");
            publishMessage("C03E3GB54JD", phonecall);
          } if ((updates.sms).length != 0) {
            const sms = await updatesForNewUpdateInInvoices(updates.sms, companyName
                , " sms", " needs a sms");
            publishMessage("C03E3GB54JD", sms);
          }
        } else {
          publishMessage("C03E3GB54JD", noUpdatesToday(company.companyName, " phone calls, sms or ended flows today"));
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
apps.get("/halloworld", async (req, res) => {
  // const companyList:any = await getCompanys();
  // const mainList: any = new Map();
  // for (const company of companyList) {
  //   const companyName:string = company?.companyName;
  //   const dashboardData = await retriveRapportFromFirestoreToDisplayOnDasboard(companyName) as any;
  //   const data = await retriveDatasFromDocData(dashboardData);
  //   mainList[company.companyName] = data;
  // }
  // console.log(mainList.LALA);
  // res.status(200).send(mainList);
}
);

export const creatMonthlyReport =
  functions.region("europe-west2").pubsub.schedule("59 22 3 * *")
      .timeZone("Europe/Copenhagen").onRun(async (context) => {
        const companys: any = await getCompanys();
        for (const company of companys) {
          const companyName = company.companyName;
          const invoiceArray = (await firestoreUtils.retriveInvoicesForMonthlyReportDocDataFromCompany(companyName, 2))
              .map((test) => test.data());
          const activeInvoiceArray =
           (await firestoreUtils.retriveActiveInvoicesDocDataFromCompany(companyName))
               .map((doc) => doc.data());
          const retained: Array<Retained> = [];
          const onHold: Array<OnHold> = [];
          const expired: Array<Expired> = [];
          const notRetained: Array<NotRetained> = [];
          for (const invoice of activeInvoiceArray) {
            const flowCount = invoice?.flowCount ? invoice?.flowCount : 0;
            const emailCount = invoice?.emailCount ? invoice?.emailCount : 0;
            let phoneCount = 0;
            const customerId = invoice.invoice.customer;
            const customer = await getCustomerFromFirestore(companyName, customerId);
            const firstName: string = customer.first_name;
            const lastName = customer.last_name;
            if (flowCount >= 4 && flowCount < 8) {
              phoneCount = 1;
            }
            if (flowCount >= 8) {
              phoneCount = 2;
            }

            const reportObject = {customerId: customerId,
              firstName: firstName,
              lastName: lastName,
              emailCount: emailCount,
              phoneCount: phoneCount,
              flowStatus: "Not Critical"};
            if (flowCount >= 7) {
              reportObject["flowStatus"] = "Critical!!!";
            }
            notRetained.push(reportObject);
          }
          for (const invoice of invoiceArray) {
            const status = invoice.status;
            const customerId = invoice.invoice.customer;
            const customer = await getCustomerFromFirestore(companyName, customerId);
            const firstName: string = customer.first_name;
            const lastName = customer.last_name;
            const customerCreated = customer.created;
            const invoiceValue = invoice.invoice.amount;
            if (status == "onhold") {
              onHold.push({customerId: customerId,
                firstName: firstName,
                lastName: lastName,
                customerCreated: customerCreated,
                onHoldDate: invoice.invoiceEndDate});
            }
            if (status == "expired") {
              expired.push({customerId: customerId,
                firstName: firstName,
                lastName: lastName,
                customerCreated: customerCreated,
                expiredDate: invoice.invoiceEndDate});
            }
            if (status == "retained") {
              retained.push({customerId: customerId,
                firstName: firstName,
                lastName: lastName,
                invoiceValue: invoiceValue,
                retainedDate: invoice.invoiceEndDate});
            }
          }
          const today = new Date();
          const reportMap = {retained: retained,
            onHold: onHold,
            expired: expired,
            notRetained: notRetained,
            totalDunning: invoiceArray.length + activeInvoiceArray.length,
            totalGrossIncome: reepayGetTotalGrossIncome(
                invoiceArray.filter((invoice) => invoice.status === "retained")),
            date: today};
          addMonthlyDataToCompany(companyName, reportMap);
        }
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

/**
 * Function is made so its possible to get data with the right format to show on dashboard
 */
dataApi.get("/getRapport", async (req, res) => {
  const companyList:any = await getCompanys();
  const mainList: any = new Map();
  for (const company of companyList) {
    const companyName:string = company?.companyName;
    const dashboardData = await retriveRapportFromFirestoreToDisplayOnDasboard(companyName) as any;
    const data = await retriveDatasFromDocData(dashboardData);
    mainList[company.companyName] = data;
  }
  res.status(200).send(mainList);
});

dataApi.get("/refresh", async (req, res) => {
  const companyList:any = await getCompanys();
  for (const company of companyList) {
    const data = await retriveCustomersDocDataFromCompany(company.companyName);
    const invoices = await retriveInvoicesDocDataFromCompany(company.companyName);
    const invoiceData = await retriveDatasFromDocData(invoices);
    const customerdata = await retriveDatasFromDocData(data);
    const companyMap = reepayGetDataForDashboard(customerdata, invoiceData );
    addDashboardDataToCompany(company.companyName, companyMap);
  }
});


exports.app = functions
    .region("europe-west2").https.onRequest(apps);
exports.dataApi = functions.region("europe-west2")
    // .runWith({secrets: ["SLACK_TOKEN", "SLACK_SIGNING_SECRET"]})
    .https.onRequest(dataApi);


