import type { APIRoute } from 'astro';
import { db } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Optionally update activity if sessionId is passed via query param
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    if (sessionId) {
      await db.updateSessionActivity(sessionId);
    }

    const stats = await db.getStats();

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
