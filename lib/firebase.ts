import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2LJQCdJwbV8F62pkcO-JWJA_wffpConk",
  authDomain: "nsuk-nest.firebaseapp.com",
  projectId: "nsuk-nest",
  storageBucket: "nsuk-nest.firebasestorage.app",
  messagingSenderId: "1069722916190",
  appId: "1:1069722916190:web:3e7b3fa6f81a1b9860abcf",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);