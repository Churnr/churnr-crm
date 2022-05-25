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
import {company} from "../types/types";
import "dotenv/config";
const config = functions.config();
const slackbottoken = config.env.slackbottoken;
const signingSecret = config.env.slacksigning as string | (() => PromiseLike<string>);
// const slackbottoken = process.env.SLACK_BOT_TOKEN;
// const signingSecret = process.env.SLACK_SIGNING as string | (() => PromiseLike<string>);
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

// /**
//  * takes a payload, witch is usealy a string from slack request body.
//  * uses regex to find the different variables in the string
//  * and match them to the variable names in the company object.
//  * returns the object
//  * @param {any} payload usually a string
//  * @return {customType.optcompany} object
//  */
// export function retriveCompanyInfoFromSlackReq(payload:any) {
//   try {
//     const company: customType.company = {
//       companyName: payload.match(/(?<=companyName=").([^",]+)/g)[0],
//       paymentGateway: payload.match(/(?<=paymentGateway=").([^",]+)/g)[0],
//       apiKey: payload.match(/(?<=apiKey=").([^",]+)/g)[0],
//       emailGateway: payload.match(/(?<=emailGateway=").([^",]+)/g)[0],
//       emailGatewayUser: payload.match(/(?<=emailGatewayUser=").([^",]+)/g)[0],
//       emailGatewayPassword: payload.match(/(?<=emailGatewayPassword=").([^",]+)/g)[0],
//       contactPerson: payload.match(/(?<=contactPerson=").([^",]+)/g)[0],
//       flowEmails: payload.match(/(?<=flowEmails=").([^",]+)/g)[0],
//       flowCalls: payload.match(/(?<=flowCalls=").([^",]+)/g)[0],
//       templates: new Map(),
//     };
//     return company;
//   } catch (error) {
//     const payload = {
//       text: "Customer Creation failed - null value found",
//       channel: "C03CJBT6AE5",
//     };
//     requestSlack("POST", "chat.postMessage", payload);
//     throw new Error("Value in company object, sent from slash command /creatcompany, was null");
//   }
// }


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
    signingSecret: signingSecret,
    endpoints: "/events",
    processBeforeResponse: true,
  });

  const app = new App({
    receiver: expressReceiver,
    token: slackbottoken,
    processBeforeResponse: true,
  });
  // Handle a view_submission request
  app.view("view_1", async ({ack, body, view, client, logger}) => {
  // Acknowledge the view_submission request
    await ack();

    // Do whatever you want with the input data -

    // Assume there's an input block with `block_1` as the block_id and `input_a`
    const company = view["state"]["values"]["static"]["static_select-action"]["selected_option"]!["text"].text as string;
    const email = view["state"]["values"]["plain"]["plain_text"].value as string;
    const category = view["state"]["values"]["radio"]["radio_buttons-action"].selected_option!.text.text as string;
    try {
      let camelCategory: string;
      switch (category) {
        case "Insufficient funds":
          camelCategory = "insufficientFunds";
          break;
        case "Card expired":
          camelCategory = "cardExpired";
          break;
        case "Technical error":
          camelCategory = "technicalError";
          break;
        default:
          camelCategory = "None";
          break;
      }
      const customerObject = await firestoreUtils.getCustomerObjectBasedOnEmailFromCompany(company, email);
      const customerId = customerObject.handle;
      await firestoreUtils.updateActiveInvoiceWithActiveFlowVariables(company, customerId, camelCategory);
      const user = body["user"]["id"];
      const msg = `Customer flow activated with email: ${email} `;
      try {
        await client.chat.postMessage({
          channel: user,
          text: msg,
        });
      } catch (error) {
        logger.error(error);
      }
    } catch (error) {
      const user = body["user"]["id"];
      await client.chat.postMessage({
        channel: user,
        text: `An error occured: ${error}`,
      });
    }
  });


  app.command("/activateflow", async ({ack, body, client, logger}) => {
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
          callback_id: "view_1",
          title: {
            type: "plain_text",
            text: "Churnr Activate Flow",
            emoji: true,
          },
          submit: {
            type: "plain_text",
            text: "Submit",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Cancel",
            emoji: true,
          },
          blocks: [
            {
              type: "input",
              block_id: "static",
              element: {
                type: "static_select",
                placeholder: {
                  type: "plain_text",
                  text: "Select an item",
                  emoji: true,
                },
                options: [
                  {
                    text: {
                      type: "plain_text",
                      text: "Lalatoys",
                      emoji: true,
                    },
                    value: "value-0",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Spiritium",
                      emoji: true,
                    },
                    value: "value-1",
                  },
                ],
                action_id: "static_select-action",
              },
              label: {
                type: "plain_text",
                text: "Company",
                emoji: true,
              },
            },
            {
              type: "input",
              block_id: "plain",
              element: {
                type: "plain_text_input",
                action_id: "plain_text",
                placeholder: {
                  type: "plain_text",
                  text: "Enter customer email",
                },
              },
              label: {
                type: "plain_text",
                text: "Email",
                emoji: true,
              },
            },
            {
              type: "input",
              block_id: "radio",
              element: {
                type: "radio_buttons",
                options: [
                  {
                    text: {
                      type: "plain_text",
                      text: "Insufficient funds",
                      emoji: true,
                    },
                    value: "value-0",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Card expired",
                      emoji: true,
                    },
                    value: "value-1",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Technical error",
                      emoji: true,
                    },
                    value: "value-2",
                  },
                ],
                action_id: "radio_buttons-action",
              },
              label: {
                type: "plain_text",
                text: "Category",
                emoji: true,
              },
            },
          ],
        },
      });
    } catch (error) {
      logger.error(error);
    }
  });

  app.view("view_2", async ({ack, body, view, client, logger}) => {
    // Acknowledge the view_submission request
    await ack();

    // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verifcation of their submission

    // Assume there's an input block with `block_1` as the block_id and `input_a`
    // const email = view['state']['values']['input_c'].dreamy_input.value;
    // const category = view['state']['values']['input_a'].dreamy_input.value;
    const user = body["user"]["id"];
    const company: company = {
      companyName: view["state"]["values"].Company_Name.plain_text.value as string,
      paymentGateway: view["state"]["values"].Payment_gateway.plain_text.value as string,
      apiKey: view["state"]["values"].Api_key.plain_text.value as string,
      emailGateway: view["state"]["values"].Email_gateway.plain_text.value as string,
      emailGatewayUser: view["state"]["values"].Email_gateway_user.plain_text.value as string,
      emailGatewayPassword: view["state"]["values"].Email_gateway_password.plain_text.value as string,
      contactPerson: view["state"]["values"].Contact_person.plain_text.value as string,
    };

    firestoreUtils.addCompanyToFirestore(company);
    // Message to send user
    const msg = "This might work??";
    // Save to DB
    // const results = await db.set(user.input, val);

    // Message the user
    try {
      await client.chat.postMessage({
        channel: user,
        text: msg,
      });
    } catch (error) {
      logger.error(error);
    }
  });
  app.command("/createcompany", async ({ack, body, client, logger}) => {
    // Acknowledge the command request
    await ack();

    try {
      // Call views.open with the built-in client
      await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: body.trigger_id,
        // View payload
        view: {
          "type": "modal",
          "callback_id": "view_2",
          "title": {
            type: "plain_text",
            text: "Churnr Activate Flow",
            emoji: true,
          },
          "submit": {
            type: "plain_text",
            text: "Submit",
            emoji: true,
          },
          "close": {
            type: "plain_text",
            text: "Cancel",
            emoji: true,
          },
          "blocks": [
            {
              "type": "input",
              "block_id": "Company_Name",
              "element": {
                "type": "plain_text_input",
                "action_id": "plain_text",
              },
              "label": {
                "type": "plain_text",
                "text": "Company Name",
                "emoji": true,
              },
            },
            {
              "type": "input",
              "block_id": "Payment_gateway",
              "element": {
                "type": "plain_text_input",
                "action_id": "plain_text",
              },
              "label": {
                "type": "plain_text",
                "text": "Payment gateway",
                "emoji": true,
              },
            },
            {
              "type": "input",
              "block_id": "Api_key",
              "element": {
                "type": "plain_text_input",
                "action_id": "plain_text",
              },
              "label": {
                "type": "plain_text",
                "text": "Api key",
                "emoji": true,
              },
            },
            {
              "type": "input",
              "block_id": "Email_gateway",
              "element": {
                "type": "plain_text_input",
                "action_id": "plain_text",
              },
              "label": {
                "type": "plain_text",
                "text": "Email gateway",
                "emoji": true,
              },
            },
            {
              "type": "input",
              "block_id": "Email_gateway_user",
              "element": {
                "type": "plain_text_input",
                "action_id": "plain_text",
              },
              "label": {
                "type": "plain_text",
                "text": "Email gateway user",
                "emoji": true,
              },
            },
            {
              "type": "input",
              "block_id": "Email_gateway_password",
              "element": {
                "type": "plain_text_input",
                "action_id": "plain_text",
              },
              "label": {
                "type": "plain_text",
                "text": "Email gateway password",
                "emoji": true,
              },
            },
            {
              "type": "input",
              "block_id": "Contact_person",
              "element": {
                "type": "plain_text_input",
                "action_id": "plain_text",
              },
              "label": {
                "type": "plain_text",
                "text": "Contact person",
                "emoji": true,
              },
            },
          ],
        },
      });
    } catch (error) {
      logger.error(error);
    }
  });
  app.error(async (error) => {
    functions.logger.log("err", error);
  });

  //*

  app.command("/simon-say-hello", async ({command, ack, say}) => {
    await ack();

    await say(`You said "${command.text}"`);
  });

  app.view("view_3", async ({ack, body, view, client, logger}) => {
    // Acknowledge the view_submission request
    await ack();

    // Do whatever you want with the input data -

    // Assume there's an input block with `block_1` as the block_id and `input_a`
    const company = view["state"]["values"]["static"]["static_select-action"]["selected_option"]!["text"].text as string;
    const email = view["state"]["values"]["plain"]["plain_text"].value as string;
    const category = view["state"]["values"]["radio"]["radio_buttons-action"].selected_option!.text.text as string;
    try {
      let camelCategory: string;
      switch (category) {
        case "Insufficient funds":
          camelCategory = "insufficientFunds";
          break;
        case "Card expired":
          camelCategory = "cardExpired";
          break;
        case "Technical error":
          camelCategory = "technicalError";
          break;
        default:
          camelCategory = "None";
          break;
      }
      const customerObject = await firestoreUtils.getCustomerObjectBasedOnEmailFromCompany(company, email);
      const customerId = customerObject.handle;
      await firestoreUtils.updateFlowErrorOnInvoice(company, customerId, camelCategory);
      const user = body["user"]["id"];
      const msg = `Error for email flow on customer with email ${email} has been updated to ${category}`;
      try {
        await client.chat.postMessage({
          channel: user,
          text: msg,
        });
      } catch (error) {
        logger.error(error);
      }
    } catch (error) {
      const user = body["user"]["id"];
      await client.chat.postMessage({
        channel: user,
        text: `An error occured: ${error}`,
      });
    }
  });


  app.command("/updateflowerror", async ({ack, body, client, logger}) => {
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
          callback_id: "view_3",
          title: {
            type: "plain_text",
            text: "Churnr Change Error Flow",
            emoji: true,
          },
          submit: {
            type: "plain_text",
            text: "Submit",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Cancel",
            emoji: true,
          },
          blocks: [
            {
              type: "input",
              block_id: "static",
              element: {
                type: "static_select",
                placeholder: {
                  type: "plain_text",
                  text: "Select an item",
                  emoji: true,
                },
                options: [
                  {
                    text: {
                      type: "plain_text",
                      text: "Lalatoys",
                      emoji: true,
                    },
                    value: "value-0",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Spiritium",
                      emoji: true,
                    },
                    value: "value-1",
                  },
                ],
                action_id: "static_select-action",
              },
              label: {
                type: "plain_text",
                text: "Company",
                emoji: true,
              },
            },
            {
              type: "input",
              block_id: "plain",
              element: {
                type: "plain_text_input",
                action_id: "plain_text",
                placeholder: {
                  type: "plain_text",
                  text: "Enter customer email",
                },
              },
              label: {
                type: "plain_text",
                text: "Email",
                emoji: true,
              },
            },
            {
              type: "input",
              block_id: "radio",
              element: {
                type: "radio_buttons",
                options: [
                  {
                    text: {
                      type: "plain_text",
                      text: "Insufficient funds",
                      emoji: true,
                    },
                    value: "value-0",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Card expired",
                      emoji: true,
                    },
                    value: "value-1",
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Technical error",
                      emoji: true,
                    },
                    value: "value-2",
                  },
                ],
                action_id: "radio_buttons-action",
              },
              label: {
                type: "plain_text",
                text: "Category",
                emoji: true,
              },
            },
          ],
        },
      });
    } catch (error) {
      logger.error(error);
    }
  });

  return expressReceiver;
};

