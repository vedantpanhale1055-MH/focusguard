// Renders the "start session" screen into #app.
// Calls onStart(goal, mode, durationMinutes) when the user clicks Start.
// Calls onViewHistory() when the user clicks "View Past Sessions".
function renderSessionStart(container, onStart, onViewHistory) {
  container.innerHTML = `
    <div class="card">
      <h1>FocusGuard AI</h1>
      <p class="subtitle">State your goal. FocusGuard watches your screen and blocks anything unrelated.</p>

      <label for="goal-input">What are you focusing on?</label>
      <input type="text" id="goal-input" placeholder="e.g. Learn React hooks" />

      <label for="mode-select">Session mode</label>
      <select id="mode-select">
        <option value="Study">Study</option>
        <option value="Reading">Reading</option>
        <option value="Coding">Coding</option>
        <option value="Meeting">Meeting</option>
        <option value="Office Work">Office Work</option>
      </select>

      <label for="duration-select">Duration</label>
      <select id="duration-select">
        <option value="15">15 minutes</option>
        <option value="25" selected>25 minutes</option>
        <option value="45">45 minutes</option>
        <option value="60">60 minutes</option>
        <option value="custom">Custom...</option>
      </select>

      <input type="number" id="custom-duration" placeholder="Enter minutes" min="1"
        style="display:none; margin-top:12px;" />

      <button id="start-btn">Start Session</button>
      <button class="secondary" id="history-btn">View Past Sessions</button>
    </div>
  `;

  const durationSelect = container.querySelector('#duration-select');
  const customInput = container.querySelector('#custom-duration');

  durationSelect.addEventListener('change', () => {
    customInput.style.display = durationSelect.value === 'custom' ? 'block' : 'none';
  });

  container.querySelector('#start-btn').addEventListener('click', () => {
    const goal = container.querySelector('#goal-input').value.trim();
    const mode = container.querySelector('#mode-select').value;

    let durationMinutes;
    if (durationSelect.value === 'custom') {
      durationMinutes = parseInt(customInput.value, 10);
    } else {
      durationMinutes = parseInt(durationSelect.value, 10);
    }

    if (!goal) {
      alert('Please enter a goal before starting.');
      return;
    }

    if (!durationMinutes || durationMinutes <= 0) {
      alert('Please enter a valid duration.');
      return;
    }

    onStart(goal, mode, durationMinutes);
  });

  container.querySelector('#history-btn').addEventListener('click', () => {
    if (onViewHistory) onViewHistory();
  });
}