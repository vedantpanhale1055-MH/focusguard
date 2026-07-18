# Demo Notes

Quick reference for running a live demo of FocusGuard AI.

## Setup (before the demo)

1. Start the backend:
   ```
   cd backend
   node server.js
   ```
2. Start the desktop app:
   ```
   cd app
   npm start
   ```
3. Confirm the Chrome extension is loaded: `chrome://extensions` → FocusGuard AI should show as active with a running service worker.

## Suggested demo flow (3-5 minutes)

1. **Set the scene** — explain the problem: static blockers can't tell a tutorial from a distraction. Show a competitor's blocklist model briefly for contrast if useful.

2. **Start a session** — goal: "Learn Python", duration: 2-3 minutes (short, for demo pacing).

3. **Show the allow case** — open a tab with a clearly Python-related title (e.g. search "Python tutorial" on YouTube, open a result). Watch it get allowed in the live log with a reason.

4. **Show the block case** — open an unrelated tab (entertainment, another topic). Watch the tab redirect to the FocusGuard block page in real time, with the specific reason shown.

5. **Show native app detection** — switch to a non-browser app (e.g. Discord, Steam). Point out it's logged in the app but not force-closed — call out this is a deliberate design tradeoff, not a gap (ties into privacy/trust positioning).

6. **Let the timer run out** (or click "End Session Early" for pacing) — show the Session Summary: Focus Score, allowed/blocked count, full activity log.

## Talking points if asked questions

- **"Why not just block the whole app?"** → Explainable AI positioning: FocusGuard tells you *why*, and lets legitimate use through, rather than being a blunt hammer.
- **"Is this actually free to run?"** → Yes — Groq, Supabase, and Vercel free tiers cover the entire stack at $0.
- **"What's next?"** → Reflective Exit Check (AI quizzes you on session content before letting you end early), packaged installer via GitHub Releases, possibly Tauri rewrite for smaller footprint.

## Known rough edges to preempt if asked

- Hover-previews on YouTube aren't caught (see known-limitations.md)
- Native apps are logged, not force-closed
- Unsigned build — SmartScreen warning on first install