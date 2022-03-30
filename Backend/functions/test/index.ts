import {expect, assert} from 'chai';
// import * as nock from 'nock';
// import * as test from 'firebase-functions-test'
// import * as functions from "firebase-functions";
// import * as myFunctions from '../src/index'



// beforeEach(()=>{
//  nock('https://api.reepay.com')
//     .get('/v1/list/invoice?size=100&state=dunning')
//     .reply(200, {
//         "args": {},
//         "headers": {
//           "Accept": "application/json",
//           "origin": "0.0.0.0",
//           "url": "https://api.reepay.com/v1/list/invoice?size=100&state=dunning"
//         },
//         "body": {
//             "next_page_token":"asd"
//         }
//     })
// });


let answer = 43

describe('Array', function () {
    describe('#indexOf()', function () {
      it('should return -1 when the value is not present', function () {
        assert.equal([1, 2, 3].indexOf(1), 0);
      });
    });
    describe('Equal to', function () {
      it("TESTING", function () {
        expect(answer).to.equal(43)
      });
      it("Is number", function () {
        expect(answer).to.be.a("number")
      });
    });
  });


