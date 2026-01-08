import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyDt1STH3BQsD6rZqest2s-dBfk3odYJB2E",
  authDomain: "taller-db-20ee4.firebaseapp.com",
  projectId: "taller-db-20ee4",
  storageBucket: "taller-db-20ee4.firebasestorage.app",
  messagingSenderId: "1056469232210",
  appId: "1:1056469232210:web:8b3f271a487ceb6b7e4d8b",
  measurementId: "G-WFLRXBV8X5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
