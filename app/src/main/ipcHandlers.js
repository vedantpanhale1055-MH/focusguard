const { startWatching, stopWatching } = require('./windowWatcher');

const BACKEND_URL = 'http://localhost:3001';

let currentSession = null; // { goal, mode, sessionId }

function registerIpcHandlers(ipcMain, getMainWindow) {
  // Renderer asks to start a session
  ipcMain.handle('session:start', async (event, { goal, mode }) => {
    currentSession = { goal, mode, sessionId: null };

    // TODO later: call backend to create a session row and store sessionId

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