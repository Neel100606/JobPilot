// frontend/src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <--- Added this

const firebaseConfig = {
  apiKey: "AIzaSyD6_wg16M4CI9SwWf50Nkhf7XaRkTmKtmE",
  authDomain: "jobpilot-27575.firebaseapp.com",
  projectId: "jobpilot-27575",
  storageBucket: "jobpilot-27575.firebasestorage.app",
  messagingSenderId: "422387381786",
  appId: "1:422387381786:web:496d8d8edf6113b94543a3",
  measurementId: "G-RNMCXETHM5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Auth (Critical for Login/OTP)
export const auth = getAuth(app); 

export default app;