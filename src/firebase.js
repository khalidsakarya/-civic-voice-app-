import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  projectId: 'civic-voice-5ea94',
  messagingSenderId: '560609528859',
  appId: '1:560609528859:web:bd5830fcd2a1efe065bcbe',
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export default app;
