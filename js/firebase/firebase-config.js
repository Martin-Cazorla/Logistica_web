import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxN5tDIMjNAnVS2jwy2fkrJRbM2dAkEfI",
  authDomain: "logistica-e-commerce-29eb1.firebaseapp.com",
  projectId: "logistica-e-commerce-29eb1",
  storageBucket: "logistica-e-commerce-29eb1.firebasestorage.app",
  messagingSenderId: "44720412736",
  appId: "1:44720412736:web:891ddef17d6789ea6767a5"
};  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);