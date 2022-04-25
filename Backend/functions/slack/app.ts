import {WebClient} from "@slack/web-api";
// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;

// Initialize
const web = new WebClient(token);


/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @param {string} text
 * @param {string} channelId
 * @return {Array<string>} Array of invoice ids
 */
export async function publishMessage(text:string, channelId:string) {
  const result = await web.chat.postMessage({
    token: token,
    text: text,
    channel: channelId,
  });
  return result;
}


