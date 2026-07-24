const { createClient } = require('@supabase/supabase-js');

let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
} else {
  console.warn('Supabase env vars missing — logging is disabled for now.');
}

/**
 * Creates a new row in the `sessions` table when a session starts.
 * Returns the new session's UUID, or null if Supabase isn't configured
 * or the insert fails (fail-open — a missing sessionId just means
 * decisions won't be logged for this session, the app still works).
 */
async function createSession({ goal, mode }) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('sessions')
    .insert([{ goal, mode }])
    .select('id')
    .single();

  if (error) {
    console.error('Supabase createSession error:', JSON.stringify(error));
    return null;
  }

  return data.id;
}

/**
 * Ends a session: computes a focus score from every decision logged
 * against it, then writes ended_at + focus_score back onto the row.
 * Returns the computed focus score (0-100), or null if it couldn't
 * be computed (no Supabase, no sessionId, or no decisions logged).
 */
async function endSessionRecord(sessionId) {
  if (!supabase || !sessionId) return null;

  const { data: decisions, error: fetchError } = await supabase
    .from('decisions')
    .select('allowed')
    .eq('session_id', sessionId);

  if (fetchError) {
    console.error('Supabase endSessionRecord fetch error:', fetchError.message);
    return null;
  }

  const total = decisions.length;
  const allowed = decisions.filter((d) => d.allowed).length;
  const focusScore = total === 0 ? 100 : Math.round((allowed / total) * 100);

  const { error: updateError } = await supabase
    .from('sessions')
    .update({ ended_at: new Date().toISOString(), focus_score: focusScore })
    .eq('id', sessionId);

  if (updateError) {
    console.error('Supabase endSessionRecord update error:', updateError.message);
  }

  return focusScore;
}

/**
 * Logs a single classification decision to the decisions table.
 * Silently skips if Supabase isn't configured yet.
 */
async function logDecision({ sessionId, tabTitle, allowed, reason }) {
  if (!supabase) return;

  const { error } = await supabase.from('decisions').insert([
    {
      session_id: sessionId,
      tab_title: tabTitle,
      allowed,
      reason,
    },
  ]);

  if (error) {
    console.error('Supabase logDecision error:', error.message);
  }
}

/**
 * Returns the most recent sessions (default 20), newest first.
 * Used for the past-sessions list and, later, the productivity timeline.
 */
async function getSessionHistory(limit = 20) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('sessions')
    .select('id, goal, mode, started_at, ended_at, focus_score')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Supabase getSessionHistory error:', error.message);
    return [];
  }

  return data;
}

/**
 * Returns a daily-aggregated focus history for the heatmap timeline.
 * Only counts sessions that actually ended with a numeric focus_score
 * (in-progress / never-ended sessions are excluded, same as they are
 * from the focus score everywhere else).
 *
 * Each day's score is weighted by session duration in minutes, so a
 * 60-minute session pulls a day's average more than a 5-minute one.
 *
 * Returns: [{ date: 'YYYY-MM-DD', score: 0-100, sessionCount }]
 * — one entry per day that actually has data (no entry = no sessions
 * that day; the frontend renders that as an empty/grey cell).
 */
async function getDailyFocusHistory(days = 90) {
  if (!supabase) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { data, error } = await supabase
    .from('sessions')
    .select('started_at, ended_at, focus_score')
    .not('ended_at', 'is', null)
    .gte('started_at', cutoff.toISOString())
    .order('started_at', { ascending: true });

  if (error) {
    console.error('Supabase getDailyFocusHistory error:', error.message);
    return [];
  }

  const byDay = {};

  for (const s of data) {
    if (typeof s.focus_score !== 'number') continue;

    const day = s.started_at.slice(0, 10); // 'YYYY-MM-DD'
    const durationMinutes = Math.max(
      1,
      (new Date(s.ended_at) - new Date(s.started_at)) / 60000
    );

    if (!byDay[day]) {
      byDay[day] = { weightedSum: 0, totalWeight: 0, sessionCount: 0 };
    }

    byDay[day].weightedSum += s.focus_score * durationMinutes;
    byDay[day].totalWeight += durationMinutes;
    byDay[day].sessionCount += 1;
  }

  return Object.entries(byDay).map(([date, agg]) => ({
    date,
    score: Math.round(agg.weightedSum / agg.totalWeight),
    sessionCount: agg.sessionCount,
  }));
}

module.exports = {
  supabase,
  createSession,
  endSessionRecord,
  logDecision,
  getSessionHistory,
  getDailyFocusHistory,
};