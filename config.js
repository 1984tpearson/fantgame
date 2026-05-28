
// ═══════════════════════════════════════════════════
// VALDENMERE — CONFIG
// API keys are gone from here — they live as Supabase
// secrets and are injected server-side by Edge Functions.
// Only public-safe values belong in this file.
// ═══════════════════════════════════════════════════

const CONFIG = {

  // ── SUPABASE (public values — safe to expose) ───
  SUPABASE_URL: 'https://keqzqhykfygplolcnxnn.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_w0h8f1AIXQGty5X5nKrJtg_ThI1-a-j',

  // ── EDGE FUNCTION URLS ──────────────────────────
  get AI_PROXY_URL()    { return `${this.SUPABASE_URL}/functions/v1/ai-proxy`; },
  get IMAGE_PROXY_URL() { return `${this.SUPABASE_URL}/functions/v1/image-proxy`; },

  // ── AI MODEL ────────────────────────────────────
  TEXT_MODEL: 'anthropic/claude-sonnet-4-5',

  // ── IMAGE GENERATION SETTINGS ───────────────────
  IMAGE_MODEL: 'sdxl_1024px',
  IMAGE_WIDTH: 768,
  IMAGE_HEIGHT: 512,
  IMAGE_STEPS: 33,
  IMAGE_GUIDANCE: 7.0,
  IMAGE_SAMPLER: 'dpm_single',

  IMAGE_STYLE_SUFFIX: 'fantasy concept illustration, painterly warm earthy tones, bold ink outlines, comic book cross-hatching shading, aged parchment color palette, lush detailed environment, cinematic fantasy art, semi-realistic',
  IMAGE_NEGATIVE_PROMPT: 'top-down, flat map, cartography, photorealistic, 3D render, monochrome, modern, people, person, text, watermark, signature',

  // ── FEATURE FLAGS ────────────────────────────────
  ENABLE_IMAGES: true,
  ENABLE_SUPABASE: true,
};
