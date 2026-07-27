import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  // @ts-ignore: getReactNativePersistence exists at runtime for React Native
  // but isn't included in firebase/auth's TypeScript declarations yet.
  // See https://github.com/firebase/firebase-js-sdk/issues/9316
  getReactNativePersistence,
} from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  projectId: "gen-lang-client-0205908021",
  appId: "1:611492344945:web:8e3ec6634c3ad4dba017d0",
  apiKey: "AIzaSyADewfPQKlp24LLFmG77xJber5ce9mFmgw",
  authDomain: "gen-lang-client-0205908021.firebaseapp.com",
  storageBucket: "gen-lang-client-0205908021.firebasestorage.app",
  messagingSenderId: "611492344945",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, "ai-studio-1779f9cb-fcda-4b92-a5dc-866c4c1be75c");

const storage = getStorage(app);

export { app, auth, db, storage };