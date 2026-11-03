import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { createUpdateController } from './swUpdate';
import { mountUpdatePrompt } from './UpdatePrompt';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// A new version never activates by itself: the visitor is shown "New version available — Refresh" and the waiting
// worker is only activated when they click it (see src/swUpdate.js).
const swUpdate = createUpdateController();
mountUpdatePrompt(swUpdate);
serviceWorkerRegistration.register({ onRegistration: swUpdate.attach });
reportWebVitals();
