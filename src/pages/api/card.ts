import type { APIRoute } from 'astro';
import { db } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sessionId, cardName } = await request.json();

    if (!sessionId || !cardName) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    await db.recordCardPick(sessionId, cardName);
    await db.updateSessionActivity(sessionId);

    const count = await db.getCardStats(cardName);

    return new Response(JSON.stringify({ 
      success: true,
      count
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
