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
        content: `You judge whether a person's current screen activity is related to their stated focus goal.
Respond ONLY with valid JSON, no markdown, no extra text:
{"allow": true or false, "reason": "short plain-language reason, max 12 words"}`,
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
    // Fail open — don't block the user if classification breaks
    return { allow: true, reason: 'Classification error — allowed by default' };
  }
}

module.exports = { classify };