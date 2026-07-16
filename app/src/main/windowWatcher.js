// Step 1: Standalone test — confirms we can read the active window
// Run this file directly with: node src/main/windowWatcher.js
// Switch between different apps/browser tabs while it's running and
// watch the console print the active window every 2 seconds.

const activeWindow = require('active-win');

console.log('FocusGuard window watcher — starting test.');
console.log('Switch between apps/tabs now. Press Ctrl+C to stop.\n');

setInterval(async () => {
  try {
    const win = await activeWindow();

    if (!win) {
      console.log('No active window detected.');
      return;
    }

    console.log(
      `App: ${win.owner?.name || 'unknown'} | Title: ${win.title || '(no title)'}`
    );
  } catch (err) {
    console.error('Error reading active window:', err.message);
  }
}, 2000);