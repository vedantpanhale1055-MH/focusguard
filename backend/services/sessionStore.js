// Simple in-memory store for the currently active session.
// The Electron app tells the backend when a session starts/ends,
// and the browser extension polls this to know the current goal.

let currentSession = null; // { goal, mode, startedAt }

function startSession(goal, mode) {
  currentSession = { goal, mode, startedAt: Date.now() };
  return currentSession;
}

function endSession() {
  currentSession = null;
}

function getCurrentSession() {
  return currentSession;
}

module.exports = { startSession, endSession, getCurrentSession };