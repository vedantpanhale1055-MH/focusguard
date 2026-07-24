// Renders the Productivity Timeline (focus-score heatmap) into #app.
// Calls onBack() when the user clicks "Back".
async function renderProductivityTimeline(container, onBack) {
  const DAYS = 90;

  container.innerHTML = `
    <div class="card" style="max-width: 640px;">
      <h1>Productivity Timeline</h1>
      <p class="subtitle">Daily focus score over the last ${DAYS} days</p>
      <div id="heatmap-wrap">
        <p style="color:#8892a0; font-size:13px;">Loading...</p>
      </div>
      <button class="secondary" id="timeline-back-btn">Back</button>
    </div>
  `;

  container.querySelector('#timeline-back-btn').addEventListener('click', () => {
    if (onBack) onBack();
  });

  const wrap = container.querySelector('#heatmap-wrap');

  let history = [];
  try {
    const result = await window.focusguard.fetchHeatmap(DAYS);
    history = (result && result.history) || [];
  } catch (err) {
    wrap.innerHTML = `<p style="color:#f05a5a; font-size:13px;">Couldn't load timeline data.</p>`;
    return;
  }

  wrap.innerHTML = buildHeatmapHtml(history, DAYS);
}

function buildHeatmapHtml(history, days) {
  const scoreByDate = {};
  history.forEach((h) => { scoreByDate[h.date] = h; });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  start.setDate(start.getDate() - start.getDay()); // back up to the previous Sunday

  const cells = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const dateStr = cursor.toISOString().slice(0, 10);
    cells.push({ date: dateStr, entry: scoreByDate[dateStr] });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const weekCols = weeks
    .map((week) => {
      const dayCells = week
        .map((cell) => {
          const cls = heatmapClassFor(cell.entry);
          const title = cell.entry
            ? `${cell.date}: Focus Score ${cell.entry.score}% (${cell.entry.sessionCount} session${cell.entry.sessionCount === 1 ? '' : 's'})`
            : `${cell.date}: no data`;
          return `<div class="heatmap-cell ${cls}" title="${title}"></div>`;
        })
        .join('');
      return `<div class="heatmap-week">${dayCells}</div>`;
    })
    .join('');

  // Month labels: one slot per week column, showing the month name only
  // in the first week that belongs to that month (matches GitHub's layout).
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonth = null;
  const monthRow = weeks
    .map((week) => {
      const month = new Date(`${week[0].date}T00:00:00`).getMonth();
      const label = month !== lastMonth ? monthNames[month] : '';
      lastMonth = month;
      return `<div class="heatmap-month-label">${label}</div>`;
    })
    .join('');

  // Weekday labels down the left side (Sun=0 ... Sat=6), only labeling
  // Mon/Wed/Fri to match GitHub's sparse style.
  const dayLabelText = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const dayLabelCol = dayLabelText
    .map((label) => `<div class="heatmap-day-label">${label}</div>`)
    .join('');

  return `
    <div class="heatmap-months">${monthRow}</div>
    <div class="heatmap-body">
      <div class="heatmap-day-labels">${dayLabelCol}</div>
      <div class="heatmap-grid">${weekCols}</div>
    </div>
    <div class="heatmap-legend">
      <span>Less</span>
      <div class="heatmap-cell heatmap-empty"></div>
      <div class="heatmap-cell heatmap-band-1"></div>
      <div class="heatmap-cell heatmap-band-2"></div>
      <div class="heatmap-cell heatmap-band-3"></div>
      <div class="heatmap-cell heatmap-band-4"></div>
      <span>More</span>
    </div>
  `;
}

function heatmapClassFor(entry) {
  if (!entry || typeof entry.score !== 'number') return 'heatmap-empty';
  if (entry.score < 40) return 'heatmap-band-1';
  if (entry.score < 60) return 'heatmap-band-2';
  if (entry.score < 80) return 'heatmap-band-3';
  return 'heatmap-band-4';
}