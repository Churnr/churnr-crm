import {getInvoicesObjectBasedOnStatusFromCompany,
  getCustomerFromFirestore,
  updateInvoiceFlowCountValue,
  updateInvoiceActiveFlowValue,
  updateInvoiceFlowEndValue,
  updateInvoiceLastFlowActivity} from "../utils/firestoreUtils";
import {differenceInDays} from "date-fns";
import * as sendgrid from "@sendgrid/mail";
// import * as functions from "firebase-functions";
// const config = functions.config();
const sengridapikey = process.env.SENDGRID_API_KEY;
// const sengridapikey = config.env.SLACK_BOT_TOKEN;

// Pre. Add map to customer, containing templateIds

// Slash command ind param: companyName, customer.id, templateId;
/**
 * Sending email to giving customer id
 * @param {any}emailMessage template id
 */
// export async function sendEmail(emailMessage:any) {
//   if (process.env.SENDGRID_API_KEY === undefined) {
//     throw new Error("Sendgrid api key not in enviroment");
//   }
//   sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
//   sendGrid.send(emailMessage);
// }
// Verify input data slack
// get customer data
// Send request to Sendgrid
// send notification for complition

// Der skal katergori med, slack commanden, og der så 3 katergori med 7 emails der skal sendes
// eslint-disable-next-line require-jsdoc
export function emailMessage(to:string, from:string, template:string, customerObject:any) {
  const msg = {
    to: to,
    from: from,
    templateId: template,
    dynamicTemplateData: {
      customer: {
        first_name: customerObject.first_name,
        payment_link: customerObject.paymentLink,
      },
    },
  };
  return msg;
}

// Skal laves i index i selve funktionen:
// Hent companys fra firebase (skal være et array)
// iterar over company list
// ________________________________________

// eslint-disable-next-line require-jsdoc
// export async function sendgridLogic(company:any) {
//   const data = await getInvoicesObjectBasedOnStatusFromCompany(company.companyName);
//   const templateMap = company.templateMap;
//   const companyEmail = company.email;
//   const today = new Date();
//   if (config.env.sengridapikey === undefined) {
//     throw new Error("Sendgrid api key not in enviroment");
//   }
//   sendgrid.setApiKey(config.env.sengridapikey);
//   for (const invoice of data) {
//     if (invoice.status === "active") {
//       const customer = await getCustomerFromFirestore(company.companyName, invoice.invoice.customer);
//       const emailCount:number = invoice.emailCount;
//       // const emailMsg = emailMessage(customer.email, companyEmail,
//       //     templateMap[invoice.invoiceError][invoice.emailCount], customer);
//       const emailMsg = emailMessage("system@churnr.dk", companyEmail,
//           templateMap[invoice.invoiceError][invoice.emailCount], customer);
//       if (emailCount == 0) {
//         const flowStartDate = (invoice.flowStartDate).toDate();
//         const DifferenceInTime = (today.getTime() - flowStartDate.getTime()) / (1000 * 3600 * 24);
//         if (DifferenceInTime >= 1) {
//           sendgrid.send(emailMsg);
//           updateInvoiceEmailCountValue(company.companyName, invoice.invoice.handle, emailCount+1);
//           updateInvoiceEmailLastSendValue(company.companyName, invoice.invoice.handle, today);
//         }
//       } else if (emailCount == 6) {
//         const lastEmailSendDate = (invoice.emailLastSend).toDate();
//         const DifferenceInTime = (today.getTime() - lastEmailSendDate.getTime()) / (1000 * 3600 * 24);
//         if (DifferenceInTime >= 6) {
//           sendgrid.send(emailMsg);
//           updateInvoiceEmailCountValue(company.companyName, invoice.invoice.handle, emailCount+1);
//           updateInvoiceEmailLastSendValue(company.companyName, invoice.invoice.handle, today);
//           updateInvoiceActiveFlowValue(company.companyName, invoice.invoice.handle, false);
//         }
//       } else if (emailCount != 0 && emailCount != 6 && emailCount < 7) {
//         const lastEmailSendDate = (invoice.emailLastSend).toDate();
//         const DifferenceInTime = (today.getTime() - lastEmailSendDate.getTime()) / (1000 * 3600 * 24);
//         console.log(DifferenceInTime);
//         if (DifferenceInTime >= 3) {
//           sendgrid.send(emailMsg);
//           updateInvoiceEmailCountValue(company.companyName, invoice.invoice.handle, emailCount+1);
//           updateInvoiceEmailLastSendValue(company.companyName, invoice.invoice.handle, today);
//         }
//       }
//     }
//   }
// }
/**
 * READ ME
 * Har ændret emailCount til flowCount da dette gav bedre mening nu når vi introducerer sms og opkald.
 * Dette skulle meget gerne være ændret i alle andre funktioner der håndtere variablen.
 * Vi kan altid ændre den tilbage hvis den giver for mange problemer.
 * -
 * I databasen skal en virksomhed have et array ved navn flowRules.
 * Dette array skal indholde objecter der har 2 variabler: type og time.
 * Type henviser til hvilken type af kontakt der skal tages til kunden: sms, email eller phonecall
 * Time henviser til hvornår der skal tages kontakt. istedet for at tage dage imellem hver action.
 * så bliver der set på hver action, hvornår den skal laves ud fra startflowdate.
 * eks.: i arrayet under på index 3, skal der gå 7 dage fra startFlowDate datoen, før den bliver execveret.
 * const flowRules = [{type: "email", time: 1},
 *                    {type: "email", time: 4},
 *                    {type: "email", time: 7},
 *                    {type: "email", time: 10},
 *                    {type: "email", time: 13},
 *                    {type: "email", time: 16},
 *                    {type: "phonecall", time: 19},
 *                    {type: "email", time: 22},]
 * -
 * Jeg har ikke implementeret funktionen: updateInvoiceEmailLastSendValue
 * da den ikke bliver brugt i logiken længere.
 * kunne dog være smart at have den, da det måske er en god ide at kunne se hvornår der sidst var taget kontakt.
 * Evt skal der ændres navn på den variabel den laver i databasen, da vi ikke længere kun arbejder med emails.
 * -
 * Evt. ændre navn fra sendGridLogic til flowLogic??
 */
