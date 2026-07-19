const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const { startWatching, stopWatching } = require('./windowWatcher');

const BACKEND_URL = 'https://backend-five-eta-84.vercel.app';

let currentSession = null; // { goal, mode, sessionId }

// Write errors to a log file, since packaged apps have no visible console.
const logPath = path.join(app.getPath('userData'), 'focusguard.log');

function logError(label, err) {
  const line = `[${new Date().toISOString()}] ${label}: ${err.message || err}\n`;
  console.error(label, err);
  try {
    fs.appendFileSync(logPath, line);
  } catch (writeErr) {
    console.error('Failed to write log file:', writeErr.message);
  }
}

function registerIpcHandlers(ipcMain, getMainWindow) {
  // Renderer asks to start a session
  ipcMain.handle('session:start', async (event, { goal, mode }) => {
    currentSession = { goal, mode, sessionId: null };
    let backendOk = false;

    // Tell the backend so the browser extension can see the active goal too
    try {
      const res = await fetch(`${BACKEND_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, mode }),
      });
      backendOk = res.ok;
      if (!res.ok) {
        logError('Backend session start returned non-OK status', new Error(`Status ${res.status}`));
      }
    } catch (err) {
      logError('Failed to notify backend of session start', err);
    }

    startWatching(async ({ appName, title }) => {
      await evaluateWindow(appName, title, getMainWindow);
    });

    return { started: true, backendOk, logPath };
  });

  // Renderer asks to end a session
  ipcMain.handle('session:end', async () => {
    stopWatching();
    const endedSession = currentSession;
    currentSession = null;

    try {
      await fetch(`${BACKEND_URL}/session/end`, { method: 'POST' });
    } catch (err) {
      logError('Failed to notify backend of session end', err);
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
    logError('Failed to reach backend for classify', err);
  }
}

module.exports = { registerIpcHandlers };