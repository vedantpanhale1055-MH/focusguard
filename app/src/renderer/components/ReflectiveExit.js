function renderReflectiveExit(container, { question, goal }, onSubmit, onSkip) {
  container.innerHTML = `
<div class="card">
    <div class="reflective-exit">
      <h3>Quick check before you go</h3>
      <p class="reflective-question">${question}</p>
      <textarea id="reflective-answer" rows="3" placeholder="Type your answer..."></textarea>
      <div class="reflective-actions">
        <button id="reflective-submit" class="btn-primary">Submit & End Session</button>
      </div>
      <p id="reflective-feedback" class="reflective-feedback"></p>
    </div>
</div>
`;


  document.getElementById('reflective-submit').addEventListener('click', async () => {
    const answer = document.getElementById('reflective-answer').value.trim();
    const submitBtn = document.getElementById('reflective-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking...';

    const result = await window.focusguard.exitCheckGrade({ question, answer, goal });

    const feedbackEl = document.getElementById('reflective-feedback');
    feedbackEl.textContent = result.feedback;
    feedbackEl.style.color = result.passed ? '#4ade80' : '#fbbf24';

    setTimeout(() => onSubmit(answer, result), 900);
  });
}

window.renderReflectiveExit = renderReflectiveExit;