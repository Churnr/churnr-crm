import * as customType from "../types/types";
import fetch from "node-fetch";
import * as admin from "firebase-admin";
import * as firestoreUtils from "../utils/firestoreUtils";
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


/**
 * Keeps sending request aslong respons contains next_page_token
 * @param {Array<any>} contentArray
 * @param {string} customerName
 */
export async function addNewReepayInvoicesToCustomerInFirestore(contentArray:Array<any>, customerName:string) {
  const invoiceIdArray =
    await firestoreUtils.getInvoiceIdsFromCompanyCollection(customerName);
  for (const dunningInvoices of contentArray) {
    if (invoiceIdArray.indexOf(dunningInvoices.id) == -1) {
      await admin.firestore()
          .collection("Customers")
          .doc(customerName)
          .collection("ActiveDunning")
          .doc(dunningInvoices.id).set(dunningInvoices);
    }
  }
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
