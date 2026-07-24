// Renders the past-sessions list into #app.
// onBack() is called when the user clicks "Back" to return to the start screen.
async function renderSessionHistory(container, onBack) {
  container.innerHTML = `
    <div class="card">
      <h1>Past Sessions</h1>
      <p class="subtitle">Your last sessions, most recent first.</p>
      <div class="log" id="history-log">
        <p class="subtitle">Loading...</p>
      </div>
      <button class="secondary" id="history-back-btn">Back</button>
    </div>
  `;

  document.getElementById('history-back-btn').addEventListener('click', onBack);

  const result = await window.focusguard.getSessionHistory(20);
  const sessions = (result && result.sessions) || [];

  const logEl = document.getElementById('history-log');
  if (!logEl) return;

  if (sessions.length === 0) {
    logEl.innerHTML = '<p class="subtitle">No past sessions yet — finish one to see it here.</p>';
    return;
  }

  logEl.innerHTML = sessions
    .map((s) => {
      const date = s.started_at ? new Date(s.started_at) : null;
      const dateStr = date
        ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
          ' · ' +
          date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        : 'Unknown date';

      const scoreKnown = typeof s.focus_score === 'number';
      const scoreColor = !scoreKnown
        ? '#8892a0'
        : s.focus_score >= 80
        ? '#4fd1c5'
        : s.focus_score >= 50
        ? '#f0a05a'
        : '#f05a5a';

      const scoreLabel = scoreKnown ? `${s.focus_score}%` : 'In progress';

      return `
        <div class="log-entry">
          <div class="title">${s.goal || 'Untitled session'}</div>
          <div class="reason">${s.mode || 'No mode'} · ${dateStr}</div>
          <div class="reason" style="color:${scoreColor}; font-weight:600; margin-top:4px;">
            Focus Score: ${scoreLabel}
          </div>
        </div>
      `;
    })
    .join('');
}

window.renderSessionHistory = renderSessionHistory;