import {App, LogLevel} from "@slack/bolt";
// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;

// Initialize
const app = new App({
  token: token,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
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
    token: token,
    text: text,
    channel: channelId,
  });
  return result;
}


