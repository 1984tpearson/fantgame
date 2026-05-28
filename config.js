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
  OPENROUTER_API_KEY: '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',
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
  TEXT_MODEL: 'anthropic/claude-sonnet-4-5',

  // ── DEZGO (Scene Image Generation) ──────────────
  // Get your key: https://dezgo.com/account → API Keys tab
  DEZGO_API_KEY: 'DEZGO-88C392970054FC6D57BFF1A80CB229C4D320A5C685F30F7968140FC6CEA090ECAD979413E',
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
  SUPABASE_URL: 'https://1984tpearson.github.io/fantgame',      // e.g. https://xxxx.supabase.co
  SUPABASE_ANON_KEY: 'sb_publishable_w0h8f1AIXQGty5X5nKrJtg_ThI1-a-j',

  // ── FEATURE FLAGS ────────────────────────────────
  ENABLE_IMAGES: true,       // false = disable image gen (saves Dezgo credits while testing)
  ENABLE_SUPABASE: true,     // false = fall back to localStorage only
};
