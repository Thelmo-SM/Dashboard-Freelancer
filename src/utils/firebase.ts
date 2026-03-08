import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

type FirebasePublicKey =
  | 'apiKey'
  | 'authDomain'
  | 'projectId'
  | 'storageBucket'
  | 'messagingSenderId'
  | 'appId'
  | 'measurementId';

type FirebaseConfig = Record<FirebasePublicKey, string>;

const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: 'AIzaSyDNj9L7yfXfLy4lp02dnANzdvI6_sp7C1A',
  authDomain: 'thlemo-sm.firebaseapp.com',
  projectId: 'thlemo-sm',
  storageBucket: 'thlemo-sm.firebasestorage.app',
  messagingSenderId: '748830217063',
  appId: '1:748830217063:web:58f675cae13ec3bf0e55c2',
  measurementId: 'G-R1LNK8K6BE',
};

function readEnv(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: readEnv('NEXT_PUBLIC_FIREBASE_API_KEY', defaultFirebaseConfig.apiKey),
  authDomain: readEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', defaultFirebaseConfig.authDomain),
  projectId: readEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', defaultFirebaseConfig.projectId),
  storageBucket: readEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', defaultFirebaseConfig.storageBucket),
  messagingSenderId: readEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', defaultFirebaseConfig.messagingSenderId),
  appId: readEnv('NEXT_PUBLIC_FIREBASE_APP_ID', defaultFirebaseConfig.appId),
  measurementId: readEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', defaultFirebaseConfig.measurementId),
};

export function getMissingFirebaseEnvVars(): string[] {
  const mapping: Record<FirebasePublicKey, string> = {
    apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    measurementId: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  };

  return Object.entries(mapping)
    .filter(([, envName]) => !process.env[envName]?.trim())
    .map(([, envName]) => envName);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
