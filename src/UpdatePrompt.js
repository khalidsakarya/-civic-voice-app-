import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { SW_UPDATE_STATUS } from './swUpdate';

// Small, non-blocking "New version available — Refresh" prompt. It is a polite live region (announced by screen
// readers without stealing focus), uses real <button>s (keyboard reachable, visible focus ring), never auto-closes
// and never reloads by itself: only the Refresh button does.

const STYLE = `
.cv-update-prompt button:focus-visible { outline: 2px solid #ffffff; outline-offset: 2px; }
.cv-update-prompt button:disabled { opacity: 0.7; cursor: default; }
@media (prefers-reduced-motion: no-preference) { .cv-update-prompt { transition: opacity 120ms ease-out; } }
`;

const box = {
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: 'max(env(safe-area-inset-bottom), 16px)',
  zIndex: 2147483000,
  maxWidth: 'calc(100vw - 32px)',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  padding: '10px 14px',
  borderRadius: 12,
  background: '#111827',
  color: '#ffffff',
  fontSize: 14,
  lineHeight: 1.3,
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
};
const primary = { background: '#ffffff', color: '#111827', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 600, fontSize: 14, cursor: 'pointer' };
const ghost = { background: 'transparent', color: '#ffffff', border: 'none', borderRadius: 8, padding: '4px 8px', fontSize: 16, cursor: 'pointer' };

/** @param {{ controller: ReturnType<typeof import('./swUpdate').createUpdateController> }} props */
export function UpdatePrompt({ controller }) {
  const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
  if (state.status === SW_UPDATE_STATUS.IDLE || state.dismissed) return null;
  const applying = state.status === SW_UPDATE_STATUS.APPLYING;
  return (
    <div className="cv-update-prompt" role="status" aria-live="polite" data-testid="sw-update-prompt" style={box}>
      <style>{STYLE}</style>
      <span>New version available —</span>
      <button type="button" style={primary} disabled={applying} onClick={controller.refresh}>
        {applying ? 'Updating…' : 'Refresh'}
      </button>
      <button type="button" style={ghost} aria-label="Dismiss update notice" onClick={controller.dismiss}>
        ✕
      </button>
      {state.message ? (
        <span role="alert" style={{ flexBasis: '100%', fontSize: 12, color: '#fecaca' }}>
          {state.message}
        </span>
      ) : null}
    </div>
  );
}

/** Mounts the prompt in its own React root, outside the application tree (the application itself is untouched). */
export function mountUpdatePrompt(controller, doc = document) {
  const host = doc.createElement('div');
  host.id = 'cv-update-prompt-root';
  doc.body.appendChild(host);
  createRoot(host).render(<UpdatePrompt controller={controller} />);
  return host;
}
