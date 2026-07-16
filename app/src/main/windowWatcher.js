const activeWindow = require('active-win');

let intervalId = null;
let lastTitle = null;

/**
 * Starts polling the active window every `pollMs` ms.
 * Calls onChange(windowInfo) only when the title actually changes,
 * so we don't spam the classifier with the same window repeatedly.
 */
function startWatching(onChange, pollMs = 2000) {
  if (intervalId) return; // already running

  intervalId = setInterval(async () => {
    try {
      const win = await activeWindow();
      if (!win) return;

      const title = win.title || '(no title)';
      const appName = win.owner?.name || 'unknown';

      // Only fire the callback when the window actually changed
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