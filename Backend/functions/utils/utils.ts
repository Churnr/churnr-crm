import fetch from "node-fetch";
import * as customType from '../types/types'

export async function testing_firebase_scope(url:string, options:customType.options, next_page_token:string="", return_array=[]):Promise<any> {
    const response:any = await (await fetch(url+next_page_token, options)).json()
    return_array = return_array.concat(response.content)
    if(response.next_page_token != undefined){
        return testing_firebase_scope(url, options, "&next_page_token="+response.next_page_token, return_array)
    }
    return return_array   
}
