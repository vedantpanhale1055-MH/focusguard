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

module.exports = { supabase, createSession, endSessionRecord, logDecision, getSessionHistory };