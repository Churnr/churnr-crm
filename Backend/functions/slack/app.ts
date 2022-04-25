import * as slack from "@slack/web-api";

// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;

// Initialize
const web = new slack.WebClient(token);


const conversationId = "C03BZ4Z446A";

(async () => {
  // Post a message to the channel, and await the result.
  // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
  const result = await web.chat.postMessage({
    text: "Hello world!",
    channel: conversationId,
  });

  // The result contains an identifier for the message, `ts`.
  console.log(`Successfully send message ${result.ts}
   in conversation ${conversationId}`);
})();

/**
 * Gets invoice ids from invoice collection from firestore
 * and push it to array of strings - invoiceIdArray
 * @param {string} text
 * @param {string} channelId
 * @return {Array<string>} Array of invoice ids
 */
export async function publishMessage(text:string, channelId:string) {
  const token = process.env.SLACK_TOKEN;
  const web = new slack.WebClient(token);
  const result = await web.chat.postMessage({
    text: text,
    channel: channelId,
  });
  return result;
}
