const express = require('express');
const router = express.Router();
const { startSession, endSession, getCurrentSession } = require('../services/sessionStore');

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

module.exports = router;