const params = new URLSearchParams(window.location.search);
const title = params.get('title') || 'This tab';
const reason = params.get('reason') || 'Unrelated to your current focus goal.';

document.getElementById('tab-title').textContent = title;
document.getElementById('reason').textContent = reason;