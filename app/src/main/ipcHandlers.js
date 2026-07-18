const { startWatching, stopWatching } = require('./windowWatcher');

const BACKEND_URL = 'https://backend-five-eta-84.vercel.app';

let currentSession = null; // { goal, mode, sessionId }

function registerIpcHandlers(ipcMain, getMainWindow) {
  // Renderer asks to start a session
  ipcMain.handle('session:start', async (event, { goal, mode }) => {
    currentSession = { goal, mode, sessionId: null };

    // Tell the backend so the browser extension can see the active goal too
    try {
      await fetch(`${BACKEND_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, mode }),
      });
    } catch (err) {
      console.error('Failed to notify backend of session start:', err.message);
    }

    startWatching(async ({ appName, title }) => {
      await evaluateWindow(appName, title, getMainWindow);
    });

    return { started: true };
  });

  // Renderer asks to end a session
  ipcMain.handle('session:end', async () => {
    stopWatching();
    const endedSession = currentSession;
    currentSession = null;

    try {
      await fetch(`${BACKEND_URL}/session/end`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to notify backend of session end:', err.message);
    }

    return { ended: true, session: endedSession };
  });
}

async function evaluateWindow(appName, title, getMainWindow) {
  if (!currentSession) return;

  const windowTitle = `${appName} - ${title}`;

  try {
    const res = await fetch(`${BACKEND_URL}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: currentSession.goal,
        windowTitle,
        sessionId: currentSession.sessionId,
      }),
    });

    const result = await res.json();

    const win = getMainWindow();
    if (win) {
      win.webContents.send('classification:result', {
        appName,
        title,
        allow: result.allow,
        reason: result.reason,
      });
    }
  } catch (err) {
    console.error('Failed to reach backend:', err.message);
  }
}

module.exports = { registerIpcHandlers };