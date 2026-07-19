// FocusGuard browser extension background service worker.
// Watches tab changes, checks against the current session goal via the
// backend, and redirects blocked tabs to the block page with a reason.

const BACKEND_URL = 'https://backend-five-eta-84.vercel.app';

let lastCheckedTitle = null;
let lastCheckedTabId = null;

async function getCurrentSession() {
  try {
    const res = await fetch(`${BACKEND_URL}/session/current`);
    const data = await res.json();
    return data.session;
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
    return await res.json();
  } catch (err) {
    console.error('FocusGuard: classify request failed', err);
    return { allow: true, reason: 'Classification unreachable — allowed by default' };
  }
}

async function handleTab(tab, force = false) {
  if (!tab || !tab.id || !tab.title || !tab.url) return;
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

  const session = await getCurrentSession();
  if (!session) return;

  if (!force && tab.id === lastCheckedTabId && tab.title === lastCheckedTitle) return;
  lastCheckedTabId = tab.id;
  lastCheckedTitle = tab.title;

  const result = await classifyTab(session.goal, tab.title);
  console.log('FocusGuard check:', tab.title, '->', result);

  if (!result.allow) {
    const blockedUrl =
      chrome.runtime.getURL('block-page/blocked.html') +
      `?reason=${encodeURIComponent(result.reason)}&title=${encodeURIComponent(tab.title)}`;

    chrome.tabs.update(tab.id, { url: blockedUrl });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.title) {
    handleTab(tab);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  handleTab(tab);
});

// MV3 service workers get suspended when idle, which silently kills
// setInterval. chrome.alarms survives suspension and wakes the worker
// back up, so we use it for periodic re-checks instead.
chrome.alarms.create('focusguard-recheck', { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'focusguard-recheck') return;

  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) {
      await handleTab(activeTab, true);
    }
  } catch (err) {
    console.error('FocusGuard: alarm recheck failed', err);
  }
});