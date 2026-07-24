# FocusGuard AI

A desktop app + browser extension that blocks distractions based on **context, not a static blacklist**.

Instead of asking *"is this website on the block list?"*, FocusGuard asks *"is what I'm doing right now related to what I said I wanted to focus on?"* — so a coding tutorial on YouTube is allowed during a "learn Python" session, but a random entertainment video isn't.

---

## The Problem

Every existing focus tool (Cold Turkey, Freedom, StayFocusd) works the same way: block a fixed list of apps/sites for a fixed amount of time.

That fails in two directions:
- **Too strict** — legitimate use of a "blocked" app (e.g. YouTube for a tutorial) gets blocked along with everything else
- **Too loose** — anything not on the blacklist, including brand-new distractions, is allowed freely with zero awareness of whether you're still on-task

FocusGuard's bet: a small, fast AI classifier can look at context (stated goal + current activity) and make that judgment call in real time.

---

## 🚀 How to Run It On Your Device

There are two parts to install: the **desktop app** and the **Chrome extension**. Both are needed for the full experience (native app monitoring + real browser tab blocking).

### Step 1 — Install the desktop app

1. Go to the [Releases page](../../releases/latest)
2. Download **`FocusGuard.AI.Setup.1.0.0.exe`**
3. Run the installer
   - Windows SmartScreen will likely show **"Windows protected your PC"** — this is expected for a free, unsigned build. Click **"More info"** → **"Run anyway"** to proceed.
4. Choose **"Only for me"** during setup, finish the install
5. Launch **FocusGuard AI** from the Start Menu or desktop shortcut

The app connects automatically to a live backend — no extra setup needed for native app monitoring.

### Step 2 — Load the Chrome extension (for real tab blocking)

Required to actually **block** distracting browser tabs. Without it, the app will still *detect and log* browser activity, but won't redirect blocked tabs.

1. Download or clone this repository (just need the `extension` folder):
   ```
   git clone https://github.com/vedantpanhale1055-MH/focusguard.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Turn on **Developer mode** (toggle, top right)
4. Click **"Load unpacked"**
5. Select the `extension` folder from the cloned/downloaded repo
6. Confirm **FocusGuard AI** now appears in your extensions list, showing as active

### Step 3 — Use it

1. Open the FocusGuard AI app
2. Enter your goal (e.g. "Learn Python"), pick a mode, and pick a session duration
3. Click **Start Session**
4. **⏱️ Give it about 30 seconds after starting** before it starts catching already-open tabs — the extension re-checks your active tab on a periodic cycle (not instantly on session start), so if you're already sitting on an off-goal tab when you hit Start, it may take up to 30 seconds to catch it. Switching tabs or opening a new one triggers an instant check instead.
5. Work as normal — FocusGuard watches your active windows and browser tabs
6. Off-goal activity gets flagged (native apps) or actually blocked with a redirect (browser tabs)
7. If you end a **Study / Reading / Coursework** session early, FocusGuard will ask you one quick AI-generated question about what you actually covered before letting you exit — a soft check, not a hard lock. Other modes and a natural (timer-completed) session end skip this.
8. When the timer ends (or you end early), you'll see a session summary with your Focus Score, a short **AI-generated analysis** of the session, and the reflection Q&A if one was asked
9. From the start screen, click **"View Past Sessions"** to see a list of your previous sessions — goal, mode, date, and Focus Score — saved permanently, so it's all still there the next time you open the app, even after a restart
10. From the start screen, click **"Productivity Timeline"** to see a GitHub-style heatmap of your daily Focus Score over the last 90 days — darker/brighter cells mean a stronger focus score that day, grey means no sessions that day. Hover any cell for the exact score and session count

---

## What Gets Actually Blocked vs. Just Logged

Enforcement differs by *where* the activity happens:

| Activity | Detected? | Actually Blocked? |
|---|---|---|
| Any **Chrome browser tab** (YouTube, Instagram web, browser games, WhatsApp Web, etc.) | ✅ Yes | ✅ Yes — tab is redirected to a block page |
| Any **native desktop app** (WhatsApp Desktop, Instagram/Discord/Steam apps, installed games, etc.) | ✅ Yes | ❌ No — shown as "Blocked" in the FocusGuard log, but the app itself is not closed or prevented |

**In short: real enforcement only exists inside Chrome, on actual tabs. Everything outside the browser is currently observe-and-log only.** See [Known Limitations](docs/known-limitations.md) for why this is a deliberate scope decision.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Desktop app | Electron |
| Browser extension | Chrome Manifest V3 |
| Window monitoring | `active-win` |
| AI classification, reflection & session analysis | Groq (Llama 3.1 8B Instant) |
| Backend | Node.js + Express, deployed on Vercel |
| Database | Supabase (Postgres) — sessions and decisions fully persisted, with server-computed focus scores, full session history, and daily-aggregated data for the productivity timeline |
| Packaging | electron-builder (NSIS installer) |
| Distribution | GitHub Releases (free, no code signing) |

---

## Project Structure

```
focusguard/
├── app/          # Electron desktop app (UI, session timer, native window monitoring, reflection screen, past-sessions screen, productivity timeline)
├── extension/    # Chrome extension (tab-level monitoring + real blocking)
├── backend/      # Express API — classification, reflection question/grading, session analysis, session history & heatmap via Groq + Supabase
└── docs/         # Design notes, known limitations, demo notes
```

---

## Setup for Developers (running everything from source)

```bash
git clone https://github.com/vedantpanhale1055-MH/focusguard.git
cd focusguard
```

**1. Backend** (only needed if you want to run your own instance instead of using the live one)
```bash
cd backend
npm install
# add your own Groq API key, plus SUPABASE_URL and SUPABASE_SERVICE_KEY, to a .env file — see .env.example
node server.js
```
If running your own backend locally, update `BACKEND_URL` in `app/src/main/ipcHandlers.js` and `extension/background.js` to `http://localhost:3001`.

