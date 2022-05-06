/* eslint-disable no-useless-catch */
import * as admin from "firebase-admin";
import * as types from "../types/types";

/**
 * Gets doc ids from a collection under a company from firestore
 * and push it to array - docIdArray
 * @param {string}companyName collection name in firestore
 * @param {string}collectionName
 * @return {Promise<string[]>} Array of doc ids
 */
export async function getDocIdsFromCompanyCollection(companyName:string, collectionName:string): Promise<string[]> {
  try {
    const docIdArray:Array<string> = [];
    const sfRef = admin.firestore().collection("Companys").doc(companyName).collection(collectionName);
    const collections = await sfRef.listDocuments();
    collections.forEach((collection) => {
      docIdArray.push(collection.id);
    });
    return docIdArray;
  } catch (error) {
    throw error;
  }
}
/**
 * Gets doc ids from invoice collection from firestore
 * and push it to array of strings - docIdArray
 * @param {string}companyName collection name in firestore
 * @param {string}collectionName
 * @return {Promise<string[]>} Array of doc ids
 */
export async function getDocsFromCompanyCollection(companyName:string, collectionName:string): Promise<any> {
  const docArray:Array<any> = [];
  const sfRef = admin.firestore().collection("Companys").doc(companyName).collection(collectionName);
  const docs = await sfRef.listDocuments();
  for (const doc of docs) {
    const QueryDocumentSnapshot = await doc.get();
    const data: any = QueryDocumentSnapshot.data();
    docArray.push(data);
  }
  return docArray;
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
 * Retrives company docs from firestore
 * and push it to array of objects - companyArray
 * @return {Promise<string[]>} Array of company objects
 */
export async function getCompanys(): Promise<string[]> {
  try {
    const companyArray:Array<string> = [];
    const dbInvoice = await admin.firestore()
        .collection("Companys").listDocuments();
    for (const s of dbInvoice) {
      const QueryDocumentSnapshot = await s.get();
      const data: any = QueryDocumentSnapshot.data();
      companyArray.push(data);
    }
    return companyArray;
  } catch (error) {
    throw error;
  }
}

/**
 * Creates a company doc with the given company object
 * @param {types.company}company company object
 * @param {string}companyName companyName
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export async function addCompanyToFirestore(company:types.company,
    companyName:string): Promise<admin.firestore.WriteResult> {
  try {
    const newDoc = await
    admin.firestore().collection("Companys").doc(companyName).set(company);
    return newDoc;
  } catch (error) {
    throw error;
  }
}


/**
 * Creats a doc in a collection under a companies doc
 * @param {string}collection collection name in firestore
 * @param {string}companyName companyName
 * @param {any} object
 * @param {string} docId
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export async function addDataToDocInCollectionUnderCompany(collection:string,
    companyName:string, object:any, docId:string): Promise<admin.firestore.WriteResult> {
  try {
    const newDoc = await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection(collection)
        .doc(docId).set(object);
    return newDoc;
  } catch (error) {
    throw error;
  }
}


/**
 * adds an invoice object to a companies customer
 * and push it to array of strings - invoiceIdArray
 * @param {string}companyName collection name in firestore
 * @param {string}customerId customer id
 * @param {any} invoceObject invoice object
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export async function addInvoceToCustomer(companyName:string,
    customerId:string, invoceObject:any): Promise<admin.firestore.WriteResult> {
  try {
    const newDoc = await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Customers")
        .doc(customerId)
        .collection("Invoces")
        .doc(invoceObject.handle).set(invoceObject);
    return newDoc;
  } catch (error) {
    throw error;
  }
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
        .collection(collectionNameMoveTo).doc(docFrom.handle).set(docFrom);
    const newDoc = await admin.firestore().collection("Companys").doc(companyName)
        .collection(collectionNameMoveFrom).doc(docId).delete();
    return newDoc;
  } catch (error) {
    throw error;
  }
}

/**
 * Moves and deletes doc from given collection and moves to given collection
 * @param {string} companyName
 * @param {string} customerId
 * @return {admin.firestore.WriteResult} newDoc
 */
export async function getCustomerFromFirestore(companyName:string, customerId:string): Promise<any> {
  const dataFrom = await admin.firestore().collection("Companys").doc(companyName)
      .collection("Customers").doc(customerId).get();
  const docFrom = dataFrom.data();
  if (docFrom === undefined) {
    throw new Error("The doc you wanted to move was undefined");
  }
  return docFrom;
}

/**
 * Moves and deletes doc from given collection and moves to given collection
 * @param {string} companyName
 * @param {string} FieldName
 * @return {admin.firestore.WriteResult} newDoc
 */
export async function getFieldValueFromComapnyInFirestore(companyName:string, FieldName:string) {
  const fieldValue = await (await admin.firestore().collection("Companys").doc(companyName).get()).get(FieldName);
  return fieldValue;
}

