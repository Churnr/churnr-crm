/* eslint-disable no-useless-catch */
import * as customType from "../types/types";
import fetch from "node-fetch";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as functions from "firebase-functions";
/**
 * Keeps sending request aslong as respons contains next_page_token
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
  if (response.status == 404) {
    throw new Error("retriveReepayList: status 404");
  }
  returnArray = returnArray.concat(response.content);
  if (response.next_page_token != undefined) {
    return await retriveReepayList(url, options, "&next_page_token="+
                                response.next_page_token, returnArray);
  }
  return returnArray;
}

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
 * Retrives an invoice event from reepay
 * @param {customType.options} options
 * @param {string} invoiceId
 * @return {Promise<object[]>} response
 */
export async function getReepayInvoiceEvents(options: customType.options, invoiceId: string): Promise<any[]> {
  try {
    const url = `https://api.reepay.com/v1/event?invoice=${invoiceId}`;
    const response = await (await fetch(url, options)).json();
    return response.content;
  } catch (error) {
    throw error;
  }
}


/**
 * Retrives a customers information from reepay.
 * Creates a customer object from the given information
 * @param {customType.options} options
 * @param {string} customerId
 * @return {customType.customer} customer object
 */
export async function getCustomerInfoFromReepay(options: customType.options,
    customerId: string): Promise<customType.customer> {
  try {
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
  } catch (error) {
    throw error;
  }
}

/**
 * Firstly the functions fetches the dunninglist of a given company.
 * Retrives the ids of exsisting invoices under the company in firestore
 * Retrives the ids of ecsisting customer under the company in firestore
 * Based on these information, the function will find new customers and invoces
 * and append these to the firestore
 * Secoundly the function creates a new list with invoices ids based on the list retrived from reepay.
 * It will the crossrefrence the list with the id invocice list from firestore.
 * invoces that exist in the list from firestore, and not the list from reepay, wil have their event status checked
 * Based on the event status, the invoice will be moved to the proper collection.
 * @param {string} companyApikey
 * @param {string} companyName
 * @return {customType.options} options
 */
export async function reepayLogic(companyApikey: string, companyName:string) {
  const options = createHttpOptionsForReepay(companyApikey);
  const reepayInvoiceArray: Array<any> =
      await retriveReepayList("https://api.reepay.com/v1/list/invoice?size=100&state=dunning", options);
  const firebaseInvoiceIdArray =
      await firestoreUtils.getDocIdsFromCompanyCollection(companyName, "ActiveDunning");
  const firebaseCustomerIdArray =
      await firestoreUtils.getDocIdsFromCompanyCollection(companyName, "Customers");

  for (const dunningInvoices of reepayInvoiceArray) {
    if (firebaseInvoiceIdArray.indexOf(dunningInvoices.handle) == -1) {
      if (firebaseCustomerIdArray.indexOf(dunningInvoices.customer) == -1) {
        const customer = await getCustomerInfoFromReepay(options, dunningInvoices.customer);
        await firestoreUtils.addDataToDocInCollectionUnderCompany("Customers",
            companyName, customer, customer.handle);
        await firestoreUtils.addInvoceToCustomer(companyName, customer.handle, dunningInvoices);
      } else {
        await firestoreUtils.addInvoceToCustomer(companyName, dunningInvoices.customer, dunningInvoices);
      }
      await firestoreUtils.addDataToDocInCollectionUnderCompany("ActiveDunning", companyName,
          dunningInvoices, dunningInvoices.handle);
    }
  }

  const reepayInvoiceIdArray = reepayInvoiceArray.map((a) => {
    return a.handle;
  });

  for (const fbDunningInvoices of firebaseInvoiceIdArray) {
    console.log(fbDunningInvoices, "before if");
    if (reepayInvoiceIdArray.indexOf(fbDunningInvoices) == -1) {
      console.log(fbDunningInvoices, "after if");
      const eventsArray = await getReepayInvoiceEvents(options, fbDunningInvoices);
      if (eventsArray[0].event_type == "invoice_dunning_cancelled") {
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
}


