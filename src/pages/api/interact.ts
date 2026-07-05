import type { APIRoute } from 'astro';
import { db } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sessionId, stepName, value } = await request.json();

    if (!sessionId || !stepName || !value) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    await db.recordInteraction(sessionId, stepName, value);
    await db.updateSessionActivity(sessionId);

    // Fetch recent traces occasionally
    const traces = await db.getTraces();
    
    // Pick a random interesting trace that isn't the current user
    let interestingTrace = null;
    if (traces.length > 0 && Math.random() > 0.7) {
      const trace = traces[Math.floor(Math.random() * traces.length)];
      if (trace.sessions && trace.sessions.country_code) {
        const timeAgo = Math.max(1, Math.floor((Date.now() - new Date(trace.created_at).getTime()) / 60000));
        interestingTrace = `Someone in ${trace.sessions.country_code} chose '${trace.value}' ${timeAgo} minutes ago.`;
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      trace: interestingTrace
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
