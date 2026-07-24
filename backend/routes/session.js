const express = require('express');
const router = express.Router();
const { startSession, endSession, getCurrentSession } = require('../services/sessionStore');
const { getSessionHistory, getDailyFocusHistory } = require('../services/supabaseClient');

// POST /session/start  body: { goal, mode }
router.post('/start', async (req, res) => {
  const { goal, mode } = req.body;
  if (!goal) return res.status(400).json({ error: 'goal is required' });

  try {
    const session = await startSession(goal, mode);
    res.json({ started: true, session });
  } catch (err) {
    console.error('session/start route error:', err.message);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// POST /session/end
router.post('/end', async (req, res) => {
  try {
    const session = await endSession();
    res.json({ ended: true, session });
  } catch (err) {
    console.error('session/end route error:', err.message);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// GET /session/current
router.get('/current', (req, res) => {
  const session = getCurrentSession();
  res.json({ session });
});

// GET /session/history?limit=20
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const sessions = await getSessionHistory(limit);
    res.json({ sessions });
  } catch (err) {
    console.error('session/history route error:', err.message);
    res.json({ sessions: [] }); // fail open — history is non-critical
  }
});

// GET /session/heatmap?days=90
// Returns daily-aggregated focus scores for the productivity timeline.
router.get('/heatmap', async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 90;
    const history = await getDailyFocusHistory(days);
    res.json({ history });
  } catch (err) {
    console.error('session/heatmap route error:', err.message);
    res.json({ history: [] }); // fail open — timeline is non-critical
  }
});

module.exports = router;