// eslint-disable-next-line require-jsdoc
export async function sendgridLogic(company:any) {
  const invoiceArray = await getInvoicesObjectBasedOnStatusFromCompany(company.companyName);
  const templateMap = company.templateMap;
  const companyEmail = company.email;
  const flowRules = company.flowRules;
  const phonecallArray = [];
  const smsArray = [];
  const endedflows = [];
  const updateMap = new Map();
  const today = new Date();
  if (sengridapikey === undefined) {
    throw new Error("Sendgrid api key not in enviroment");
  }
  sendgrid.setApiKey(sengridapikey);
  for (const invoice of invoiceArray) {
    if (invoice.status == "active") {
      if (flowRules.length > invoice.flowCount) {
        const DifferenceInTime = differenceInDays(today, new Date(invoice.flowStartDate.toDate()));
        if (DifferenceInTime == flowRules[invoice.flowCount].time) {
          const customer = await getCustomerFromFirestore(company.companyName, invoice.invoice.customer);
          if (flowRules[invoice.flowCount].type == "email") {
            const emailMsg = emailMessage("system@churnr.dk", companyEmail,
                templateMap[invoice.invoiceError][invoice.flowCount], customer);
            sendgrid.send(emailMsg);
            updateInvoiceFlowCountValue(company.companyName, invoice.invoice.handle, invoice.flowCount+1);
            updateInvoiceLastFlowActivity(company.companyName, invoice.invoice.handle, today);
          } else if (flowRules[invoice.flowCount].type == "phonecall") {
            // Missing phonecall implementation
            phonecallArray.push(invoice);
            // Make Array of invoices and return the value to publish on slack
            updateInvoiceFlowCountValue(company.companyName, invoice.invoice.handle, invoice.flowCount+1);
            updateInvoiceLastFlowActivity(company.companyName, invoice.invoice.handle, today);
          } else if (flowRules[invoice.flowCount].type == "sms") {
            // Missing sms implementation
            smsArray.push(invoice);
            // Make Array of invoices and return the value to publish on slack
            updateInvoiceFlowCountValue(company.companyName, invoice.invoice.handle, invoice.flowCount+1);
            updateInvoiceLastFlowActivity(company.companyName, invoice.invoice.handle, today);
          }
        }
      }
      if (flowRules.length <= invoice.flowCount) {
        // this block will deactivate the flow if the invoice flowCounter
        // is bigger or as big as the flowRules array length
        endedflows.push(invoice);
        updateInvoiceActiveFlowValue(company.companyName, invoice.invoice.handle, false);
        updateInvoiceFlowEndValue(company.companyName, invoice.invoice.handle, today);
        console.log("flow deactivatet");
      }
    }
  }
  updateMap["phonecall"] = phonecallArray;
  updateMap["sms"] = smsArray;
  updateMap["endedflows"] = endedflows;
  return updateMap;
}


// slack Command send

// ActivateFlow
// get customer objekt where email == email(from slack command)
// Use customer.id to find invoice Object where customerHandler == customer.id and status == active
// Set email count to 0 and set email flow to true and set invoice error msg and flowStartDate

// SendEmail Schedular pubsub
// Retrive all Active Invoices from firebase with activeflow == true - Done
// For loop over Array of Active Invoices
// Get current date
// get emailcount and start date
// Check if current date is 3 days from start date if email count == 0
// If true send email
// set last email sent to current date
// Check if current date is 3 days from last email sent and email count != 7
// If true send email
// set last email sent to current date
// Else set flow status to False
