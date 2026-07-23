const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Classifies whether the current window/tab is related to the user's stated goal.
 * @param {string} goal - the user's stated focus goal
 * @param {string} windowTitle - the active window/tab title
 * @returns {Promise<{allow: boolean, reason: string}>}
 */
async function classify(goal, windowTitle) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You judge whether a person's current screen activity helps or hurts their stated focus goal.

Rules:
- Judge the SPECIFIC content in the title, not the platform/app it's on.
- YouTube, Chrome, and similar are neutral containers — a coding tutorial video on YouTube is ALLOWED for a coding goal, even though YouTube also hosts unrelated entertainment.
- Only block if the specific title is clearly unrelated to the goal (e.g. entertainment, gaming, social media content, or a topic that doesn't match).
- If the title is ambiguous or too generic to tell, lean toward ALLOW rather than block.
- Never block based on the app/platform name alone.

Respond ONLY with valid JSON, no markdown, no extra text:
{"allow": true or false, "reason": "short plain-language reason, max 12 words, refer to the specific content not the platform"}`,
      },
      {
        role: 'user',
        content: `Goal: "${goal}"\nCurrent activity: "${windowTitle}"`,
      },
    ],
    temperature: 0.2,
    max_tokens: 60,
  });

  const raw = completion.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse Groq response:', raw);
    return { allow: true, reason: 'Classification error — allowed by default' };
  }
}

module.exports = { classify };

async function generateExitQuestion(goal, mode, activityLog) {
  const recentTitles = (activityLog || [])
    .filter(a => a.allow)
    .slice(-8)
    .map(a => a.title)
    .join(", ") || "no specific content logged";

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You write ONE short quiz-style question checking if a user actually engaged with their focus session content, before they end it early. Base it on the content titles given. Keep it under 20 words, plain language, no preamble.
Respond ONLY with JSON: {"question": "..."}`
      },
      {
        role: "user",
        content: `Goal: "${goal}"\nMode: "${mode}"\nContent covered: ${recentTitles}`
      }
    ],
    temperature: 0.4,
    max_tokens: 80,
  });

  const raw = completion.choices[0].message.content.trim();
  return JSON.parse(raw.replace(/```json|```/g, ""));
}

async function gradeExitAnswer(question, answer, goal) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You loosely judge if a user's answer shows genuine engagement with a focus session, not strict correctness. Be lenient — any specific, non-empty, non-gibberish answer related to the topic passes. Only fail obviously blank, random, or dismissive answers (e.g. "idk", "x", single letters).
Respond ONLY with JSON: {"passed": true|false, "feedback": "short encouraging one-liner, max 15 words"}`
      },
      {
        role: "user",
        content: `Goal: "${goal}"\nQuestion asked: "${question}"\nUser's answer: "${answer}"`
      }
    ],
    temperature: 0.2,
    max_tokens: 60,
  });

  const raw = completion.choices[0].message.content.trim();
  return JSON.parse(raw.replace(/```json|```/g, ""));
}

module.exports = { classify, generateExitQuestion, gradeExitAnswer };