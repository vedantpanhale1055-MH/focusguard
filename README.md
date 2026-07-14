# FocusGuard AI

A desktop app that blocks distractions based on **context, not a static blacklist**.

Instead of asking *"is this app on the banned list?"*, FocusGuard asks *"is what I'm doing right now related to what I said I wanted to focus on?"* — so a coding tutorial is allowed during a "learn React" session, but the recommended video two clicks later isn't.

---

## The Problem

Every existing focus tool (Cold Turkey, Freedom, StayFocusd) works the same way: block a fixed list of apps/sites for a fixed amount of time.

That fails in two directions:
- **Too strict** — legitimate use of a "blocked" app (e.g. YouTube for a tutorial) gets blocked along with everything else
- **Too loose** — anything not on the blacklist, including brand-new distractions, is allowed freely with zero awareness of whether you're still on-task

None of these tools understand *why* an app is open. FocusGuard's bet: a small, fast AI classifier can look at context (stated goal + current activity) and make that judgment call in real time.

---

## How It Works

1. **Start a session** — state your goal in plain language (e.g. "Learn React hooks", "Finish DBMS assignment")
2. **FocusGuard monitors** the active window/app in the background
3. **Each new app/window is evaluated** against your stated goal by an AI classifier
4. **Off-goal activity is blocked**, with a plain-language reason shown — not just "blocked," but *why*
5. **Session summary** at the end — what you covered, what got blocked, and a Focus Score

---

## Tech Stack

| Layer | Tech |
|---|---|
| Desktop app | Electron |
| Window monitoring | `active-win` |
| AI classification | Groq (Llama 3.1) |
| Backend | Node.js + Express |
| Database | Supabase (Postgres) |
| Backend hosting | Vercel |
| Distribution | GitHub Releases |

---

## Status

🚧 **In active development.** Currently building the core monitoring + classification loop.

---

## Why This Exists

Built as a portfolio project to explore whether AI can replace static rule-based tools with genuine contextual judgment — the same shift happening across a lot of software right now, applied to a problem (digital distraction) that every existing tool has solved the same blunt way for over a decade.

---

## Author

**Vedant Panhale**
[GitHub](https://github.com/vedantpanhale1055-MH) · [LinkedIn](https://linkedin.com/in/vedant-panhale)