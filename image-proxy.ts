// ═══════════════════════════════════════════════════
// VALDENMERE — IMAGE PROXY
// Supabase Edge Function: proxies Dezgo requests
// so the API key never reaches the browser.
//
// Deploy: supabase functions deploy image-proxy
// Secret: supabase secrets set DEZGO_API_KEY=your-key
// ═══════════════════════════════════════════════════

const DEZGO_URL = 'https://api.dezgo.com/text2image_sdxl';
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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // ── Read FormData from the browser ─────────────
  // The browser sends the same FormData fields as before,
  // minus the API key. We add the key here server-side.
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response('Invalid form data', { status: 400 });
  }

  const apiKey = Deno.env.get('DEZGO_API_KEY');
  if (!apiKey) {
    return new Response('Server misconfiguration', { status: 500 });
  }

  // ── Forward to Dezgo ────────────────────────────
  const upstream = await fetch(DEZGO_URL, {
    method: 'POST',
    headers: {
      'X-Dezgo-Key': apiKey,
      // No Content-Type header — let fetch set it with the boundary
    },
    body: formData,
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    return new Response(errText, { status: upstream.status });
  }

  // ── Return the image blob ───────────────────────
  const imageBlob = await upstream.arrayBuffer();

  return new Response(imageBlob, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
    }
  });
});
