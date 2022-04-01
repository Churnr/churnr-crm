import * as admin from "firebase-admin";
import * as customType from "../types/types";
import fetch from "node-fetch";
/**
 * Keeps sending request aslong respons contains next_page_token
 * @param {string} url Current year
 * @param {customType.options} options
 * @param {string} nextPageToken
 * @param {Promise<any>} returnArray
 * @return {Promise<any>} Array of url response.content
 */
export async function HttpRetriveReepayList(url:string,
    options:customType.options,
    nextPageToken="",
    returnArray=[]):Promise<any> {
  const response:any = await (await fetch(url+nextPageToken, options)).json();
  returnArray = returnArray.concat(response.content);
  if (response.nextPageToken != undefined) {
    return HttpRetriveReepayList(url, options, "&next_page_token="+
                                response.nextPageToken, returnArray);
  }
  return returnArray;
}

/**
 * Gets id from activeDunning from firestore
 * and push it to array of strings - invoiceIdArray
 * @return {Array<string>} Array of invoice ids
 */
export async function firestoreGetInvoiceIdsFromCollection(collectionName:string) {
  const invoiceIdArray:Array<string> = [];
  const dbInvoice = await admin.firestore()
      .collection("collectionName").listDocuments();
  for (const s of dbInvoice) {
    const QueryDocumentSnapshot = await s.get();
    const data: any = QueryDocumentSnapshot.data();
    const dataID: string = data.id;
    invoiceIdArray.push(dataID);
  }
  return invoiceIdArray;
}
