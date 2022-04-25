import * as functions from "firebase-functions";
import {App} from "@slack/bolt";
const config = functions.config();
// Read a token from the environment variables

// Initialize
const app = new App({
  signingSecret: config.slack.signing_secret,
  token: config.slack.bot_token,
});

/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @param {string} text
 * @param {string} channelId
 * @return {Array<string>} Array of invoice ids
 */
export async function publishMessage(text:string, channelId:string) {
  const result = await app.client.chat.postMessage({
    token: process.env.SLACK_TOKEN,
    text: text,
    channel: channelId,
  });
  return result;
}


