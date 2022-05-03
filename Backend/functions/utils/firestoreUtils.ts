import * as admin from "firebase-admin";
import * as types from "../types/types";

/**
 * Gets doc ids from invoice collection from firestore
 * and push it to array of strings - docIdArray
 * @param {string}companyName collection name in firestore
 * @param {string}collectionName
 * @return {Promise<string[]>} Array of doc ids
 */
export async function getDocIdsFromCompanyCollection(companyName:string, collectionName:string): Promise<string[]> {
  const docIdArray:Array<string> = [];
  const sfRef = admin.firestore().collection("Companys").doc(companyName).collection(collectionName);
  const collections = await sfRef.listDocuments();
  collections.forEach((collection) => {
    docIdArray.push(collection.id);
  });
  return docIdArray;
}

// export async function getInvoiceIdsFromCompanyCollection(companyName:string) {
//   const invoiceIdArray:Array<string> = [];
//   const sfRef = admin.firestore().collection("Companys").doc(companyName).collection("ActiveDunning");
//   const collections = await sfRef.listDocuments();
//   collections.forEach((collection) => {
//     invoiceIdArray.push(collection.id);
//   });
//   return invoiceIdArray;
// }

/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @return {Promise<string[]>} Array of invoice ids
 */
export async function getCompanys(): Promise<string[]> {
  const companyArray:Array<string> = [];
  const dbInvoice = await admin.firestore()
      .collection("Companys").listDocuments();
  for (const s of dbInvoice) {
    const QueryDocumentSnapshot = await s.get();
    const data: any = QueryDocumentSnapshot.data();
    companyArray.push(data);
  }
  return companyArray;
}

/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @return {Map} Array of invoice ids
 */
// export async function getDunningUrlsFromFirestore(): Promise<Map<string, string>> {
//   const dbURLS: any = await (await admin.firestore().collection("companyUrl").doc("duningurl").get()).data();
//   const urls = dbURLS.Urls;
//   return urls;
// }

/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @param {string}company collection name in firestore
 * @param {string}companyName companyName
 * @return {Array<string>} Array of invoice ids
 */
export async function addCompanyToFirestore(company:types.company,
    companyName:string): Promise<admin.firestore.WriteResult> {
  const newDoc = await
  admin.firestore().collection("Companys").doc(companyName).set(company);
  return newDoc;
}


/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @param {string}collection collection name in firestore
 * @param {string}companyName companyName
 * @param {any} object
 * @param {string} docId
 * @return {Array<string>} Array of invoice ids
 */
export async function addDataToDocInCollectionUnderCompany(collection:string,
    companyName:string, object:any, docId:string): Promise<admin.firestore.WriteResult> {
  const newDoc = await admin.firestore()
      .collection("Companys")
      .doc(companyName)
      .collection(collection)
      .doc(docId).set(object);
  return newDoc;
}


/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @param {string}companyName collection name in firestore
 * @param {string}customerId customer id
 * @param {any} invoceObject invoice object
 * @return {Array<string>} Array of invoice ids
 */
export async function addInvoceToCustomer(companyName:string,
    customerId:string, invoceObject:any): Promise<admin.firestore.WriteResult> {
  const newDoc = await admin.firestore()
      .collection("Companys")
      .doc(companyName)
      .collection("Customers")
      .doc(customerId)
      .collection("Invoces")
      .doc(invoceObject.handle).set(invoceObject);
  return newDoc;
}

/**
 * Moves and deletes doc from given collection and moves to given collection
 * @param {string} companyName
 * @param {string} collectionNameMoveFrom
 * @param {string} collectionNameMoveTo
 * @param {string} docId
 * @return {admin.firestore.WriteResult} newDoc
 */
export async function deleteAndMoveDoc(companyName:string, collectionNameMoveFrom:string,
    collectionNameMoveTo:string, docId: string): Promise<admin.firestore.WriteResult> {
  try {
    const dataFrom = await admin.firestore().collection("Companys").doc(companyName)
        .collection(collectionNameMoveFrom).doc(docId).get();
    const docFrom = dataFrom.data();
    if (docFrom === undefined) {
      throw new Error("The doc you wanted to move was undefined");
    }
    admin.firestore().collection("Companys").doc(companyName)
        .collection(collectionNameMoveTo).doc(docId).set(docFrom);
    const newDoc = await admin.firestore().collection("Companys").doc(companyName)
        .collection(collectionNameMoveFrom).doc(docId).delete();
    return newDoc;
  } catch (error) {
    throw new Error("Could not move doc(s)");
  }
}

