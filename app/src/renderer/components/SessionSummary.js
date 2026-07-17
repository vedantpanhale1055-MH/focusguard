// Renders the end-of-session summary screen into #app.
// log = array of { title, allow, reason }
// endedEarly = true if the user clicked "End Session Early" before the timer finished
// onRestart() is called when the user clicks "Start New Session"
function renderSessionSummary(container, goal, log, endedEarly, onRestart) {
  const total = log.length;
  const blocked = log.filter((entry) => !entry.allow).length;
  const allowed = total - blocked;
  const focusScore = total === 0 ? 100 : Math.round((allowed / total) * 100);

  const logHtml = log
    .map(
      (entry) => `
      <div class="log-entry">
        <div class="title">${entry.title}</div>
        <div class="reason">${entry.allow ? '✅ Allowed' : '🚫 Blocked'} — ${entry.reason}</div>
      </div>
    `
    )
    .join('');

  const statusLine = endedEarly
    ? '<p class="subtitle" style="color:#f0a05a;">⚠ Session ended early</p>'
    : '<p class="subtitle" style="color:#4fd1c5;">✅ Session completed</p>';

  container.innerHTML = `
    <div class="card">
      <h1>Session Summary</h1>
      <p class="subtitle">Goal: ${goal}</p>
      ${statusLine}

      <div class="status-row">
        <span class="badge allowed">${allowed} allowed</span>
        <span class="badge blocked">${blocked} blocked</span>
      </div>

      <p class="subtitle">Focus Score: <strong style="color:#4fd1c5">${focusScore}%</strong></p>

      <div class="log">
        ${logHtml || '<p class="subtitle">No activity recorded this session.</p>'}
      </div>

      <button id="restart-btn">Start New Session</button>
    </div>
  `;

  container.querySelector('#restart-btn').addEventListener('click', onRestart);
}