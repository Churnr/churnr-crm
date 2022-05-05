/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import fetch from "node-fetch";
import * as customType from "../types/types";

/**
 * uses method variable, endpoit variable and param variable to
 * send request to slack
 * @param {string} method GET/POST
 * @param {string} endpoint Wuth api endpoint to use from slack
 * @param {any} param request payload
 * @return {customType.options} options
 */
export async function requestSlack(method:string, endpoint:string, param:any) {
  try {
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
  } catch (error) {
    throw error;
  }
}

/**
 * takes a payload, witch is usealy a string from slack request body.
 * uses regex to find the different variables in the string
 * and match them to the variable names in the company object.
 * returns the object
 * @param {any} payload usually a string
 * @return {customType.optcompany} object
 */
export function retriveCompanyInfoFromSlackReq(payload:any) {
  try {
    const company: customType.company = {
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
    return company;
  } catch (error) {
    const payload = {
      text: "Customer Creation failed - null value found",
      channel: "C03CJBT6AE5",
    };
    requestSlack("POST", "chat.postMessage", payload);
    throw new Error("Value in company object, sent from slash command /creatcompany, was null");
  }
}

/**
 * Function will use the response_url from the slack request
 * to send an acknowledgment to the slakc user
 * @param {string} req Slack request
 * @param {string} responseText text to send to the user
 * @return {Response} Slack response
 */
export async function slackAcknowledgmentResponse(req:any, responseText:string) {
  try {
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
  } catch (error) {
    throw error;
  }
}

/**
 * Function will send a message to the given channel
 * @param {string} message message to send to the channel
 * @param {string} channelId witch channel to send the message to
 */
export async function sendMessageToChannel(message:string, channelId:string) {
  try {
    const payload = {
      text: message,
      channel: channelId,
    };
    requestSlack("POST", "chat.postMessage", payload);
  } catch (error) {
    throw error;
  }
}
