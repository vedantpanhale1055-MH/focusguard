// FocusGuard browser extension background service worker.
// Watches tab changes, checks against the current session goal via the
// backend, and redirects blocked tabs to the block page with a reason.

const BACKEND_URL = 'https://backend-five-eta-84.vercel.app';

// Avoid re-checking the exact same title repeatedly
let lastCheckedTitle = null;
let lastCheckedTabId = null;

async function getCurrentSession() {
  try {
    const res = await fetch(`${BACKEND_URL}/session/current`);
    const data = await res.json();
    return data.session; // null if no active session
  } catch (err) {
    console.error('FocusGuard: could not reach backend for session', err);
    return null;
  }
}

async function classifyTab(goal, tabTitle) {
  try {
    const res = await fetch(`${BACKEND_URL}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, windowTitle: tabTitle }),
    });
    return await res.json(); // { allow, reason }
  } catch (err) {
    console.error('FocusGuard: classify request failed', err);
    return { allow: true, reason: 'Classification unreachable — allowed by default' };
  }
}

async function handleTab(tab, force = false) {
  if (!tab || !tab.id || !tab.title || !tab.url) return;
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

  const session = await getCurrentSession();
  if (!session) return; // no active FocusGuard session, do nothing

  // Skip if we already just checked this exact tab+title, unless forced
  if (!force && tab.id === lastCheckedTabId && tab.title === lastCheckedTitle) return;
  lastCheckedTabId = tab.id;
  lastCheckedTitle = tab.title;

  const result = await classifyTab(session.goal, tab.title);

  if (!result.allow) {
    const blockedUrl =
      chrome.runtime.getURL('block-page/blocked.html') +
      `?reason=${encodeURIComponent(result.reason)}&title=${encodeURIComponent(tab.title)}`;

    chrome.tabs.update(tab.id, { url: blockedUrl });
  }
}

// Fires when the active tab's content finishes loading or its title changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.title) {
    handleTab(tab);
  }
});

// Fires when the user switches to a different tab
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  handleTab(tab);
});

// Periodic re-check of the currently active tab — catches the case where
// a session starts while the user is already sitting on a tab with no
// title change and no tab switch (e.g. watching a long video).
setInterval(async () => {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) {
      // Force-check periodically even if title hasn't changed, since the
      // session itself may have just started.
      await handleTab(activeTab, true);
    }
  } catch (err) {
    console.error('FocusGuard: periodic check failed', err);
  }
}, 5000);