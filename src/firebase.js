import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'civic-voice-5ea94.firebaseapp.com',
  projectId: 'civic-voice-5ea94',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'civic-voice-5ea94.appspot.com',
  messagingSenderId: '560609528859',
  appId: '1:560609528859:web:bd5830fcd2a1efe065bcbe',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
