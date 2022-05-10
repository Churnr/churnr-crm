/* eslint-disable no-useless-catch */
import * as admin from "firebase-admin";
import * as types from "../types/types";
import {logger} from "firebase-functions";
import {customer} from "../types/types";


/**
 * Gets doc ids from a collection under a company from firestore
 * and push it to array - docIdArray
 * @param {string}companyName collection name in firestore
 * @param {string}collectionName
 * @return {Promise<string[]>} Array of doc ids
 */
export const getDocIdsFromCompanyCollection = async (companyName:string, collectionName:string): Promise<string[]> => {
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
};


/**
 * Retrives company docs from firestore
 * and push it to array of objects - companyArray
 * @return {Promise<string[]>} Array of company objects
 */
export const getCompanys = async (): Promise<string[]> => {
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
};

/**
 * Creates a company doc with the given company object
 * @param {types.company}company company object
 * @param {string}companyName companyName
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export const addCompanyToFirestore = async (company:types.company,
    companyName:string): Promise<admin.firestore.WriteResult> => {
  try {
    const newDoc = await
    admin.firestore().collection("Companys").doc(companyName).set(company);
    return newDoc;
  } catch (error) {
    throw error;
  }
};


/**
 * Creats a doc in a collection under a companies doc
 * @param {string}collection collection name in firestore
 * @param {string}companyName companyName
 * @param {any} object
 * @param {string} docId
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export const addDataToDocInCollectionUnderCompany = async (collection:string,
    companyName:string, object:any, docId:string): Promise<admin.firestore.WriteResult> => {
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
};

/**
 * adds an invoice object to a companies customer
 * and push it to array of strings - invoiceIdArray
 * @param {string}companyName collection name in firestore
 * @param {string}customerId customer id
 * @param {any} invoceObject invoice object
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export const addInvoceToCustomer = async (companyName:string,
    customerId:string, invoceObject:any): Promise<admin.firestore.WriteResult> => {
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
};

/**
 * Moves and deletes doc from given collection and moves to given collection
 * @param {string} companyName
 * @param {string} collectionNameMoveFrom
 * @param {string} collectionNameMoveTo
 * @param {string} docId
 * @return {admin.firestore.WriteResult} newDoc
 */
export const deleteAndMoveDoc = async (companyName:string, collectionNameMoveFrom:string,
    collectionNameMoveTo:string, docId: string): Promise<admin.firestore.WriteResult> => {
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
};

// Refactor
export const updateInvoiceStatusValue = async (companyName:string, docId:string, status:string) => {
  const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
      .collection("Invoices").doc(docId).update({Status: status});
  return firestoreData;
};

export const retriveDatasFromDocData = async (firestoreData:admin.firestore
  .DocumentReference<admin.firestore.DocumentData>[]) => {
  const dataArray = [];
  for (const i of firestoreData) {
    const QueryDocumentSnapshot = await i.get();
    const data = QueryDocumentSnapshot.data();
    dataArray.push(data);
  }
  return dataArray;
};
export const retriveDocIdsFromDocData = (docData:admin.firestore
  .DocumentReference<admin.firestore.DocumentData>[]) => {
  const docIdArray:Array<string> = [];
  docData.forEach((collection) => {
    docIdArray.push(collection.id);
  });
  return docIdArray;
};
export const retriveActiveInvoicesDocDataFromCompany = async (companyName:string) => {
  try {
    const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
        .collection("Invoices").listDocuments();
    return firestoreData;
  } catch (error) {
    logger.error("retriveActiveInvoicesFromCompany: " + error);
    throw error;
  }
};

export const retriveCustomersDocDataFromCompany = async (companyName:string) => {
  try {
    const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
        .collection("Customers").listDocuments();
    return firestoreData;
  } catch (error) {
    logger.error("retriveCustomersFromCompany: " + error);
    throw error;
  }
};
/**
 * Creats an Invoice doc in the Invoices Collection under a company
 * @param {string}companyName companyName
 * @param {any} object
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export const addActiveInvoiceToCompany = async (companyName:string, object:any) => {
  const data = {
    Invoice: object,
    Status: "Active",
  };
  try {
    const newDoc = await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Invoices")
        .doc(object.handle).set(data);
    return newDoc;
  } catch (error) {
    logger.error("addActiveInvoiceToCompany: " + error);
    throw error;
  }
};

/**
 * Creats an Invoice doc in the Invoices Collection under a company
 * @param {string}companyName companyName
 * @param {any} object
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */

export const addCustomerToCompany = async (companyName:string, customerObject:customer) => {
  try {
    const newDoc = await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Invoices")
        .doc(customerObject.handle).set(customerObject);
    return newDoc;
  } catch (error) {
    logger.error("addCustomerToCompany: " + error);
    throw error;
  }
};
