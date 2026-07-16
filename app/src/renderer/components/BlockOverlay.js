// Controls the full-screen block overlay defined in index.html.
function showBlockOverlay(reason) {
  const overlay = document.getElementById('block-overlay');
  const reasonEl = document.getElementById('block-reason');
  reasonEl.textContent = reason;
  overlay.classList.add('visible');
}

function hideBlockOverlay() {
  const overlay = document.getElementById('block-overlay');
  overlay.classList.remove('visible');
}