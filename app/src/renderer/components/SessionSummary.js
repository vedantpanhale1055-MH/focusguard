// Renders the end-of-session summary screen into #app.
// log = array of { title, allow, reason }
// endedEarly = true if the user clicked "End Session Early" before the timer finished
// onRestart() is called when the user clicks "Start New Session"
// analysis = { available, summary } from the session-end AI wrap-up (optional)
function renderSessionSummary(container, goal, log, endedEarly, onRestart, analysis) {
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

  const reflection = window.__lastReflection;
  const reflectionHtml = reflection ? `
    <div class="summary-reflection">
      <h4>Reflection Check</h4>
      <p><strong>Q:</strong> ${reflection.question}</p>
      <p><strong>A:</strong> ${reflection.answer}</p>
      <p style="color:${reflection.passed ? '#4ade80' : '#fbbf24'}">${reflection.feedback}</p>
    </div>
  ` : '';

  const analysisHtml = (analysis && analysis.available && analysis.summary) ? `
    <div class="summary-analysis">
      <h4>Session Analysis</h4>
      <p>${analysis.summary}</p>
    </div>
  ` : '';

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
      ${analysisHtml}
      ${reflectionHtml}
      <div class="log">
        ${logHtml || '<p class="subtitle">No activity recorded this session.</p>'}
      </div>
      <button id="restart-btn">Start New Session</button>
    </div>
  `;

  container.querySelector('#restart-btn').addEventListener('click', onRestart);

  window.__lastReflection = null;
}