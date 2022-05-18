import {getInvoicesObjectBasedOnStatusFromCompany,
  getCustomerFromFirestore,
  updateInvoiceEmailCountValue,
  updateInvoiceEmailLastSendValue,
  updateInvoiceActiveFlowValue} from "../utils/firestoreUtils";
import * as sendgrid from "@sendgrid/mail";
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
export async function sendgridLogic(company:any) {
  const data = await getInvoicesObjectBasedOnStatusFromCompany(company.companyName);
  const templateMap = company.templateMap;
  const companyEmail = company.email;
  const today = new Date();
  if (process.env.SENDGRID_API_KEY === undefined) {
    throw new Error("Sendgrid api key not in enviroment");
  }
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  for (const invoice of data) {
    if (invoice.status === "active") {
      const customer = await getCustomerFromFirestore(company.companyName, invoice.invoice.customer);
      const emailCount:number = invoice.emailCount;
      // const emailMsg = emailMessage(customer.email, companyEmail,
      //     templateMap[invoice.invoiceError][invoice.emailCount], customer);
      const emailMsg = emailMessage("system@churnr.dk", companyEmail,
          templateMap[invoice.invoiceError][invoice.emailCount], customer);
      if (emailCount == 0) {
        const flowStartDate = (invoice.flowStartDate).toDate();
        const DifferenceInTime = (today.getTime() - flowStartDate.getTime()) / (1000 * 3600 * 24);
        if (DifferenceInTime >= 1) {
          sendgrid.send(emailMsg);
          updateInvoiceEmailCountValue(company.companyName, invoice.invoice.handle, emailCount+1);
          updateInvoiceEmailLastSendValue(company.companyName, invoice.invoice.handle, today);
        }
      } else if (emailCount == 6) {
        const lastEmailSendDate = (invoice.emailLastSend).toDate();
        const DifferenceInTime = (today.getTime() - lastEmailSendDate.getTime()) / (1000 * 3600 * 24);
        if (DifferenceInTime >= 6) {
          sendgrid.send(emailMsg);
          updateInvoiceEmailCountValue(company.companyName, invoice.invoice.handle, emailCount+1);
          updateInvoiceEmailLastSendValue(company.companyName, invoice.invoice.handle, today);
          updateInvoiceActiveFlowValue(company.companyName, invoice.invoice.handle, false);
        }
      } else if (emailCount != 0 && emailCount != 6 && emailCount < 7) {
        const lastEmailSendDate = (invoice.emailLastSend).toDate();
        const DifferenceInTime = (today.getTime() - lastEmailSendDate.getTime()) / (1000 * 3600 * 24);
        console.log(DifferenceInTime);
        if (DifferenceInTime >= 3) {
          sendgrid.send(emailMsg);
          updateInvoiceEmailCountValue(company.companyName, invoice.invoice.handle, emailCount+1);
          updateInvoiceEmailLastSendValue(company.companyName, invoice.invoice.handle, today);
        }
      }
    }
  }
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
