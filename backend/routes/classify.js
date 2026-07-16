const express = require('express');
const router = express.Router();
const { classify } = require('../services/llmClassifier');
const { logDecision } = require('../services/supabaseClient');

// POST /classify
// body: { goal, windowTitle, sessionId (optional) }
router.post('/', async (req, res) => {
  const { goal, windowTitle, sessionId } = req.body;

  if (!goal || !windowTitle) {
    return res.status(400).json({ error: 'goal and windowTitle are required' });
  }

  try {
    const result = await classify(goal, windowTitle);

    // Log to Supabase only if a sessionId was provided
    if (sessionId) {
      logDecision({
        sessionId,
        tabTitle: windowTitle,
        allowed: result.allow,
        reason: result.reason,
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Classify route error:', err.message);
    res.status(500).json({ error: 'Classification failed' });
  }
});

module.exports = router;