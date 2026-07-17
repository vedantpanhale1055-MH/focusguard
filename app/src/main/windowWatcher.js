const activeWindow = require('active-win');

let intervalId = null;
let lastTitle = null;

// Never classify FocusGuard's own window — avoids self-referential
// blocking of the app that's doing the blocking.
const SELF_APP_NAMES = ['electron.exe', 'electron', 'focusguard', 'focusguard.exe'];

function isSelf(appName) {
  return SELF_APP_NAMES.includes((appName || '').toLowerCase());
}

function startWatching(onChange, pollMs = 2000) {
  if (intervalId) return;

  intervalId = setInterval(async () => {
    try {
      const win = await activeWindow();
      if (!win) return;

      const title = win.title || '(no title)';
      const appName = win.owner?.name || 'unknown';

      if (isSelf(appName) || title.toLowerCase().includes('focusguard')) {
        return; // skip entirely, don't call onChange
      }

      if (title !== lastTitle) {
        lastTitle = title;
        onChange({ appName, title });
      }
    } catch (err) {
      console.error('windowWatcher error:', err.message);
    }
  }, pollMs);
}

function stopWatching() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    lastTitle = null;
  }
}

module.exports = { startWatching, stopWatching };