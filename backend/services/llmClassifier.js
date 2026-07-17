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