// Renders the "start session" screen into #app.
// Calls onStart(goal, mode) when the user clicks Start.
function renderSessionStart(container, onStart) {
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

      <button id="start-btn">Start Session</button>
    </div>
  `;

  container.querySelector('#start-btn').addEventListener('click', () => {
    const goal = container.querySelector('#goal-input').value.trim();
    const mode = container.querySelector('#mode-select').value;

    if (!goal) {
      alert('Please enter a goal before starting.');
      return;
    }

    onStart(goal, mode);
  });
}