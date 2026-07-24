// Orchestrates the renderer UI: start screen -> live monitoring -> summary.

const appEl = document.getElementById('app');

let currentGoal = '';
let currentMode = '';
let activityLog = []; // { title, allow, reason }
let timerInterval = null;
let secondsRemaining = 0;
let sessionEndedEarly = false;

function goToStartScreen() {
  activityLog = [];
  clearTimerInterval();
  renderSessionStart(appEl, handleStart, goToHistoryScreen, goToTimelineScreen);
}

function goToHistoryScreen() {
  clearTimerInterval();
  renderSessionHistory(appEl, goToStartScreen);
}

function goToTimelineScreen() {
  clearTimerInterval();
  renderProductivityTimeline(appEl, goToStartScreen);
}

async function handleStart(goal, mode, durationMinutes) {
  currentGoal = goal;
  currentMode = mode;
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
    attemptEndEarly();
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

// Called when the user clicks "End Session Early" — stops the timer,
// asks the backend if a reflection question applies to this mode,
// and either shows the question screen or ends immediately.
async function attemptEndEarly() {
  clearTimerInterval();

  const check = await window.focusguard.exitCheckQuestion({
    goal: currentGoal,
    mode: currentMode,
    activityLog,
  });

  if (!check.applicable) {
    sessionEndedEarly = true;
    handleEnd();
    return;
  }

  renderReflectiveExit(
    appEl,
    { question: check.question, goal: currentGoal },
    async (answer, result) => {
      window.__lastReflection = {
        question: check.question,
        answer,
        passed: result.passed,
        feedback: result.feedback,
      };
      sessionEndedEarly = true;
      await handleEnd();
    }
  );
}

async function handleEnd() {
  clearTimerInterval();
  await window.focusguard.endSession();
  hideBlockOverlay();

  const total = activityLog.length;
  const blocked = activityLog.filter((e) => !e.allow).length;
  const allowed = total - blocked;
  const focusScore = total === 0 ? 100 : Math.round((allowed / total) * 100);

  // Fetch the AI wrap-up before rendering the summary so it's ready in time.
  // Fails open (available: false) if the AI call errors — summary still renders.
  const analysis = await window.focusguard.analyzeSession({
    goal: currentGoal,
    mode: currentMode,
    activityLog,
    focusScore,
  });

  renderSessionSummary(appEl, currentGoal, activityLog, sessionEndedEarly, goToStartScreen, analysis);
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