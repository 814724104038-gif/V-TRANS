/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';

// This will be replaced by the actual config if set_up_firebase succeeds
// For now, we use a placeholder that will be overwritten by the tool
const firebaseConfig = {
  apiKey: "PLACEHOLDER",
  authDomain: "PLACEHOLDER",
  projectId: "PLACEHOLDER",
  storageBucket: "PLACEHOLDER",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER"
};

// Try to load from the config file if it exists
let config = firebaseConfig;

// In this environment, we can assume the file might be injected
// We'll use fetch to load the config at runtime to avoid build-time resolution issues
const loadConfig = async () => {
  try {
    const response = await fetch('/firebase-applet-config.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn("Firebase config file not found or could not be loaded via fetch");
  }
  
  if (process.env.FIREBASE_CONFIG) {
    return JSON.parse(process.env.FIREBASE_CONFIG);
  }
  
  return firebaseConfig;
};

config = await loadConfig();

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, onSnapshot, orderBy };
