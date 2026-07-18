# Known Limitations

Honest documentation of what FocusGuard AI can and can't do in its current form — these are conscious scope decisions, not bugs to silently work around.

## 1. Enforcement differs by surface

- **Chrome browser tabs** → real enforcement. The extension redirects a blocked tab to a block page.
- **Native desktop apps** (WhatsApp Desktop, Discord, Steam games, etc.) → detection only. FocusGuard logs the activity and shows it as "Blocked" in the app's live log, but does not force-close or prevent use of the app.

This matches a deliberate "Tier 1: detect + log" enforcement level (see the original design doc, Section 11.3). Stronger enforcement (auto-relaunch watchdogs, unkillable processes) was intentionally scoped out — it moves the product from "explainable AI assistant" into parental-control territory, which fights the product's own privacy/trust positioning and is disproportionate engineering effort for a portfolio build.

## 2. Hover-previews aren't caught

YouTube (and similar sites) auto-play a muted preview clip when you hover over a thumbnail, without actually navigating to that video's page. Since the tab's title/URL never changes, the browser extension has no signal to react to. This is a low-stakes gap — a few seconds of muted preview isn't the same as actually clicking in and watching.

## 3. Classification is title-only

The AI judges window/tab titles, not full page content. This keeps the system fast, cheap, and privacy-respecting (no page content ever leaves the device), but means:
- A vague or generic title can be misclassified in either direction
- A cleverly-renamed tab could theoretically slip past the classifier

Reading full page content would require a content script with broader permissions — a meaningfully more invasive feature that should be opt-in, consistent with the project's privacy stance.

## 4. Session data is not persisted across app restarts

The current session state lives in-memory in the backend and Electron app. If the backend server restarts mid-session, the active session context is lost until a new session is started. Supabase logging of individual decisions works independently of this, when configured.

## 5. Unsigned desktop build

The distributed `.exe` is not code-signed (signing certificates cost money, which is out of scope for a $0-budget project). Windows SmartScreen will show an "unknown publisher" warning on first install — this is expected and can be bypassed via "More info → Run anyway."

## 6. Single-user, single-machine scope

No multi-user accounts, no cross-device sync, no cloud-hosted backend by default (the classify backend runs locally). This is intentional for the MVP — see the original design doc's Section 15 (Suggested MVP Scope) for what was deliberately deferred.