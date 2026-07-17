const express = require('express');
const router = express.Router();
const { startSession, endSession, getCurrentSession } = require('../services/sessionStore');

// POST /session/start  body: { goal, mode }
router.post('/start', (req, res) => {
  const { goal, mode } = req.body;
  if (!goal) return res.status(400).json({ error: 'goal is required' });

  const session = startSession(goal, mode);
  res.json({ started: true, session });
});

// POST /session/end
router.post('/end', (req, res) => {
  endSession();
  res.json({ ended: true });
});

// GET /session/current
router.get('/current', (req, res) => {
  const session = getCurrentSession();
  res.json({ session });
});

module.exports = router;