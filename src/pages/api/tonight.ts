import type { APIRoute } from 'astro';
import { db } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  try {
    const stats = await db.getTonightObservations();

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
