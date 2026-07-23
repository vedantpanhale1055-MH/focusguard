const { startWatching, stopWatching } = require('./windowWatcher');
const BACKEND_URL = 'https://backend-five-eta-84.vercel.app';

let currentSession = null; // { goal, mode, sessionId }

function registerIpcHandlers(ipcMain, getMainWindow) {
  // Renderer asks to start a session
  ipcMain.handle('session:start', async (event, { goal, mode }) => {
    currentSession = { goal, mode, sessionId: null };

    // Tell the backend so the browser extension can see the active goal too,
    // and capture the real sessionId it creates in Supabase.
    try {
      const res = await fetch(`${BACKEND_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, mode }),
      });
      const data = await res.json();
      if (data && data.session && data.session.sessionId) {
        currentSession.sessionId = data.session.sessionId;
      }
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

    let focusScore = null;
    try {
      const res = await fetch(`${BACKEND_URL}/session/end`, { method: 'POST' });
      const data = await res.json();
      if (data && data.session && typeof data.session.focusScore === 'number') {
        focusScore = data.session.focusScore;
      }
    } catch (err) {
      console.error('Failed to notify backend of session end:', err.message);
    }

    // focusScore here is the server-computed one (from Supabase decisions);
    // the renderer still computes its own from activityLog for the summary
    // screen, this is just available if you want to cross-check or use it later.
    return { ended: true, session: endedSession, focusScore };
  });

  // Reflective Exit Check — ask a question before ending early
  ipcMain.handle('session:exitCheckQuestion', async (event, { goal, mode, activityLog }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/exit-check/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, mode, activityLog }),
      });
      return await res.json();
    } catch (err) {
      console.error('Exit check question failed:', err.message);
      return { applicable: false };
    }
  });

  // Reflective Exit Check — grade the user's answer
  ipcMain.handle('session:exitCheckGrade', async (event, { question, answer, goal }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/exit-check/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, goal }),
      });
      return await res.json();
    } catch (err) {
      console.error('Exit check grade failed:', err.message);
      return { passed: true, feedback: 'Could not verify — proceeding anyway.' };
    }
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