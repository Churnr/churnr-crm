import * as customType from "../types/types";
import fetch from "node-fetch";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as functions from "firebase-functions";
/**
 * Keeps sending request aslong respons contains next_page_token
 * @param {string} url Current year
 * @param {customType.options} options
 * @param {string} nextPageToken
 * @param {Promise<any>} returnArray
 * @return {Promise<any>} Array of url response.content
 */
export async function retriveReepayList(url:string,
    options:customType.options,
    nextPageToken="",
    returnArray=[]):Promise<any> {
  const response:any = await (await fetch(url+nextPageToken, options)).json();
  returnArray = returnArray.concat(response.content);
  if (response.next_page_token != undefined) {
    return await retriveReepayList(url, options, "&next_page_token="+
                                response.next_page_token, returnArray);
  }
  return returnArray;
}


// /**
//  * Keeps sending request aslong respons contains next_page_token
//  * @param {Array<any>} contentArray
//  * @param {string} companyName
//  */
// export async function addNewReepayInvoicesToCompanyInFirestore(contentArray:Array<any>, companyName:string) {
//   const invoiceIdArray =
//     await firestoreUtils.getDocIdsFromCompanyCollection(companyName);
//   for (const dunningInvoices of contentArray) {
//     if (invoiceIdArray.indexOf(dunningInvoices.id) == -1) {
//       await admin.firestore()
//           .collection("Companys")
//           .doc(companyName)
//           .collection("ActiveDunning")
//           .doc(dunningInvoices.id).set(dunningInvoices);
//     }
//   }
// }

/**
 * Creates HTTP options, with apikey, for reepay api requests
 * @param {string} apiKey
 * @return {customType.options} options
 */
export function createHttpOptionsForReepay(apiKey:string) {
  const headers: customType.headers = {
    "Content-Type": "application/json",
    "Authorization": `Basic ${apiKey}`,
  };

  const options: customType.options = {
    method: "GET",
    headers: headers,
    json: true,
  };

  return options;
}

/**
 * Creates HTTP options, with apikey, for reepay api requests
 * @param {customType.options} options
 * @param {string} invoiceId
 * @return {Promise<object[]>} response
 */
export async function getReepayInvoiceEvents(options: customType.options, invoiceId: string): Promise<any[]> {
  const url = `https://api.reepay.com/v1/event?invoice=${invoiceId}`;
  const response = await (await fetch(url, options)).json();
  return response.body.content;
}


/**
 * Creates HTTP options, with apikey, for reepay api requests
 * @param {customType.options} options
 * @param {string} customerId
 * @return {customType.options} options
 */
export async function getCustomerInfoFromReepay(options: customType.options,
    customerId: string): Promise<customType.customer> {
  const url = `https://api.reepay.com/v1/customer/${customerId}`;
  const customerObject = await (await fetch(url, options)).json();
  const customer: customType.customer = {
    first_name: customerObject.first_name,
    last_name: customerObject.last_name,
    handle: customerObject.handle,
    email: customerObject.email,
    phone: customerObject.phone,
    created: customerObject.created,
    dunning_invoices: customerObject.dunning_invoices,
    active_subscriptions: customerObject.active_subscriptions,
    expired_subscriptions: customerObject.expired_subscriptions,
    cancelled_invoices: customerObject.cancelled_invoices,
    settled_invoices: customerObject.settled_invoices,
    pending_invoices: customerObject.pending_invoices,
    trial_active_subscriptions: customerObject.trial_active_subscriptions,
    subscriptions: customerObject.subscriptions,
  };


  return customer;
}

/**
 * Creates HTTP options, with apikey, for reepay api requests
 * @param {string} companyApikey
 * @param {string} companyName
 * @return {customType.options} options
 */
export async function reepayLogic(companyApikey: string, companyName:string) {
  const options = createHttpOptionsForReepay(companyApikey);
  const reepayInvoiceArray: Array<any> =
      await retriveReepayList("https://api.reepay.com/v1/list/invoice?size=100&state=dunning", options);

  // hent invoice ids fra DB
  const firebaseInvoiceIdArray =
  await firestoreUtils.getDocIdsFromCompanyCollection(companyName, "ActiveDunning");
  // hent customer ids fra DB
  const firebaseCustomerIdArray =
  await firestoreUtils.getDocIdsFromCompanyCollection(companyName, "Customers");
  for (const dunningInvoices of reepayInvoiceArray) {
    // krydsreferer invoices, så kun nye er tilstede
    if (firebaseInvoiceIdArray.indexOf(dunningInvoices.id) == -1) {
      // tjek om kunden på invocesen eksisterer i db, if true: append invoices til collection.
      if (firebaseCustomerIdArray.indexOf(dunningInvoices.customer) == -1) {
        // if false: opret customer i companys customer colletion og append invoces til collection
        // get customer object fra reepay
        const customer = await getCustomerInfoFromReepay(options, dunningInvoices.customer);
        // append customer object til firestore
        await firestoreUtils.addDataToDocInCollectionUnderCompany("Customers",
            companyName, customer, customer.handle);
        // append invoice til customer invoces collection
        await firestoreUtils.addInvoceToCustomer(companyName, customer.handle, dunningInvoices);
      } else {
        await firestoreUtils.addInvoceToCustomer(companyName, dunningInvoices.customer, dunningInvoices);
      }
    }
    /**
     * reepay array:
     * invoice 4
     * invoice 5
     * invoice 6
     *
     * firebase array:
     * invoice 1
     * invoice 2
     * invoice 3
     * invoice 4
     * invoice 5 (new)
     * invoice 6 (new)
     */
    // reepay invoice array, skal tjekke om dem den har fået med findes i firebase .indexOf(fbDunningInvoices) == -1)
    // all invoices der er i firebase active dunning som ikke er i reepay dunning list
    for (const fbDunningInvoices of firebaseInvoiceIdArray) {
      if (reepayInvoiceArray.findIndex((item) => item.id != fbDunningInvoices)) {
        const eventsArray = await getReepayInvoiceEvents(options, fbDunningInvoices);
        // Tjekke event status
        if (eventsArray[0].event_type == "invoice_dunning_cancelled") {
        // Rykkes fra activdunning til retained
          if (eventsArray[1].event_type == "invoice_settled") {
            firestoreUtils.deleteAndMoveDoc(companyName, "ActiveDunning", "Retained", fbDunningInvoices);
          } else if (eventsArray[1].event_type == "invoice_cancelled") {
            firestoreUtils.deleteAndMoveDoc(companyName, "ActiveDunning", "OnHold", fbDunningInvoices);
          }
        } else if (eventsArray[0].event_type == "invoice_settled") {
          firestoreUtils.deleteAndMoveDoc(companyName, "ActiveDunning", "Retained", fbDunningInvoices);
        } else if (eventsArray[0].event_type == "invoice_cancelled") {
          firestoreUtils.deleteAndMoveDoc(companyName, "ActiveDunning", "OnHold", fbDunningInvoices);
        } else if (eventsArray[0].event_type == "invoice_failed" ||
                 eventsArray[0].event_type == "invoice_refund" ||
                 eventsArray[0].event_type == "invoice_reactivate" ||
                 eventsArray[0].event_type == "invoice_credited" ||
                 eventsArray[0].event_type == "invoice_changed") {
          functions.logger.error("EVENT_TYPE IS NOT SUPPORTED!!!", eventsArray[0].event_type);
        }
      }
    }
    // Append dunning invoces to company ActiveDunning collection
    await firestoreUtils.addDataToDocInCollectionUnderCompany("ActivDunning", companyName,
        dunningInvoices, dunningInvoices.id);
  }
}

