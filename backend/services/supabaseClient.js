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

module.exports = { supabase, logDecision };