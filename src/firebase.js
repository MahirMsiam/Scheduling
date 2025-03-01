// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2LMzj1E9Peb144AWQyFeiVxCEdCdTV70",
  authDomain: "volunteer-schedule-991e3.firebaseapp.com",
  projectId: "volunteer-schedule-991e3",
  storageBucket: "volunteer-schedule-991e3.firebasestorage.app",
  messagingSenderId: "300472646617",
  appId: "1:300472646617:web:9b207f097c1c03ecedb7c8",
  databaseURL: "https://volunteer-schedule-991e3-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
export default app;