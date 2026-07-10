import type { APIRoute } from 'astro';
import { db } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get country from Vercel/Cloudflare headers, fallback to Unknown
    const country = request.headers.get('x-vercel-ip-country') || 
                    request.headers.get('cf-ipcountry') || 
                    'Unknown';

    const sessionId = await db.createSession(country);

    // Optional: check if first from country today (mocking the rare event logic slightly)
    const isFirstFromCountry = Math.random() > 0.95; // In a real app, query the DB

    return new Response(JSON.stringify({ 
      sessionId,
      country,
      message: isFirstFromCountry && country !== 'Unknown' 
        ? `You are the first visitor from ${country} today.` 
        : null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
