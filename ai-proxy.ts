// ═══════════════════════════════════════════════════
// VALDENMERE — AI PROXY
// Supabase Edge Function: proxies OpenRouter requests
// so the API key never reaches the browser.
//
// Deploy: supabase functions deploy ai-proxy
// Secret: supabase secrets set OPENROUTER_API_KEY=sk-or-...
// ═══════════════════════════════════════════════════

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGIN') || '*';

Deno.serve(async (req: Request) => {
  // ── CORS preflight ──────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      }
    });
  }

  // ── Only allow POST ─────────────────────────────
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // ── Read the request body ───────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // ── Get the secret key ──────────────────────────
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) {
    return new Response('Server misconfiguration', { status: 500 });
  }

  // ── Forward to OpenRouter ───────────────────────
  const upstream = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://valdenmere.game',
      'X-Title': 'Valdenmere',
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();

  return new Response(JSON.stringify(data), {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
    }
  });
});
