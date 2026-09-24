import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// Check for user-provided Firebase config from environment or localStorage
export const getSavedFirebaseConfig = () => {
  const localConfig = localStorage.getItem("aura_firebase_config");
  if (localConfig) {
    try {
      return JSON.parse(localConfig);
    } catch (e) {
      console.warn("Invalid stored firebase config", e);
    }
  }

  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
};

let app = null;
let firestoreDb = null;
let firebaseAuth = null;
let isFirebaseActive = false;

const activeConfig = getSavedFirebaseConfig();

if (activeConfig && activeConfig.apiKey && activeConfig.projectId) {
  try {
    app = !getApps().length ? initializeApp(activeConfig) : getApp();
    firestoreDb = getFirestore(app);
    firebaseAuth = getAuth(app);
    isFirebaseActive = true;
    console.info("⚡ [AURA] Firebase initialized successfully with active project:", activeConfig.projectId);
  } catch (error) {
    console.warn("⚠️ [AURA] Firebase initialization failed, running in reactive local mode:", error);
    isFirebaseActive = false;
  }
} else {
  console.info("ℹ️ [AURA] Running in reactive local state mode. Add Firebase credentials anytime in Admin Settings.");
}

export { app, firestoreDb, firebaseAuth, isFirebaseActive };

export const saveFirebaseConfig = (newConfig) => {
  try {
    localStorage.setItem("aura_firebase_config", JSON.stringify(newConfig));
    window.location.reload();
  } catch (e) {
    console.error("Failed to save firebase config", e);
  }
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem("aura_firebase_config");
  window.location.reload();
};