⚠️ **If deploying your own backend to Vercel:** double-check `SUPABASE_URL` has **no trailing slash** when you add it as an environment variable. A trailing slash causes a `PGRST125 — Invalid path specified in request URL` error from every Supabase call, which fails silently (the app still runs, it just never persists anything). This cost a lot of debugging time — worth getting right the first time.

**2. Desktop app**
```bash
cd app
npm install
npm start
```

**3. Browser extension**
- Go to `chrome://extensions`
- Enable Developer mode
- Click "Load unpacked" → select the `extension` folder

**4. Build your own installer**
```bash
cd app
npm run build
```
Output appears in `app/release/`.

---

## Known Limitations

See [docs/known-limitations.md](docs/known-limitations.md) for the full, honest list.

---

## Changelog / What's Been Done

**v1.0 — Initial working release**
- Core loop: session start → AI classification → allow/block → session summary with Focus Score
- Electron desktop app with native window monitoring and session timer
- Chrome extension for real-time tab-level blocking
- AI classifier tuned to judge actual content, not just platform/app (e.g. a coding tutorial on YouTube is allowed, unrelated videos are blocked)
- Backend deployed live on Vercel — no local server required to run the app
- Packaged Windows installer via electron-builder, distributed through GitHub Releases

**Post-launch fixes**
- Fixed classifier prompt stereotyping platforms (e.g. blocking all YouTube regardless of content)
- Fixed CSP violation on the block page (inline `onclick` not allowed under Manifest V3)
- Fixed FocusGuard's own window being incorrectly self-flagged as a distraction
- Fixed serverless deployment crash caused by `dotenv` and missing environment variable naming on Vercel
- Fixed extension failing to catch tabs that were already open when a session started — Manifest V3 service workers suspend `setInterval`, so periodic re-checks now use `chrome.alarms` instead, which survives suspension
- Fixed tab redirect silently failing due to ambiguous window targeting from the background service worker — now uses `lastFocusedWindow` and properly awaits/logs the redirect call
- Added file-based error logging (`focusguard.log` in the app's userData folder) so issues in the packaged `.exe` can be diagnosed without a visible console

**v1.1 — Reflective Exit Check**
- Ending a Study/Reading/Coursework session early now triggers one AI-generated question about what was actually covered, based on the session's activity log
- Grading is intentionally lenient (soft friction, not a hard lock) — any specific, genuine-looking answer passes
- Skipped entirely for modes without a clean quiz equivalent (Coding, Meeting) and for natural timer completion
- Reflection Q&A now shown on the session summary screen
- Two new backend routes (`/exit-check/question`, `/exit-check/grade`), reusing the existing Groq key and Vercel deployment — no new services or accounts needed
- UI styled to match the app's existing card layout

**v1.2 — Persistence, session analysis, and visual polish**
- **Supabase persistence finished** — sessions and decisions now actually write to the database (previously schema-only, never verified end-to-end). Each session creates a real `sessions` row on start; ending a session computes a focus score server-side from every logged decision and writes it back
- **Session-end AI analysis** — a short natural-language wrap-up now appears on the summary screen alongside the Focus Score, calling out real patterns (repeated distractions, strong streaks, drop-off near the end) rather than generic praise. New `/analysis` backend route, reuses the existing Groq key
- Fixed: `analyzeSession` wasn't exposed in `preload.js`, which silently broke the end-of-session flow right after the Reflective Exit Check — session would get stuck on "Checking..." and never reach the summary
- Fixed: the new `/analysis` route existed but was never registered in `server.js`, so it 404'd until mounted
- Ambient background — soft multi-color aurora-style glow (teal, violet, amber) behind the main card, replacing the previous flat black background
- Cursor-following glow effect with a subtle hue shift for a more dynamic feel
- Reflection Check and Session Analysis now both rendered as styled cards on the summary screen, instead of plain text

**v1.3 — Session history, and Supabase actually verified working**
- **Past Sessions screen** — new screen accessible from the start screen, showing the last 20 sessions with goal, mode, date, and a color-coded Focus Score. New `GET /session/history` backend route
- Sessions persist permanently across app restarts — closing and reopening the app, or even reinstalling it later, doesn't lose history, since it's stored in Supabase rather than app memory
- Fixed: summary card content (Session Analysis + Reflection Check + full activity log stacked together) could overflow off-screen with no way to reach the "Start New Session" button — card now scrolls internally instead
- **Root-caused and fixed the real reason Supabase writes were silently failing in production**: `SUPABASE_URL` had a trailing slash, which caused every Supabase request to fail with `PGRST125 — Invalid path specified in request URL`. The app kept running normally throughout (all failures were fail-open by design), which is exactly why this was hard to spot — no crash, no visible error, just silently empty tables. Confirmed via full Vercel log export, not just the truncated CLI log view

**v1.4 — Productivity Timeline (GitHub-style heatmap)**
- **Productivity Timeline screen** — new screen accessible from the start screen, showing a GitHub-contributions-style grid of daily Focus Score over the last 90 days, with month labels across the top and Mon/Wed/Fri labels down the side
- Each day's score is duration-weighted across that day's sessions (a 60-minute session moves the day's average more than a 5-minute one), so the heatmap reflects real focus time, not just session count
- Days with no sessions render as empty/grey cells rather than being skipped, so gaps in the timeline are visible at a glance
- Hovering any cell shows the exact date, Focus Score %, and number of sessions that day
- New backend function `getDailyFocusHistory` in `supabaseClient.js` and new route `GET /session/heatmap`
- New IPC channel (`session:heatmap`) and `preload.js` binding (`fetchHeatmap`) connecting the renderer to the backend
- Color bands (grey → light teal → full teal `#4fd1c5`) match the app's existing accent color rather than GitHub's green

---

## Status

✅ **v1.4 shipped** — session → monitoring → AI classification → block/allow → (optional reflection check) → AI session analysis → summary, with full Supabase persistence, Past Sessions, and the Productivity Timeline heatmap all confirmed working end-to-end.

🚧 Actively iterating.

## What's Next

- **Increased classifier context awareness** — feeding recent activity trend and elapsed/remaining session time into the classifier so it judges patterns, not just isolated moments; idle/away detection
- **Auto-updater** — currently every app/extension change requires manually downloading a new installer; a real updater would push these automatically
- **Deeper native-app enforcement** — moving native desktop apps from detect-and-log to actual enforcement

---

## Why This Exists

Built as a portfolio project to explore whether AI can replace static rule-based tools with genuine contextual judgment — applied to a problem (digital distraction) that every existing tool has solved the same blunt way for over a decade.

---

## Author

**Vedant Panhale**
[GitHub](https://github.com/vedantpanhale1055-MH) · [LinkedIn](https://linkedin.com/in/vedant-panhale)