import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2aT0jbK59qoRaBEYFEz9JOYyGHTqcsds",
  authDomain: "letters-to-mohamed.firebaseapp.com",
  projectId: "letters-to-mohamed",
  storageBucket: "letters-to-mohamed.firebasestorage.app",
  messagingSenderId: "896944423275",
  appId: "1:896944423275:web:5acc155b250b9e38b78c2e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
