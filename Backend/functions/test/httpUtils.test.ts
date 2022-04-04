import {expect} from 'chai';
import {describe, it} from "mocha";
import * as nock from "nock";
import * as httpUtils from "../utils/httpUtils";
import * as customType from "../types/types";
// import * as nock from 'nock';
// import * as test from 'firebase-functions-test'
// import * as functions from "firebase-functions";
// import * as myFunctions from '../src/index'



describe('Testing httpUtils.ts', () => {
    it('Testing function: retriveReepayList', async () => {
        nock('https://test.net')
        .get('/retriveReepayList/test')
        .reply(200, {
                "content":"1",
                "next_page_token":"asd"
        })
        .get('/retriveReepayList/test&next_page_token=asd')
        .reply(200, {
                "content":"2",
                "next_page_token":"dsa"
        })
        .get('/retriveReepayList/test&next_page_token=dsa')
        .reply(200, {
                "content":"3",
        })
        const headers: customType.headers = {
            "Content-Type": "application/json",
            "Authorization": `Basic 123`,
        };
        const options: customType.options = {
            method: "GET",
            headers: headers,
            json: true,
        };
      expect(await httpUtils.retriveReepayList("https://test.net/retriveReepayList/test",options)).to.eql(["1","2","3"]);
    });
  });