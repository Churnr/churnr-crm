/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import fetch from "node-fetch";
import * as customType from "../types/types";
import {App, ExpressReceiver} from "@slack/bolt";
import * as functions from "firebase-functions";
import * as firestoreUtils from "../utils/firestoreUtils";
import "dotenv/config";
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
      templates: new Map(),
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


export function retriveSendEmailInfoFromSlackReq(payload:any) {
  try {
    const emailRequest: customType.emailRequest = {
      companyName: payload.match(/(?<=companyName=").([^",]+)/g)[0],
      customerId: payload.mach(/(?<=customerId=").([^",]+)/g)[0],
      templateId: payload.match(/(?<=templateId=").([^",]+)/g)[0],
    };
    return emailRequest;
  } catch (error) {
    const payload = {
      text: "emailRequest Creation failed - null value found",
      channel: "C03CJBT6AE5",
    };
    requestSlack("POST", "chat.postMessage", payload);
    throw new Error("Value in emailRequest object, sent from slash command /sendemail, was null");
  }
}

/**
 * Function will use the response_url from the slack request
 * to send an acknowledgment to the slakc user
 * @param {string} req Slack request
 * @param {object} body text to send to the user
 * @return {Response} Slack response
 */
export async function slackAcknowledgmentResponse(req:any, body:object) {
  try {
    const responseUrl = req.body.response_url;
    const headers = {
      "Authorization": "Bearer " + process.env.SLACK_TOKEN,
      "Content-type": "application/json",
    };
    const options = {
      headers: headers,
      method: "POST",
      body: JSON.stringify(body),
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


export const slackAppFunctions = () => {
  const expressReceiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET as string | (() => PromiseLike<string>),
    endpoints: "/events",
    processBeforeResponse: true,
  });

  const app = new App({
    receiver: expressReceiver,
    token: process.env.SLACK_BOT_TOKEN,
    processBeforeResponse: true,
  });
  // Handle a view_submission request
  app.view("view_1", async ({ack, body, view, client, logger}) => {
  // Acknowledge the view_submission request
    await ack();

    // Do whatever you want with the input data -

    // Assume there's an input block with `block_1` as the block_id and `input_a`
    const email = view["state"]["values"]["input_c"].dreamy_input.value as string;
    const category = view["state"]["values"]["input_a"].dreamy_input.value as string;
    const company = view["state"]["values"]["input_b"].dreamy_input.value as string;
    if (email || company || category != undefined || "") {
      const customerObject = await firestoreUtils.getCustomerObjectBasedOnEmailFromCompany(company, email);
      const customerId = customerObject.handle;
      await firestoreUtils.updateActiveInvoiceWithActiveFlowVariables(company, customerId, category);
      const user = body["user"]["id"];
      // Message to send user
      const msg = `Customer flow activated with email: ${email} `;
      try {
        await client.chat.postMessage({
          channel: user,
          text: msg,
        });
      } catch (error) {
        logger.error(error);
      }
    } else {
      const user = body["user"]["id"];
      const msg = "Some of the variables were undefined";
      try {
        await client.chat.postMessage({
          channel: user,
          text: msg,
        });
      } catch (error) {
        logger.error(error);
      }
    }
  });


  app.command("/sendemail", async ({ack, body, client, logger}) => {
  // Acknowledge the command request
    await ack();

    try {
    // Call views.open with the built-in client
      await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: body.trigger_id,
        // View payload
        view: {
          type: "modal",
          // View identifier
          callback_id: "view_1",
          title: {
            type: "plain_text",
            text: "Churnr Activate Flow",
          },
          blocks: [
            {
              type: "input",
              block_id: "input_b",
              label: {
                type: "plain_text",
                text: "Company Name",
              },
              element: {
                type: "plain_text_input",
                action_id: "dreamy_input",
              },
            },
            {
              type: "input",
              block_id: "input_c",
              label: {
                type: "plain_text",
                text: "Email",
              },
              element: {
                type: "plain_text_input",
                action_id: "dreamy_input",
              },
            }, {
              type: "input",
              block_id: "input_a",
              label: {
                type: "plain_text",
                text: "Category",
              },
              element: {
                type: "plain_text_input",
                action_id: "dreamy_input",
              },
            },
          ],
          submit: {
            type: "plain_text",
            text: "Submit",
          },
        },
      });
    } catch (error) {
      logger.error(error);
    }
  });

  app.error(async (error) => {
    functions.logger.log("err", error);
  });

  app.command("/simon-say-hello", async ({command, ack, say}) => {
    await ack();

    await say(`You said "${command.text}"`);
  });

  return expressReceiver;
};
