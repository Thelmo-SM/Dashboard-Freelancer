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

function readEnv(name: string): string {
  return process.env[name]?.trim() ?? '';
}

const firebaseConfig: FirebaseConfig = {
  apiKey: readEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: readEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
  measurementId: readEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'),
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

  return Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => mapping[key as FirebasePublicKey]);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
