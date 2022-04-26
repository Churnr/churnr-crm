/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import fetch from "node-fetch";
import * as customType from "../types/types";
import * as functions from "firebase-functions";

export async function requestSlack(method:string, endpoint:string, param:any) {
  const baseUrl = "https://slack.com/api/";
  const headers = {
    "Authorization": "Bearer " + process.env.SLACK_TOKEN,
    "Content-type": "application/json",
  };
  const options = {
    headers: headers,
    method: method,
    body: "",
  };

  let requestUrl;
  if (method == "POST") {
    requestUrl = baseUrl + endpoint;
    options.body = JSON.stringify(param);
  } else {
    requestUrl = baseUrl + endpoint + param;
  }

  const response = await fetch(requestUrl, options);

  return response;
}

export async function retriveCustomerInfoFromSlackReq(payload:any) {
  const customer: customType.customer = {
    companyName: payload.match(/(?<=companyName=").([^",]+)/g)[0],
    paymentGateway: payload.match(/(?<=paymentGateway=").([^",]+)/g)[0],
    apiKey: payload.match(/(?<=apiKey=").([^",]+)/g)[0],
    emailGateway: payload.match(/(?<=emailGateway=").([^",]+)/g)[0],
    emailGatewayUser: payload.match(/(?<=emailGatewayUser=").([^",]+)/g)[0],
    emailGatewayPassword: payload.match(/(?<=emailGatewayPassword=").([^",]+)/g)[0],
    contactPerson: payload.match(/(?<=contactPerson=").([^",]+)/g)[0],
    flowEmails: payload.match(/(?<=flowEmails=").([^",]+)/g)[0],
    flowCalls: payload.match(/(?<=flowCalls=").([^",]+)/g)[0],
  };
  try {
    Object.values(customer).every((value) => {
      if (value === null) {
        throw new Error("Null value in customer object");
      }
    });
  } catch (error) {
    functions.logger.warn("Value in customer object, sent from slash command /creatcustomer, was null");
  }
  return customer;
}

export async function slackAcknowledgmentResponse(req:any, responseText:string) {
  const responseUrl = req.body.response_url;
  const headers = {
    "Authorization": "Bearer " + process.env.SLACK_TOKEN,
    "Content-type": "application/json",
  };
  const options = {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      text: responseText,
    }),
  };
  const response = await fetch(responseUrl, options);
  return response;
}

