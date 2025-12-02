import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBt2DVV-l9C88dzzhKT26c-aYUjI6wocZc",
    authDomain: "openow-aberto-agora.firebaseapp.com",
    projectId: "openow-aberto-agora",
    storageBucket: "openow-aberto-agora.firebasestorage.app",
    messagingSenderId: "1071111728446",
    appId: "1:1071111728446:web:107eed657ea7bffe00d06f",
    measurementId: "G-ZBSCP7ML93"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
