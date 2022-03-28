import * as functions from "firebase-functions";
import * as admin from "firebase-admin"
import fetch from "node-fetch";
// import { doc, setDoc } from "firebase/firestore"; 
admin.initializeApp();

type options = {
    "method": string,
    "headers": headers,
    "json": boolean
};
type headers = {
    "Content-Type": string,
    "Authorization": string
}


async function testing_firebase_scope(url:string, options:options, next_page_token:string="", return_array=[]):Promise<any> {
    const response:any = await (await fetch(url+next_page_token, options)).json()
    return_array = return_array.concat(response.content)
    if(response.next_page_token != undefined){
        return testing_firebase_scope(url, options, "&next_page_token="+response.next_page_token, return_array)
    }
    return return_array   
}



// FUNCTION #1 Filtering and checking - scheduler
//      1. fetch API data - DONE
//      2. filtrér data (invoice id)
//      3. Check if same customer, but different invoice ids
//      4. Cross reference with Current invoice collection and Reepay API
//      5. Save remaining data
exports.fetchDunningInvoices = functions.https.onRequest(async (req, res) => {
    const _url = 'https://api.reepay.com/v1/list/invoice?size=100&state=dunning'

    const headers:headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.API_KEY_LALATOYS}`
    }

    const options:options = {
        method: 'GET',
        headers: headers,
        json: true
    };

    const content_array:Array<any> = await testing_firebase_scope(_url, options)
    // const writeResult = await admin.firestore().collection('ActivDunning').add(content_array)
    for (let dunningInvoices of content_array){
        await admin.firestore().collection('ActivDunning').add(dunningInvoices);
      }

    res.json({result: `Message with ID: ${content_array} added.`});
  });
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
 export const helloWorld = functions.https.onRequest((request, response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from");
});


// F#1 -> F#2
// FUNCTION #2 Updating the active dunning list (not failed) - scheduler
//      1.
//      2. 

