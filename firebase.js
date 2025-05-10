// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBDylqfUyh-h5fCpIaraJUXFmSHimTRSn0",
    authDomain: "estore-2025.firebaseapp.com",
    projectId: "estore-2025",
    storageBucket: "estore-2025.firebasestorage.app",
    messagingSenderId: "386803224109",
    appId: "1:386803224109:web:0f291aca1906afe69072a4",
    measurementId: "G-35N7VRFTGG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider };
