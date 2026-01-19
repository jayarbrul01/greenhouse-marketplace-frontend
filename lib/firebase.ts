import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDo7ZU5lBD54wCpDszcOIxbT-dVpsguOLA",
  authDomain: "mail-authentication-d0a3b.firebaseapp.com",
  projectId: "mail-authentication-d0a3b",
  storageBucket: "mail-authentication-d0a3b.firebasestorage.app",
  messagingSenderId: "174719131752",
  appId: "1:174719131752:web:7cf2a657ff7423c5d75bdd",
  measurementId: "G-8BT6TJ6035"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase Cloud Messaging (only in browser)
let messaging: Messaging | null = null;
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging initialization error:", error);
  }
}

export { messaging, getToken, onMessage };
export default app;
