// Tracks the currently active session in memory (so the browser
// extension can poll for the active goal), and mirrors it to a real
// Supabase row for persistence + focus score history.

const { createSession, endSessionRecord } = require('./supabaseClient');

let currentSession = null; // { goal, mode, sessionId, startedAt }

async function startSession(goal, mode) {
  let sessionId = null;
  try {
    sessionId = await createSession({ goal, mode });
  } catch (err) {
    console.error('startSession: failed to create Supabase session row:', err.message);
  }

  currentSession = { goal, mode, sessionId, startedAt: Date.now() };
  return currentSession;
}

async function endSession() {
  const ended = currentSession;
  let focusScore = null;

  if (ended && ended.sessionId) {
    try {
      focusScore = await endSessionRecord(ended.sessionId);
    } catch (err) {
      console.error('endSession: failed to finalize Supabase session row:', err.message);
    }
  }

  currentSession = null;
  return ended ? { ...ended, focusScore } : null;
}

function getCurrentSession() {
  return currentSession;
}

module.exports = { startSession, endSession, getCurrentSession };