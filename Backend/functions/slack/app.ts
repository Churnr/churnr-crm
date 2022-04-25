/* eslint-disable require-jsdoc */
import {WebClient} from "@slack/web-api";

const bot = new WebClient(process.env.SLACK_TOKEN);


export async function sendMessage(text:string, channelId:string) {
  try {
    const result = bot.chat.postMessage({
      channel: channelId,
      text: text,
    });
    return result;
  } catch (error) {
    return error;
  }
}

