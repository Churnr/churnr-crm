/* eslint-disable no-useless-catch */
import * as admin from "firebase-admin";
import * as types from "../types/types";
import {logger} from "firebase-functions";
import {customer} from "../types/types";
// import {checkTransactionVariable} from "./reepayUtils";
import {extraDaysFunction} from "./dateUtils";

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
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export const addCompanyToFirestore = async (company:types.company): Promise<admin.firestore.WriteResult> => {
  try {
    const newDoc = await
    admin.firestore().collection("Companys").doc(company.companyName).set(company);
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
 * Creats a doc in a collection under a companies doc
 * @param {string}collection collection name in firestore
 * @param {string}companyName companyName
 * @param {any} object
 * @param {string} docId
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export const updateDataToDocInCollectionUnderCompany = async (collection:string,
    companyName:string, object:any, docId:string): Promise<admin.firestore.WriteResult> => {
  try {
    const newDoc = await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection(collection)
        .doc(docId).update(object);
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
      .collection("Invoices").doc(docId).update({status: status});
  return firestoreData;
};

export const updateInvoiceEndDate = async (companyName:string, docId:string) => {
  const today = new Date();
  const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
      .collection("Invoices").doc(docId).update({invoiceEndDate: today});
  return firestoreData;
};

export const updateInvoiceLastFlowActivity = async (companyName:string, docId:string, today:Date) => {
  const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
      .collection("Invoices").doc(docId).update({lastFlowActivity: today});
  return firestoreData;
};
export const updateInvoiceEmailCountValue = async (companyName:string, docId:string, emailCount:number) => {
  const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
      .collection("Invoices").doc(docId).update({emailCount: emailCount});
  return firestoreData;
};

export const updateInvoiceFlowCountValue = async (companyName:string, docId:string, flowCount:number) => {
  const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
      .collection("Invoices").doc(docId).update({flowCount: flowCount});
  return firestoreData;
};

export const updateInvoiceFlowEndValue = async (companyName:string, docId:string, date:Date) => {
  const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
      .collection("Invoices").doc(docId).update({flowEnd: date});
  return firestoreData;
};

export const updateInvoiceActiveFlowValue = async (companyName:string, docId:string, boolean:boolean) => {
  const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
      .collection("Invoices").doc(docId).update({activeFlow: boolean});
  return firestoreData;
};

export const retriveDatasFromDocData = async (firestoreData:any) => {
  const dataArray = [];
  for (const i of firestoreData) {
    const QueryDocumentSnapshot = await i.get();
    const data = QueryDocumentSnapshot.data();
    dataArray.push(data);
  }
  return dataArray;
};
// export const retriveDocIdsFromDocData = (docData:admin.firestore
//   .DocumentReference<admin.firestore.DocumentData>[]) => {
//   const docIdArray:Array<string> = [];
//   docData.forEach((collection) => {
//     docIdArray.push(collection.id);
//   });
//   return docIdArray;
// };
export const retriveDocIdsFromDocData = (docData:admin.firestore
  .DocumentReference<admin.firestore.DocumentData>[]|
  admin.firestore.QueryDocumentSnapshot<admin.firestore.DocumentData>[]) => {
  const docIdArray:Array<string> = [];
  docData.forEach((collection) => {
    docIdArray.push(collection.id);
  });
  return docIdArray;
};
export const retriveActiveInvoicesDocDataFromCompany = async (companyName:string) => {
  try {
    const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
        .collection("Invoices").where("status", "==", "active").get();
    return firestoreData.docs;
  } catch (error) {
    logger.error("retriveActiveInvoicesFromCompany: " + error);
    throw error;
  }
};
export const retriveInvoicesForMonthlyReportDocDataFromCompany = async (companyName:string, days: number) => {
  const today = new Date(); // den 4 i måned
  const [stDate, enDate] = extraDaysFunction(today, days, days);
  const startdate = stDate;
  const endDate = enDate;
  const startDate = admin.firestore.Timestamp.fromDate(startdate);
  const expirationDate = admin.firestore.Timestamp.fromDate(endDate);
  console.log(startDate, expirationDate);
  try {
    const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
        .collection("Invoices")
        .where("invoiceEndDate", ">=", endDate)
        .where("invoiceEndDate", "<", startdate).get();
    return firestoreData.docs;
  } catch (error) {
    logger.error("retriveActiveInvoicesFromCompany: " + error);
    throw error;
  }
};
export const retriveInvoicesDocDataFromCompany = async (companyName:string) => {
  try {
    const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
        .collection("Invoices").listDocuments();
    return firestoreData;
  } catch (error) {
    logger.error("retriveInvoicesFromCompany: " + error);
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

export const retriveDataFromFirestoreToDisplayOnDasboard = async (companyName:string) => {
  try {
    const firestoreData = await admin.firestore().collection("Companys").doc(companyName)
        .collection("Data").doc("Dashboard").get();
    const docFrom = firestoreData.data();
    return docFrom;
  } catch (error) {
    logger.error("retriveDataFromFirestoreToDisplayOnDasboard: " + error);
    throw error;
  }
};

/**
 * Creats an Invoice doc in the Invoices Collection under a company
 * @param {string}companyName companyName
 * @param {any} object
 * @return {admin.firestore.WriteResult} firestore WriteResult
 */
export const addDashboardDataToCompany = async (companyName:string, object:any) => {
  const data = {
    dunningList: object.dunningList,
    activeDunning: object.activeDunning,
    retainedList: object.retainedList,
    onHoldList: object.onHoldList,
  };
  try {
    const newDoc = await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Data")
        .doc("Dashboard").set(data);
    return newDoc;
  } catch (error) {
    logger.error("addDashboardDataToCompany: " + error);
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
    invoice: object,
    status: "active",
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
    throw new Error("The customer you tried to find, does not exist");
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

/**
 * Retrives customer object based on email given
 * @param {string} companyName
 * @param {string} email
 * @return {admin.firestore.WriteResult} newDoc
 */
export const getCustomerObjectBasedOnEmailFromCompany = async (companyName:string, email:string): Promise<any> => {
  try {
    const dataFrom = await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Customers")
        .where("email", "==", email).get();


    return dataFrom.docs[0].data();
  } catch (error) {
    throw error;
  }
};


/**
 * Retrive all Active Invoices from firebase with activeflow == true
 * @param {string} companyName
 * @return {admin.firestore.WriteResult} newDoc
 */
export const getInvoicesObjectBasedOnStatusFromCompany = async (companyName:string): Promise<any> => {
  try {
    const activeInvoice = (await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Invoices")
        .where("status", "==", "active").where("activeFlow", "==", true).get()).docs;
    const activeInvoiceArray = [];
    for (const inv of activeInvoice) {
      activeInvoiceArray.push(inv.data());
    }

    return activeInvoiceArray;
  } catch (error) {
    throw new Error(error + "Error occured at getInvoicesObjectBasedOnStatusFromCompany");
  }
};


/**
 * Moves and deletes doc from given collection and moves to given collection
 * @param {string} companyName
 * @param {string} customerId
 * @param {string} invoiceError
 * @return {admin.firestore.WriteResult} newDoc
 */
export const updateActiveInvoiceWithActiveFlowVariables = async (companyName:string,
    customerId:string, invoiceError:string) => {
  const today = new Date();
  try {
    const activeInvoice = (await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Invoices")
        .where("status", "==", "active").where("invoice.customer", "==", customerId).get()).docs[0].data();
    await admin.firestore().collection("Companys").doc(companyName)
        .collection("Invoices").doc(activeInvoice.invoice.handle).update({emailCount: 0, flowCount: 0,
          activeFlow: true, invoiceError: invoiceError,
          flowStartDate: today});
  } catch (error) {
    throw new Error(error + "updateActiveInvoiceWithActiveFlowVariables");
  }
};


/**
 * Moves and deletes doc from given collection and moves to given collection
 * @param {string} companyName
 * @param {string} customerId
 * @param {string} invoiceError
 * @return {admin.firestore.WriteResult} newDoc
 */
export const updateFlowErrorOnInvoice = async (companyName:string,
    customerId:string, invoiceError:string) => {
  try {
    const activeInvoice = (await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Invoices")
        .where("status", "==", "active").where("invoice.customer", "==", customerId).get()).docs[0].data();
    if (activeInvoice.activeFlow != undefined) {
      await admin.firestore().collection("Companys").doc(companyName)
          .collection("Invoices").doc(activeInvoice.invoice.handle).update({invoiceError: invoiceError});
    } else {
      throw new Error("It looks like you tried to update an error on a flow that has not been activatet yet");
    }
  } catch (error) {
    throw new Error(error + "updateFlowErrorOnInvoice");
  }
};


/**
 * Moves and deletes doc from given collection and moves to given collection
 * @param {string} companyName
 * @param {string} customerId
 * @param {string} invoiceError
 * @return {admin.firestore.WriteResult} newDoc
 */
export const stopEmailFlowOnInvoice = async (companyName:string,
    customerId:string) => {
  try {
    const activeInvoice = (await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Invoices")
        .where("status", "==", "active").where("invoice.customer", "==", customerId).get()).docs[0].data();
    if (activeInvoice.activeFlow === undefined) {
      throw new Error("The flow you tried to stop, has never been started");
    }
    if (activeInvoice.activeFlow === true) {
      await admin.firestore().collection("Companys").doc(companyName)
          .collection("Invoices").doc(activeInvoice.invoice.handle).update({activeFlow: false});
    } else {
      throw new Error("It looks like you tried to stop a flow that was already stopped");
    }
  } catch (error) {
    throw new Error(error + "updateFlowErrorOnInvoice");
  }
};


/**
 * Moves and deletes doc from given collection and moves to given collection
 * @param {string} companyName
 * @param {string} customerId
 * @param {string} invoiceError
 * @return {admin.firestore.WriteResult} newDoc
 */
export const reactivateFlowOnInvoice = async (companyName:string,
    customerId:string) => {
  try {
    const activeInvoice = (await admin.firestore()
        .collection("Companys")
        .doc(companyName)
        .collection("Invoices")
        .where("status", "==", "active").where("invoice.customer", "==", customerId).get()).docs[0].data();
    if (activeInvoice.activeFlow === undefined) {
      throw new Error("The flow you tried to reactivate, has never been started");
    }
    if (activeInvoice.flowCount === 7) {
      throw new Error("The flow you tried to reactivate, has send 7 emails total and will not be reactivatet");
    }
    if (activeInvoice.activeFlow === false) {
      await admin.firestore().collection("Companys").doc(companyName)
          .collection("Invoices").doc(activeInvoice.invoice.handle).update({activeFlow: false});
    } else {
      throw new Error("It looks like you tried to reactivate a flow that is already active");
    }
  } catch (error) {
    throw new Error(error + "updateFlowErrorOnInvoice");
  }
};
