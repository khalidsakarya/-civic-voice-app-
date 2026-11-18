// Civic Voice Canada - service-worker preview probe. READ-ONLY: it only reads browser state.
// It does NOT request notification permission, register a push token, call Firebase, or write anything
// (it only READS Notification.permission, which never prompts).
//
// Use (from docs/service-worker-and-fcm.md section 7): open DevTools (F12) on the preview tab -> Console -> paste this whole file -> Enter.
// It prints one JSON record and also stores it in window.__swProbeLog (an array) so you can paste several
// snapshots (before / after) and copy them all with:  copy(JSON.stringify(window.__swProbeLog, null, 2))
(async () => {
  const q = (sel) => document.querySelector(sel);
  const regs = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistrations() : [];
  const w = (x) => (x ? { state: x.state, script: x.scriptURL.replace(location.origin, '') } : null);
  const prompt = q('[data-testid="sw-update-prompt"]');
  const mains = [...document.scripts].map((s) => s.src.split('/').pop()).filter((x) => /^main\./.test(x));
  const fbEntries = performance.getEntriesByType('resource').filter((e) => /firestore\.googleapis|fcmregistrations|fcm\.googleapis|firebaseinstallations/.test(e.name));
  const rec = {
    at: new Date().toISOString(),
    url: location.href,
    origin: location.origin,
    browser: navigator.userAgent,
    mainBundle: mains[0] || null, // identifies the BUILD: it changes on every deploy that changes the app code
    registrations: regs.length,
    registration: regs[0]
      ? { scope: new URL(regs[0].scope).pathname, active: w(regs[0].active), waiting: w(regs[0].waiting), installing: w(regs[0].installing) }
      : null,
    pageIsControlled: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
    updatePrompt: prompt
      ? { text: prompt.textContent.replace(/\s+/g, ' ').trim(), role: prompt.getAttribute('role'), buttons: [...prompt.querySelectorAll('button')].map((b) => b.textContent.trim()) }
      : null,
    reloadGuardSessionKey: sessionStorage.getItem('cv_sw_reload_at'),
    online: navigator.onLine,
    notificationPermission: typeof Notification === 'undefined' ? 'unsupported' : Notification.permission, // must stay "default"
    firebaseResourceEntries: fbEntries.length, // best effort; the Network panel with request blocking is the real evidence
    pageHasContent: document.body.innerText.length > 200,
  };
  (window.__swProbeLog = window.__swProbeLog || []).push(rec);
  console.log(JSON.stringify(rec, null, 2));
  return rec;
})();
