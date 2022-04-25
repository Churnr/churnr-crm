/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
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
