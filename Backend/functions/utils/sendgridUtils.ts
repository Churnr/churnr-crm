import * as firestoreUtils from "../utils/firestoreUtils";
import * as sendGrid from "@sendgrid/mail";
import {activeFlow, customer} from "../types/types";
// Pre. Add map to customer, containing templateIds

// Slash command ind param: companyName, customer.id, templateId;
/**
 * Sending email to giving customer id
 * @param {any}emailMessage template id
 */
export async function sendEmail(emailMessage:any) {
  if (process.env.SENDGRID_API_KEY === undefined) {
    throw new Error("Sendgrid api key not in enviroment");
  }
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  sendGrid.send(emailMessage);
}
// Verify input data slack
// get customer data
// Send request to Sendgrid
// send notification for complition

// Der skal katergori med, slack commanden, og der så 3 katergori med 7 emails der skal sendes
// eslint-disable-next-line require-jsdoc
export function emailMessage(to:string, from:string, template:string, name:string) {
  const msg = {
    to: to,
    from: from,
    templateId: template,
    dynamicTemplateData: {
      subject: "Testing Templates",
      name: name,
      city: "Denver",
    },
  };
  return msg;
}

// Skal laves i index i selve funktionen:
// Hent companys fra firebase (skal være et array)
// iterar over company list
// ________________________________________

// eslint-disable-next-line require-jsdoc
export async function emailFlowLogic(companyName:string, companyEmail:string) {
  // Hent template map
  const templateMap = await firestoreUtils.getFieldValueFromComapnyInFirestore(companyName, "templateMap");
  // Hent activeflows fra company (skal være et array)
  const activeFlowsArray: Array<activeFlow> = await firestoreUtils.
      getDocsFromCompanyCollection(companyName, "ActiveDunning");
  // iterer over liste af activeflows objecter
  for (const activeFlow of activeFlowsArray) {
    // if email answerd = true - ryk ned til endedflows
    if (activeFlow.emailAnswered === true) {
      continue;
    }
    // Hent kunde object
    const customer: customer = await firestoreUtils.getCustomerFromFirestore(companyName, activeFlow.customerId);
    // Kald emailMessage med nødvendigt data og template id
    const emailMsg = emailMessage(customer.email, companyEmail,
        customer.first_name, templateMap[activeFlow.errorState][activeFlow.emailCount]);


    // send email
    sendGrid.send(emailMsg);
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
