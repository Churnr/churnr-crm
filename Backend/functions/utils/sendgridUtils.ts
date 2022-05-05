import * as firestoreUtils from "../utils/firestoreUtils";
import * as sendGrid from "@sendgrid/mail";
import {activeFlow, customer} from "../types/types"
// Pre. Add map to customer, containing templateIds

// Slash command ind param: companyName, customer.id, templateId;
/**
 * Sending email to giving customer id
 * @param {string}companyName collection name in firestore
 * @param {string}customerId companyName
 * @param {string}templateId template id
 */
export async function sendEmail(companyName:string,
    customerId:string, templateId:string) {
// get customerdata from database with customer id and company name
  const customer = firestoreUtils.getCustomerFromFirestore(companyName, customerId);
  // const emailTos = customer.email;
  // Get template ids from database
  const emailFrom = await firestoreUtils.getFieldValueFromComapnyInFirestore(companyName, "emailGatewayUser");
  const templateMap = await firestoreUtils.getFieldValueFromComapnyInFirestore(companyName, "templateMap");
  const template = templateMap[templateId];
  const emailTo = customer
      .then((cu) => {
        return cu.email;
      });
  console.log(emailFrom, template, customer);
  if (process.env.SENDGRID_API_KEY === undefined) {
    throw new Error("Sendgrid api key not in enviroment");
  }
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  // connect to sendgrid and send email
  return emailTo;
}
// Verify input data slack
// get customer data
// Send request to Sendgrid
// send notification for complition

// Der skal katergori med, slack commanden, og der så 3 katergori med 7 emails der skal sendes
// eslint-disable-next-line require-jsdoc
function emailMessage(to:string, from:string, template:string, name:string) {
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

export async function emailFlowLogic(companyName:string, companyEmail:string) {
  // Hent template map
  const templateMap = await firestoreUtils.getFieldValueFromComapnyInFirestore(companyName, "templateMap");
  // Hent activeflows fra company (skal være et array)
  const activeFlowsArray: Array<activeFlow> = await firestoreUtils.getDocsFromCompanyCollection(companyName, "ActiveDunning");
  // iterer over liste af activeflows objecter
  for (const activeFlow of activeFlowsArray) {
    // if email answerd = true - ryk ned til endedflows
    if (activeFlow.emailAnswered === true) {
      continue;
    }
    // Hent kunde object
    const customer: customer = await firestoreUtils.getCustomerFromFirestore(companyName, activeFlow.customerId);  
    // Kald emailMessage med nødvendigt data og template id
    const emailMsg = emailMessage(customer.email, companyEmail, customer.first_name, templateMap[activeFlow.errorState][activeFlow.emailCount]);
    
  
    // send email
    sendGrid.send(emailMsg);
   

  }
}




