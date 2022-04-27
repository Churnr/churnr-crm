import * as admin from "firebase-admin";
import * as types from "../types/types";

/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @param {string}companyName collection name in firestore
 * @return {Array<string>} Array of invoice ids
 */
export async function getInvoiceIdsFromCompanyCollection(companyName:string) {
  const invoiceIdArray:Array<string> = [];
  const sfRef = admin.firestore().collection("Customers").doc(companyName).collection("ActiveDunning");
  const collections = await sfRef.listDocuments();
  console.log(collections);
  collections.forEach((collection) => {
    invoiceIdArray.push(collection.id);
  });
  return invoiceIdArray;
}


/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @return {Array<string>} Array of invoice ids
 */
export async function getCustomers() {
  const invoiceIdArray:Array<string> = [];
  const dbInvoice = await admin.firestore()
      .collection("Customers").listDocuments();
  for (const s of dbInvoice) {
    const QueryDocumentSnapshot = await s.get();
    const data: any = QueryDocumentSnapshot.data();
    invoiceIdArray.push(data);
  }
  return invoiceIdArray;
}

/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @param {string}customer collection name in firestore
 * @param {string}companyName companyName
 * @return {Array<string>} Array of invoice ids
 */
export async function addCustomerToFirestore(customer:types.customer,
    companyName:string) {
  const newDoc = await
  admin.firestore().collection("Customers").doc(companyName).set(customer);
  return newDoc;
}

/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @return {Map} Array of invoice ids
 */
export async function getDunningUrlsFromFirestore() {
  const dbURLS: any = await (await admin.firestore().collection("companyUrl").doc("duningurl").get()).data();
  const urls = dbURLS.Urls;
  return urls;
}


// export async function addDunningInvoices(listOfInvoices:Array<any>,) {
//   for (const dunningInvoices of contentArray) {
//     if (invoiceIdArray.indexOf(dunningInvoices.id) == -1) {
//       await admin.firestore()
//           .collection("Customers")
//           .doc(customerName)
//           .collection("ActiveDunning")
//           .add(dunningInvoices);
//     }
//   }
// }
// }
