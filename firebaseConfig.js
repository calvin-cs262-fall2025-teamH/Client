import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfCvnS4GD0rV05QTMpDFgxMjla9B5YJxk",
  authDomain: "couple-bond.firebaseapp.com",
  projectId: "couple-bond",
  storageBucket: "couple-bond.appspot.com",
  messagingSenderId: "393171926065",
  appId: "1:393171926065:web:69ef733003b8c2e6556910",
  measurementId: "G-8PKJ4NJSVL" 
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
