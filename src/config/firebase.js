import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4m4WhSreXrdpgWKLu_FesPVCr28kE6Zw",
  authDomain: "acd-app-c45bb.firebaseapp.com",
  databaseURL: "https://acd-app-c45bb-default-rtdb.firebaseio.com",
  projectId: "acd-app-c45bb",
  storageBucket: "acd-app-c45bb.firebasestorage.app",
  messagingSenderId: "530305515071",
  appId: "1:530305515071:web:cf8741dfd61eade9c6428a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// RecaptchaVerifier will be initialized when needed for phone auth
export const initRecaptcha = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: (response) => {
      // reCAPTCHA solved
    }
  });
};

export default app;
