import * as firestoreUtils from "../utils/firestoreUtils";
import * as sendGrid from "@sendgrid/mail";
// Pre. Add map to customer, containing templateIds

// Slash command ind param: companyName, customer.id, templateId;
/**
 * Sending email to giving customer id
 * @param {string}companyName collection name in firestore
 * @param {string}customerId companyName
 * @param {string}templateId
 * @return {Array<string>} Array of invoice ids
 */
export async function sendEmail(companyName:string,
    customerId:string, templateId:string) {
// get customerdata from database with customer id and company name
  const customer = firestoreUtils.getCustomerFromFirestore(companyName, customerId);
  // Get template ids from database
  const emailFrom = await firestoreUtils.getFieldValueFromComapnyInFirestore(companyName, "emailGatewayUser");
  const templateMap = await firestoreUtils.getFieldValueFromComapnyInFirestore(companyName, "templateMap");
  const template = templateMap[templateId];
  if (process.env.SENDGRID_API_KEY === undefined) {
    throw new Error("Sendgrid api key not in enviroment");
  }
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
// connect to sendgrid and send email
}
// Verify input data slack
// get customer data
// Send request to Sendgrid
// send notification for complition


// eslint-disable-next-line require-jsdoc
function emailMessage(to:string, from:string, template:string) {
  const msg = {
    to: to,
    from: from,
    template: template,
  };
  return msg;
}
