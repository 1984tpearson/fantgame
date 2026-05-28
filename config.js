// ═══════════════════════════════════════════════════
// VALDENMERE — CONFIG
// Fill in your API keys before deploying.
// IMPORTANT: Never commit real keys to a public GitHub
// repo. Add config.js to your .gitignore, or use
// GitHub Secrets / environment variables for production.
// ═══════════════════════════════════════════════════

const CONFIG = {

  // ── ANTHROPIC via OpenRouter ─────────────────────
  // Get your key: https://openrouter.ai/keys
  OPENROUTER_API_KEY: 'YOUR_OPENROUTER_KEY_HERE',
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
  TEXT_MODEL: 'anthropic/claude-sonnet-4-5',

  // ── DEZGO (Scene Image Generation) ──────────────
  // Get your key: https://dezgo.com/account → API Keys tab
  DEZGO_API_KEY: 'YOUR_DEZGO_KEY_HERE',
  DEZGO_BASE_URL: 'https://api.dezgo.com',
  IMAGE_MODEL: 'sdxl_1024px',
  IMAGE_WIDTH: 768,
  IMAGE_HEIGHT: 512,
  IMAGE_STEPS: 33,
  IMAGE_GUIDANCE: 7.0,
  IMAGE_SAMPLER: 'dpm_single',

  // Style suffix appended to every scene image prompt
  IMAGE_STYLE_SUFFIX: 'fantasy concept illustration, painterly warm earthy tones, bold ink outlines, comic book cross-hatching shading, aged parchment color palette, lush detailed environment, cinematic fantasy art, semi-realistic',
  IMAGE_NEGATIVE_PROMPT: 'top-down, flat map, cartography, photorealistic, 3D render, monochrome, modern, people, person, text, watermark, signature',

  // ── SUPABASE ─────────────────────────────────────
  // Get these: Supabase dashboard → Project Settings → API
  SUPABASE_URL: 'YOUR_SUPABASE_PROJECT_URL',      // e.g. https://xxxx.supabase.co
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',

  // ── FEATURE FLAGS ────────────────────────────────
  ENABLE_IMAGES: true,       // false = disable image gen (saves Dezgo credits while testing)
  ENABLE_SUPABASE: true,     // false = fall back to localStorage only
};
