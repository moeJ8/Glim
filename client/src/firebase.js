// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // ✅ Use import.meta.env
  // Use auth subdomain for authentication
  authDomain: window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1")
    ? "mern-blog-d9c14.firebaseapp.com"
    : window.location.hostname === "glim.blog" ? "glim.blog" : "auth.glim.blog",
  projectId: "mern-blog-d9c14",
  storageBucket: "mern-blog-d9c14.firebasestorage.app",
  messagingSenderId: "1075273492029",
  appId: "1:1075273492029:web:7d6f375599f2358434ec54"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);