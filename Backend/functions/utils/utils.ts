import * as customType from "../types/types";
import fetch from "node-fetch";
/**
 * Keeps sending request aslong respons contains next_page_token
 * @param {string} url Current year
 * @param {customType.options} options
 * @param {string} nextPageToken
 * @param {Promise<any>} returnArray
 * @return {Promise<any>} Array of url response.content
 */
export async function retriveReepayList(url:string,
    options:customType.options,
    nextPageToken="",
    returnArray=[]):Promise<any> {
  const response:any = await (await fetch(url+nextPageToken, options)).json();
  returnArray = returnArray.concat(response.content);
  if (response.nextPageToken != undefined) {
    return retriveReepayList(url, options, "&next_page_token="+
                                response.nextPageToken, returnArray);
  }
  return returnArray;
}
