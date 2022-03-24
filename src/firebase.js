// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyDIu5UUR1E8Slx-Iwt6bwp9tjgLcwBdhU8",

  authDomain: "churnr-system.firebaseapp.com",

  projectId: "churnr-system",

  storageBucket: "churnr-system.appspot.com",

  messagingSenderId: "679339937318",

  appId: "1:679339937318:web:13eb0a3e1e41414d4be0e7",

  measurementId: "G-Q96LHT7WHS"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
