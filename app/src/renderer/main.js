// Orchestrates the renderer UI: start screen -> live monitoring -> summary.

const appEl = document.getElementById('app');

let currentGoal = '';
let activityLog = []; // { title, allow, reason }
let timerInterval = null;
let secondsRemaining = 0;
let sessionEndedEarly = false;

function goToStartScreen() {
  activityLog = [];
  clearTimerInterval();
  renderSessionStart(appEl, handleStart);
}

async function handleStart(goal, mode, durationMinutes) {
  currentGoal = goal;
  activityLog = [];
  sessionEndedEarly = false;
  secondsRemaining = durationMinutes * 60;

  await window.focusguard.startSession(goal, mode);
  renderLiveScreen();
  startTimerInterval();
}

function renderLiveScreen() {
  appEl.innerHTML = `
    <div class="card">
      <h1>Session Active</h1>
      <p class="subtitle">Goal: ${currentGoal}</p>
      <div class="status-row">
        <span class="badge allowed">Watching...</span>
        <span class="badge" id="timer-badge" style="background:rgba(255,255,255,0.06);color:#e6e6e6;">${formatTime(secondsRemaining)}</span>
      </div>
      <div class="log" id="live-log"></div>
      <button class="secondary" id="end-btn">End Session Early</button>
    </div>
  `;

  document.getElementById('end-btn').addEventListener('click', () => {
    sessionEndedEarly = true;
    handleEnd();
  });
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startTimerInterval() {
  clearTimerInterval();
  timerInterval = setInterval(() => {
    secondsRemaining -= 1;

    const badge = document.getElementById('timer-badge');
    if (badge) badge.textContent = formatTime(Math.max(secondsRemaining, 0));

    if (secondsRemaining <= 0) {
      sessionEndedEarly = false;
      handleEnd();
    }
  }, 1000);
}

function clearTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
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
  clearTimerInterval();
  await window.focusguard.endSession();
  hideBlockOverlay();
  renderSessionSummary(appEl, currentGoal, activityLog, sessionEndedEarly, goToStartScreen);
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