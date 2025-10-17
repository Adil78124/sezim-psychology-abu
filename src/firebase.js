// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Конфигурация Firebase (данные из Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBKd-3ewj9aUGirH7BhNnCV5dgPR4sfJbA",
  authDomain: "psychology-sezim.firebaseapp.com",
  projectId: "psychology-sezim",
  storageBucket: "psychology-sezim.firebasestorage.app",
  messagingSenderId: "1015814882831",
  appId: "1:1015814882831:web:7983f0651e6d386daec57a",
  measurementId: "G-2KR9Q1C9D3"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Analytics (опционально)
export const analytics = getAnalytics(app);

// Экспорт сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

