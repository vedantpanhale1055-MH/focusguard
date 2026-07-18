# FocusGuard AI

A desktop app + browser extension that blocks distractions based on **context, not a static blacklist**.

Instead of asking *"is this app on the banned list?"*, FocusGuard asks *"is what I'm doing right now related to what I said I wanted to focus on?"* — so a coding tutorial on YouTube is allowed during a "learn Python" session, but a random entertainment video isn't.

---

## The Problem

Every existing focus tool (Cold Turkey, Freedom, StayFocusd) works the same way: block a fixed list of apps/sites for a fixed amount of time.

That fails in two directions:
- **Too strict** — legitimate use of a "blocked" app (e.g. YouTube for a tutorial) gets blocked along with everything else
- **Too loose** — anything not on the blacklist, including brand-new distractions, is allowed freely with zero awareness of whether you're still on-task

None of these tools understand *why* an app is open. FocusGuard's bet: a small, fast AI classifier can look at context (stated goal + current activity) and make that judgment call in real time.

---

## How It Works

1. **Start a session** in the desktop app — state your goal in plain language (e.g. "Learn Python") and set a duration
2. **FocusGuard watches** your active window and browser tabs in real time
3. **Each new window/tab is evaluated** against your stated goal by an AI classifier (Groq / Llama 3.1) — judging the actual content, not just the app or platform it's on
4. **Off-goal activity is flagged**, with a plain-language reason — e.g. *"YouTube video is unrelated to Python coding"*
5. **Session ends** on timer completion or manual early exit, then shows a summary: what was allowed, what was blocked, and a Focus Score

---

## Download

A packaged Windows installer is available on the [Releases page](../../releases).

> **Note:** Windows SmartScreen may show an "unknown publisher" warning on first launch — this is expected for a free, unsigned build (see [Known Limitations](docs/known-limitations.md)). Click **"More info" → "Run anyway"** to proceed.

### Running the full experience

The installed app handles session tracking and native window monitoring out of the box. To get the complete experience shown in the demo (AI classification + real browser tab blocking), you'll also need:

1. **The backend running locally** — see [Setup for Developers](#setup-for-developers) below
2. **The Chrome extension loaded** — see below

This local-backend requirement is a deliberate MVP tradeoff to keep the project fully free to run (see [Known Limitations](docs/known-limitations.md)).

---

## What Gets Actually Blocked vs. Just Logged

Enforcement differs by *where* the activity happens:

| Activity | Detected? | Actually Blocked? |
|---|---|---|
| Any **Chrome browser tab** (YouTube, Instagram web, browser games, WhatsApp Web, etc.) | ✅ Yes | ✅ Yes — tab is redirected to a block page |
| Any **native desktop app** (WhatsApp Desktop, Instagram/Discord/Steam apps, installed games, etc.) | ✅ Yes | ❌ No — shown as "Blocked" in the FocusGuard log, but the app itself is not closed or prevented |

**In short: real enforcement only exists inside Chrome, on actual tabs. Everything outside the browser is currently observe-and-log only.**

---

## Setup for Developers

```bash
git clone https://github.com/vedantpanhale1055-MH/focusguard.git
cd focusguard
```

**1. Backend**
```bash
cd backend
npm install
# add your Groq API key to a .env file (see .env.example)
node server.js
```

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

---

## Tech Stack

| Layer | Tech |
|---|---|
| Desktop app | Electron |
| Browser extension | Chrome Manifest V3 |
| Window monitoring | `active-win` |
| AI classification | Groq (Llama 3.1 8B Instant) |
| Backend | Node.js + Express |
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

## Known Limitations

See [docs/known-limitations.md](docs/known-limitations.md) for the full, honest list — including native-app enforcement scope, title-only classification, and the unsigned build warning.

---

## Status

🚧 **In active development.** Core loop (session → monitoring → AI classification → block/allow → summary) is working end-to-end across both the desktop app and browser extension, with a packaged Windows installer available.

---

## Why This Exists

Built as a portfolio project to explore whether AI can replace static rule-based tools with genuine contextual judgment — applied to a problem (digital distraction) that every existing tool has solved the same blunt way for over a decade.

---

## Author

**Vedant Panhale**
[GitHub](https://github.com/vedantpanhale1055-MH) · [LinkedIn](https://linkedin.com/in/vedant-panhale)