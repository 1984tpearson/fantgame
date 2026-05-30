// ═══════════════════════════════════════════════════
// VALDENMERE — IMAGE PROXY
// Supabase Edge Function: proxies Dezgo requests
// so the API key never reaches the browser.
//
// Deploy: supabase functions deploy image-proxy
// Secret: supabase secrets set DEZGO_API_KEY=your-key
// ═══════════════════════════════════════════════════

const DEZGO_URL = 'https://api.dezgo.com/text2image_sdxl';
const ALLOWED_ORIGINS = [
  'https://1984tpearson.github.io',
  'http://localhost',
  'http://127.0.0.1',
];

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

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

  const upstream = await fetch(DEZGO_URL, {
    method: 'POST',
    headers: { 'X-Dezgo-Key': apiKey },
    body: formData,
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    return new Response(errText, { status: upstream.status, headers: corsHeaders });
  }

  const imageBlob = await upstream.arrayBuffer();

  return new Response(imageBlob, {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'image/png' }
  });
});
