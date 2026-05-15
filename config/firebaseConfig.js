// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc9oaJ2xZKaa_6Xn35zKFhyC9r7mdiXaA",
  authDomain: "navlore-ceed9.firebaseapp.com",
  projectId: "navlore-ceed9",
  storageBucket: "navlore-ceed9.firebasestorage.app",
  messagingSenderId: "698204682710",
  appId: "1:698204682710:web:b9858024824413ce0f4c77",
  measurementId: "G-E4RYEWLE3E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Auth & Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);