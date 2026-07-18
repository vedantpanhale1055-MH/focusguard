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
4. Choose **"Only for me"** during setup (simpler, no admin prompt needed), finish the install
5. Launch **FocusGuard AI** from the Start Menu or desktop shortcut

That's it for the app — it connects automatically to the live backend, no extra setup, no need to run anything else locally for native app monitoring.

### Step 2 — Load the Chrome extension (for real tab blocking)

This step is required to actually **block** distracting browser tabs. Without it, the app will still *detect and log* your browser activity, but won't redirect blocked tabs.

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
2. Enter your goal (e.g. "Learn Python") and pick a session duration
3. Click **Start Session**
4. Work as normal — FocusGuard watches your active windows and browser tabs
5. Off-goal activity gets flagged (native apps) or actually blocked with a redirect (browser tabs)
6. When the timer ends (or you end early), you'll see a session summary with your Focus Score

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
| AI classification | Groq (Llama 3.1 8B Instant) |
| Backend | Node.js + Express, deployed on Vercel |
| Database | Supabase (Postgres) — optional, for decision history |
| Packaging | electron-builder (NSIS installer) |
| Distribution | GitHub Releases (free, no code signing) |

---

## Project Structure

```
focusguard/
├── app/          # Electron desktop app (UI, session timer, native window monitoring)
├── extension/    # Chrome extension (tab-level monitoring + real blocking)
├── backend/      # Express API — classification via Groq, shared session state
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
# add your own Groq API key to a .env file — see .env.example
node server.js
```
If running your own backend locally, update `BACKEND_URL` in `app/src/main/ipcHandlers.js` and `extension/background.js` to `http://localhost:3001`.

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

See [docs/known-limitations.md](docs/known-limitations.md) for the full, honest list — including native-app enforcement scope, title-only classification, and the unsigned build warning.

---

## Status

🚧 **In active development.** Core loop (session → monitoring → AI classification → block/allow → summary) is working end-to-end across both the desktop app and browser extension, with a live backend and a packaged Windows installer.

---

## Why This Exists

Built as a portfolio project to explore whether AI can replace static rule-based tools with genuine contextual judgment — applied to a problem (digital distraction) that every existing tool has solved the same blunt way for over a decade.

---

## Author

**Vedant Panhale**
[GitHub](https://github.com/vedantpanhale1055-MH) · [LinkedIn](https://linkedin.com/in/vedant-panhale)