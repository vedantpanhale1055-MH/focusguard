const express = require('express');
const router = express.Router();
const { generateSessionAnalysis } = require('../services/llmClassifier');

// POST /analysis
// body: { goal, mode, activityLog, focusScore }
router.post('/', async (req, res) => {
  try {
    const { goal, mode, activityLog, focusScore } = req.body;
    const result = await generateSessionAnalysis(goal, mode, activityLog, focusScore);
    res.json({ available: true, summary: result.summary });
  } catch (err) {
    console.error('analysis route error:', err.message);
    // Fail open — never block the summary screen from showing due to an AI error
    res.json({ available: false });
  }
});

module.exports = router;