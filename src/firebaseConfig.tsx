// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCW2XD9DMbyGjoO6xMRN0K6LbIHmdyywNU",
  authDomain: "zuzu-265e5.firebaseapp.com",
  projectId: "zuzu-265e5",
  storageBucket: "zuzu-265e5.firebasestorage.app",
  messagingSenderId: "273928393495",
  appId: "1:273928393495:web:7b09b145d8de9b7ec7dd52",
  measurementId: "G-2Z449PP4S1",
};

//Initialize Firebase

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
