import * as admin from "firebase-admin";


/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @return {Array<string>} Array of invoice ids
 */
 export async function getInvoiceIdsFromCollection(collectionName:string) {
    const invoiceIdArray:Array<string> = [];
    const dbInvoice = await admin.firestore()
        .collection(collectionName).listDocuments();
    for (const s of dbInvoice) {
      const QueryDocumentSnapshot = await s.get();
      const data: any = QueryDocumentSnapshot.data();
      const dataID: string = data.id;
      invoiceIdArray.push(dataID);
    }
    return invoiceIdArray;
  }
  