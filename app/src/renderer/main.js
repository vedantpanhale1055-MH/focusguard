// Orchestrates the renderer UI: start screen -> live monitoring -> summary.

const appEl = document.getElementById('app');

let currentGoal = '';
let activityLog = []; // { title, allow, reason }

function goToStartScreen() {
  activityLog = [];
  renderSessionStart(appEl, handleStart);
}

async function handleStart(goal, mode) {
  currentGoal = goal;
  activityLog = [];

  await window.focusguard.startSession(goal, mode);
  renderLiveScreen();
}

function renderLiveScreen() {
  appEl.innerHTML = `
    <div class="card">
      <h1>Session Active</h1>
      <p class="subtitle">Goal: ${currentGoal}</p>
      <div class="status-row">
        <span class="badge allowed">Watching...</span>
      </div>
      <div class="log" id="live-log"></div>
      <button class="secondary" id="end-btn">End Session</button>
    </div>
  `;

  document.getElementById('end-btn').addEventListener('click', handleEnd);
}

function appendToLiveLog(entry) {
  const logEl = document.getElementById('live-log');
  if (!logEl) return;

  const div = document.createElement('div');
  div.className = 'log-entry';
  div.innerHTML = `
    <div class="title">${entry.title}</div>
    <div class="reason">${entry.allow ? '✅ Allowed' : '🚫 Blocked'} — ${entry.reason}</div>
  `;
  logEl.prepend(div);
}

async function handleEnd() {
  await window.focusguard.endSession();
  hideBlockOverlay();
  renderSessionSummary(appEl, currentGoal, activityLog, goToStartScreen);
}

// Listen for classification results pushed from the main process
window.focusguard.onClassification((data) => {
  const entry = {
    title: `${data.appName} - ${data.title}`,
    allow: data.allow,
    reason: data.reason,
  };

  activityLog.push(entry);
  appendToLiveLog(entry);

  if (!data.allow) {
    showBlockOverlay(`${entry.title} — ${data.reason}`);
    setTimeout(hideBlockOverlay, 4000);
  }
});

// Boot the app
goToStartScreen();