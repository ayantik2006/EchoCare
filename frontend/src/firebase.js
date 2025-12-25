import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAWJQ_Goxsz6XzUf5uYt0VHf-zQ4EHA8aM",
    authDomain: "login-4dc19.firebaseapp.com",
    projectId: "login-4dc19",
    storageBucket: "login-4dc19.firebasestorage.app",
    messagingSenderId: "236168663434",
    appId: "1:236168663434:web:9edde54fd79d1f9ea77873",
    measurementId: "G-2MB768HBXG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
