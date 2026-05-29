const CONFIG = {
  SUPABASE_URL: 'https://keqzqhykfygplolcnxnn.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_w0h8f1AIXQGty5X5nKrJtg_ThI1-a-j',

  AI_PROXY_URL: 'https://keqzqhykfygplolcnxnn.supabase.co/functions/v1/ai-proxy',
  IMAGE_PROXY_URL: 'https://keqzqhykfygplolcnxnn.supabase.co/functions/v1/image-proxy',

  TEXT_MODEL: 'anthropic/claude-sonnet-4-5',

  IMAGE_MODEL: 'sdxl_1024px',
  IMAGE_WIDTH: 1024,
  IMAGE_HEIGHT: 1024,
  IMAGE_STEPS: 33,
  IMAGE_GUIDANCE: 7.5,
  IMAGE_SAMPLER: 'dpm_single',

  // Style leads the prompt — SDXL weights early tokens most heavily
  IMAGE_STYLE_SUFFIX: 'fantasy landscape painting, rolling countryside, naturalistic lighting, painterly brushwork, bold ink outlines, muted earthy tones with occasional colour, cinematic composition, grounded medieval fantasy, detailed environment art',
  IMAGE_NEGATIVE_PROMPT: 'western, desert, arid, cactus, cowboys, modern, sci-fi, photorealistic, 3D render, monochrome, flat, cartoon, anime, top-down, map, watermark, signature, text, people, person, ugly, blurry, low quality',

  ENABLE_IMAGES: false,
  ENABLE_SUPABASE: true,
};
