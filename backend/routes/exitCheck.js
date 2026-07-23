const express = require("express");
const router = express.Router();
const { generateExitQuestion, gradeExitAnswer } = require("../services/llmClassifier");

const REFLECTIVE_MODES = ["Study", "Reading", "Coursework"];

router.post("/question", async (req, res) => {
  try {
    const { goal, mode, activityLog } = req.body;

    if (!REFLECTIVE_MODES.includes(mode)) {
      return res.json({ applicable: false });
    }

    const result = await generateExitQuestion(goal, mode, activityLog);
    res.json({ applicable: true, question: result.question });
  } catch (err) {
    console.error("exit-check/question error:", err.message);
    // Fail open — never block someone from exiting due to an AI error
    res.json({ applicable: false });
  }
});

router.post("/grade", async (req, res) => {
  try {
    const { question, answer, goal } = req.body;
    const result = await gradeExitAnswer(question, answer, goal);
    res.json(result);
  } catch (err) {
    console.error("exit-check/grade error:", err.message);
    res.json({ passed: true, feedback: "Could not verify — proceeding anyway." });
  }
});

module.exports = router;