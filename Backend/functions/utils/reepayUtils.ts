/* eslint-disable no-useless-catch */
import * as customType from "../types/types";
import fetch from "node-fetch";
import * as firestoreUtils from "../utils/firestoreUtils";
import * as functions from "firebase-functions";
import {dailyUpdate} from "../types/types";
/**
 * Keeps sending request aslong as respons contains next_page_token
 * @param {string} url
 * @param {customType.options} options
 * @param {string} nextPageToken
 * @param {Promise<any>} returnArray
 * @return {Promise<any>} Array of url response.content
 */
export const retriveReepayList = async (url:string,
    options:customType.options,
    nextPageToken="",
    returnArray=[]):Promise<any> => {
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
};

/**
 * Creates HTTP options, with apikey, for reepay api requests
 * @param {string} apiKey
 * @return {customType.options} options
 */
export const createHttpOptionsForReepay = (apiKey:string) => {
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
};

/**
 * Retrives an invoice event from reepay
 * @param {customType.options} options
 * @param {string} invoiceId
 * @return {Promise<object[]>} response
 */
export const getReepayInvoiceEvents = async (options: customType.options, invoiceId: string): Promise<any[]> => {
  try {
    const url = `https://api.reepay.com/v1/event?invoice=${invoiceId}`;
    const response = await (await fetch(url, options)).json();
    return response.content;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrives a subscription object from reepay
 * @param {customType.options} options
 * @param {string} subId
 * @return {Promise<object[]>} response
 */
export const getReepaySubscriptionObject = async (options: customType.options, subId: string): Promise<any[]> => {
  try {
    const url = `https://api.reepay.com/v1/subscription/${subId}`;
    const response = await (await fetch(url, options)).json();
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrives a subscription object from reepay
 * @param {customType.options} options
 * @param {string} customerId
 * @return {Promise<object[]>} response
 */
export const getReepayCustomerObject = async (options: customType.options, customerId: string): Promise<any[]> => {
  try {
    const url = `https://api.reepay.com/v1/customer/${customerId}`;
    const response = await (await fetch(url, options)).json();
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrives a customers information from reepay.
 * Creates a customer object from the given information
 * @param {any} customerObject
 * @param {any} subscriptionObject
 * @return {customType.customer} customer object
 */
export const createCustomCustomerObject = async (
    customerObject: any, subscriptionObject:any): Promise<customType.customer> => {
  try {
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
      paymentLink: subscriptionObject.hosted_page_links.payment_info,
    };
    return customer;
  } catch (error) {
    throw error;
  }
};

// transaction object, find alle mulige keys, have fat i map der har transaction

// check if transaction has either mps_transaction or card
// code from outsourced person
// don't kill me simon, pls. i was forced by Benjamin LØGNER
export const checkTransactionVariable = (invoiceObject:any, state:string) => {
  if (invoiceObject.transactions.length > 0) {
    const transaction = invoiceObject.transactions[invoiceObject.transactions.length-1];
    if (transaction?.card_transaction != undefined) {
      return transaction.card_transaction[state];
    } else if (transaction?.mpo_transaction != undefined) {
      return transaction?.mpo_transaction[state];
    } else if (transaction?.vipps_transaction != undefined) {
      return transaction?.vipps_transaction[state];
    } else if (transaction?.applepay_transaction != undefined) {
      return transaction?.applepay_transaction[state];
    } else if (transaction?.googlepay_transaction != undefined) {
      return transaction?.googlepay_transaction[state];
    } else if (transaction?.viabill_transaction != undefined) {
      return transaction.viabill_transaction[state];
    } else if (transaction?.resurs_transaction != undefined) {
      return transaction.resurs_transaction[state];
    } else if (transaction?.klarna_transaction != undefined) {
      return transaction.klarna_transaction[state];
    } else if (transaction?.swish_transaction != undefined) {
      return transaction.swish_transaction[state];
    } else if (transaction?.paypal_transaction != undefined) {
      return transaction.paypal_transaction[state];
    } else if (transaction?.pgw_transaction != undefined) {
      return transaction.pgw_transaction[state];
    } else if (transaction?.blik_transaction != undefined) {
      return transaction.blik_transaction[state];
    } else if (transaction?.ideal_transaction != undefined) {
      return transaction.ideal_transaction[state];
    } else if (transaction?.p24_transaction != undefined) {
      return transaction.p24_transaction[state];
    } else if (transaction?.mps_transaction != undefined) {
      return transaction.mps_transaction[state];
    } else {
      return undefined;
    }
  } else {
    return "soft_declined";
  }
};


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
export const reepayLogic = async (companyApikey: string, companyName:string):Promise<dailyUpdate> => {
  const updatelogic = {retianed: 0,
    onhold: 0,
    newDunning: 0};
  const options = createHttpOptionsForReepay(companyApikey);
  const reepayInvoiceArray: Array<any> =
      await retriveReepayList("https://api.reepay.com/v1/list/invoice?size=100&state=dunning", options);


  const customerDocData =
      await firestoreUtils.retriveCustomersDocDataFromCompany(companyName);
  const customerIdArray = firestoreUtils.retriveDocIdsFromDocData(customerDocData);
  const activeInvoiceDocData =
      await firestoreUtils.retriveActiveInvoicesDocDataFromCompany(companyName);
  const activeInvoiceIdArray = firestoreUtils.retriveDocIdsFromDocData(activeInvoiceDocData);

  for (const dunningInvoices of reepayInvoiceArray) {
    if (activeInvoiceIdArray.indexOf(dunningInvoices.handle) == -1) {
      updatelogic.newDunning = updatelogic.newDunning+1;
      if (customerIdArray.indexOf(dunningInvoices.customer) == -1) {
        const customerObject = await getReepayCustomerObject(options, dunningInvoices.customer);
        const subscriptionObject = await getReepaySubscriptionObject(options, dunningInvoices.subscription);
        const customCustomerObject = await createCustomCustomerObject(customerObject, subscriptionObject);
        await firestoreUtils.addDataToDocInCollectionUnderCompany("Customers",
            companyName, customCustomerObject, customCustomerObject.handle);
        await firestoreUtils.addInvoceToCustomer(companyName, customCustomerObject.handle, dunningInvoices);
      } else {
        await firestoreUtils.addInvoceToCustomer(companyName, dunningInvoices.customer, dunningInvoices);
      }
      await firestoreUtils.addActiveInvoiceToCompany(companyName,
          dunningInvoices);
    }
  }

  const reepayInvoiceIdArray = reepayInvoiceArray.map((a) => {
    return a.handle;
  });

  for (const invoiceId of activeInvoiceIdArray) {
    if (reepayInvoiceIdArray.indexOf(invoiceId) == -1) {
      const eventsArray = await getReepayInvoiceEvents(options, invoiceId);
      if (eventsArray.length != 0) {
        if (eventsArray[0].event_type == "invoice_dunning_cancelled") {
          if (eventsArray[1].event_type == "invoice_settled") {
            firestoreUtils.updateInvoiceEndDate(companyName, invoiceId);
            firestoreUtils.updateInvoiceStatusValue(companyName, invoiceId, "retained");
            updatelogic.retianed = updatelogic.retianed+1;
          } else if (eventsArray[1].event_type == "invoice_cancelled") {
            firestoreUtils.updateInvoiceEndDate(companyName, invoiceId);
            firestoreUtils.updateInvoiceStatusValue(companyName, invoiceId, "onhold");
            updatelogic.newDunning = updatelogic.onhold+1;
          }
        } else if (eventsArray[0].event_type == "invoice_settled") {
          firestoreUtils.updateInvoiceEndDate(companyName, invoiceId);
          firestoreUtils.updateInvoiceStatusValue(companyName, invoiceId, "retained");
          updatelogic.retianed = updatelogic.retianed+1;
        } else if (eventsArray[0].event_type == "invoice_cancelled") {
          firestoreUtils.updateInvoiceEndDate(companyName, invoiceId);
          firestoreUtils.updateInvoiceStatusValue(companyName, invoiceId, "onhold");
          updatelogic.newDunning = updatelogic.onhold+1;
        } else if (eventsArray[0].event_type == "invoice_failed" ||
        eventsArray[0].event_type == "invoice_refund" ||
        eventsArray[0].event_type == "invoice_reactivate" ||
        eventsArray[0].event_type == "invoice_credited" ||
        eventsArray[0].event_type == "invoice_changed") {
          functions.logger.error("EVENT_TYPE IS NOT SUPPORTED!!!", eventsArray[0].event_type, invoiceId);
        }
      }
    }
  }
  return updatelogic;
};


