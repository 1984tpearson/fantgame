const CONFIG = {
  SUPABASE_URL: 'https://keqzqhykfygplolcnxnn.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_w0h8f1AIXQGty5X5nKrJtg_ThI1-a-j',

  AI_PROXY_URL: 'https://keqzqhykfygplolcnxnn.supabase.co/functions/v1/ai-proxy',
  IMAGE_PROXY_URL: 'https://keqzqhykfygplolcnxnn.supabase.co/functions/v1/image-proxy',

  TEXT_MODEL: 'nothingiisreal/mn-celeste-12b',

  IMAGE_MODEL: 'sdxl_1024px',
  IMAGE_WIDTH: 1024,
  IMAGE_HEIGHT: 1024,
  IMAGE_STEPS: 33,
  IMAGE_GUIDANCE: 7.5,
  IMAGE_SAMPLER: 'dpm_single',

  // Style leads the prompt — SDXL weights early tokens most heavily
  IMAGE_STYLE_SUFFIX: 'fantasy landscape painting, rolling countryside, naturalistic lighting, painterly brushwork, bold ink outlines, muted earthy tones with occasional colour, cinematic composition, grounded medieval fantasy, detailed environment art',
  IMAGE_NEGATIVE_PROMPT: 'western, desert, arid, cactus, cowboys, modern, sci-fi, photorealistic, 3D render, monochrome, flat, cartoon, anime, top-down, map, watermark, signature, text, people, person, ugly, blurry, low quality',

  // ── NPC / CREATURE PORTRAIT GENERATION ──────────────────────────────────
  NPC_IMAGE_MODEL:    'envy_starlight_xl_01_lightning_1024px',
  NPC_IMAGE_WIDTH:    768,
  NPC_IMAGE_HEIGHT:   1024,
  NPC_IMAGE_GUIDANCE: 2.0,
  NPC_IMAGE_SAMPLER:  'ddim',
  NPC_IMAGE_STYLE_SUFFIX: 'Mediaeval+++, Full body shot++, No background+++ (gritty Comic book Art style+, Thick black ink outlines, flat cell shading, painterly colouring)++',
  NPC_IMAGE_NEGATIVE: 'Background-- Close up, Anime--, Photo Realistic, Smooth shading, texture, extra cloth--, loose fabric--, monochrome, sketch, tattoos, big mouth, big smile, sci-fi, superhero, muscles, muscular, extra limbs, badly drawn hands',

  ENABLE_SCENE_IMAGES: false,
  ENABLE_NPC_IMAGES: true,
  ENABLE_SUPABASE: true,
};
