/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import * as crypto from "crypto";
import tsscmp from "tsscmp";
import fetch from "node-fetch";

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


export function validateSlackSigningSecret(req:any) {
  // Your signing secret
  const slackSigningSecret = process.env.SLACK_SIGNING_SECRET!;

  // Grab the signature and timestamp from the headers
  const requestSignature = req.headers["x-slack-signature"] as string;
  const requestTimestamp = req.headers["x-slack-request-timestamp"];

  // Create the HMAC
  const hmac = crypto.createHmac("sha256", slackSigningSecret);

  // Update it with the Slack Request
  const [version, hash] = requestSignature.split("=");
  const base = `${version}:${requestTimestamp}:${JSON.stringify(req.body)}`;
  hmac.update(base);

  // Returns true if it matches
  return tsscmp(hash, hmac.digest("hex"));
}
