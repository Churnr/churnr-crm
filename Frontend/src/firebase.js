// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyCpfpkqeuBePbx7vyRgKZgxEOcfl52gk48",

  authDomain: process.env.REACT_APP_AUT_DOMAIN,

  projectId: process.env.REACT_APP_PROJECT_ID,

  storageBucket: process.env.REACT_APP_STORGE_BUCKET,

  messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,

  appId: process.env.REACT_APP_APP_ID,

  measurementId: process.env.REACT_APP_MEASERUMENT_ID

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
