import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcz63RkdgZTCqWQHGsVQdvVkhq2hM7Y1s",
  authDomain: "my-relationship-app-81855.firebaseapp.com",
  projectId: "my-relationship-app-81855",
  storageBucket: "my-relationship-app-81855.firebasestorage.app",
  messagingSenderId: "872079618243",
  appId: "1:872079618243:web:c853eca1efdc26bb29f276",
  measurementId: "G-YR4YEXF56M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);