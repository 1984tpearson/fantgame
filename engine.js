// ═══════════════════════════════════════════════════
// VALDENMERE ENGINE 
// Reads world data from window.WORLD_DATA (set by worlds/*.js)
// Reads config from window.CONFIG (set by config.js)
// ═══════════════════════════════════════════════════

// ── TERRAIN TYPE CONSTANTS ──────────────────────────
const T = window.T = {
  OCEAN:'ocean', PLAINS:'plains', FOREST:'forest', MOUNTAIN:'mountain',
  CITY:'city', TOWN:'town', VILLAGE:'village', ROAD:'road', FARMLAND:'farmland', RIVER:'river',
  STREET:'street', BUILDING:'building', DOOR:'door', WALL:'wall',
  COURTYARD:'courtyard', MARKET:'market', DOCKS:'docks', GATE:'gate', INTERIOR:'interior',
  SWAMP:'swamp', BOG:'bog', WILDS:'wilds', FENS:'fens', SHORE:'shore', PEAKS:'peaks',
  CASTLE:'castle', KEEP:'keep', RUINS:'ruins'
};

// ── WORLD DATA REFERENCES ──────────────────────────
const WORLD_META             = WORLD_DATA.meta;
const SETTLEMENTS            = WORLD_DATA.settlements;
const OVERWORLD_TO_SETTLEMENT = WORLD_DATA.overworldToSettlement;
const NPC_TEMPLATES          = WORLD_DATA.npcTemplates;
const FACTIONS               = WORLD_DATA.factions;

// ═══════════════════════════════════════════════════
// SUPABASE CLIENT (lightweight — no SDK needed)
// ═══════════════════════════════════════════════════
const DB = {
  async query(path, method='GET', body=null) {
    if (!CONFIG.ENABLE_SUPABASE) return null;
    try {
      const opts = {
        method,
        headers: {
          'apikey': CONFIG.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': method === 'POST' ? 'return=minimal,resolution=merge-duplicates' : 'return=minimal'
        }
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${path}`, opts);
      if (!res.ok) return null;
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch(e) { return null; }
  },

  async upsertCell(cellData) {
    return this.query('cells?on_conflict=world_id,player_id,layer,settlement_id,x,y', 'POST', {
      ...cellData,
      world_id: WORLD_DATA.id,
      player_id: 'default',
    });
  },

  async getCell(layer, settlementId, x, y) {
    const sid = settlementId || 'null.is.null'; // hack: supabase null filter
    const filter = settlementId
      ? `world_id=eq.${WORLD_DATA.id}&player_id=eq.default&layer=eq.${layer}&settlement_id=eq.${settlementId}&x=eq.${x}&y=eq.${y}`
      : `world_id=eq.${WORLD_DATA.id}&player_id=eq.default&layer=eq.${layer}&settlement_id=is.null&x=eq.${x}&y=eq.${y}`;
    const rows = await this.query(`cells?${filter}&limit=1`);
    return rows?.[0] || null;
  },

  async upsertNpc(npcId, npcData) {
    return this.query('npc_state?on_conflict=world_id,player_id,npc_id', 'POST', {
      ...npcData, npc_id: npcId, world_id: WORLD_DATA.id, player_id: 'default'
    });
  },

  async getNpc(npcId) {
    const rows = await this.query(`npc_state?world_id=eq.${WORLD_DATA.id}&player_id=eq.default&npc_id=eq.${npcId}&limit=1`);
    return rows?.[0] || null;
  },

  async savePlayer(playerData) {
    return this.query('player_state?on_conflict=world_id,player_id', 'POST', {
      ...playerData, world_id: WORLD_DATA.id, player_id: 'default'
    });
  },

  async loadPlayer() {
    const rows = await this.query(`player_state?world_id=eq.${WORLD_DATA.id}&player_id=eq.default&limit=1`);
    return rows?.[0] || null;
  },

  // Upload image blob to Supabase Storage, return public URL
  async uploadImage(blob, filename) {
    if (!CONFIG.ENABLE_SUPABASE) return null;
    try {
      const res = await fetch(`${CONFIG.SUPABASE_URL}/storage/v1/object/scene-images/${filename}`, {
        method: 'POST',
        headers: {
          'apikey': CONFIG.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
          'Content-Type': 'image/png',
          'x-upsert': 'true'
        },
        body: blob
      });
      if (!res.ok) return null;
      return `${CONFIG.SUPABASE_URL}/storage/v1/object/public/scene-images/${filename}`;
    } catch(e) { return null; }
  }
};

// ═══════════════════════════════════════════════════
// IMAGE GENERATION (DEZGO)
// ═══════════════════════════════════════════════════
async function generateSceneImage(description, cellKeyStr) {
  if (!CONFIG.ENABLE_SCENE_IMAGES) return null;
  try {
    const prompt = `${CONFIG.IMAGE_STYLE_SUFFIX}, ${description}`;
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('negative_prompt', CONFIG.IMAGE_NEGATIVE_PROMPT);
    form.append('model', CONFIG.IMAGE_MODEL);
    form.append('width', String(CONFIG.IMAGE_WIDTH));
    form.append('height', String(CONFIG.IMAGE_HEIGHT));
    form.append('steps', String(CONFIG.IMAGE_STEPS));
    form.append('guidance', String(CONFIG.IMAGE_GUIDANCE));
    form.append('sampler', CONFIG.IMAGE_SAMPLER);
    form.append('refiner', 'true');

    // Request goes to our Edge Function — Dezgo key never touches the browser
    const res = await fetch(CONFIG.IMAGE_PROXY_URL, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: form
    });

    if (!res.ok) return null;
    const blob = await res.blob();

    // Upload to Supabase Storage
    const filename = `${cellKeyStr.replace(/[^a-z0-9_-]/gi, '_')}.png`;
    const url = await DB.uploadImage(blob, filename);

    // Fallback: create object URL if Supabase upload failed
    if (!url) return URL.createObjectURL(blob);
    return url;
  } catch(e) {
    console.warn('Image generation failed:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════
// NPC / CREATURE PORTRAIT GENERATION
// ═══════════════════════════════════════════════════
function buildNpcImageFilename(npcId, tmpl) {
  const slug = s => (s||'unknown').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const race  = slug(tmpl.race  || 'human');
  const role  = slug(tmpl.role  || 'npc');
  const trait = slug(tmpl.traits?.[0] || 'unknown');
  return `npc_${race}_${role}_${trait}.png`;
}

function buildNpcImagePrompt(tmpl) {
  const parts = [];
  // Always lead with gender to ensure correct image generation
  const genderWord = tmpl.gender === 'male' ? 'male' : tmpl.gender === 'female' ? 'female' : '';
  // Use explicit appearance field if present — this is the primary visual descriptor
  if (tmpl.appearance) {
    parts.push(genderWord ? `${genderWord}, ${tmpl.appearance}` : tmpl.appearance);
  } else {
    // Fallback for dynamic/spawned NPCs without appearance field
    const age  = tmpl.age    ? `${tmpl.age} year old` : '';
    const race = tmpl.race   || 'human';
    const role = tmpl.role   || 'villager';
    parts.push(`${age} ${race} ${role}`.trim());
    // Only include traits that are visually descriptive, skip personality ones
    const visualTraits = (tmpl.traits || []).filter(t =>
      /tall|short|fat|thin|lean|stocky|muscular|gaunt|pale|dark|scarred|hooded|bearded|bald|old|young|weathered|worn|ragged|neat|elegant/.test(t)
    );
    if (visualTraits.length) parts.push(visualTraits.join(', '));
  }
  // Add role as context for clothing/setting
  if (tmpl.appearance && tmpl.role) parts.push(tmpl.role);
  return parts.join(', ') + ', ' + CONFIG.NPC_IMAGE_STYLE_SUFFIX;
}

async function generateNpcImage(npcId, forceRegen = false) {
  if (!CONFIG.ENABLE_NPC_IMAGES) return null;
  const tmpl = NPC_TEMPLATES[npcId];
  if (!tmpl) return null;
  // Return cached URL immediately if already generated
  if (tmpl.imageUrl) return tmpl.imageUrl;

  try {
    const prompt   = buildNpcImagePrompt(tmpl);
    const filename = buildNpcImageFilename(npcId, tmpl);

    // Try the stored URL first — skip unreliable HEAD check, just attempt a GET
    if (CONFIG.ENABLE_SUPABASE) {
      const storedUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/scene-images/npcs/${filename}`;
      const probe = await fetch(storedUrl, { method: 'GET', headers: { Range: 'bytes=0-0' } }).catch(() => null);
      if (!forceRegen && (probe?.ok || probe?.status === 206)) {
        tmpl.imageUrl = storedUrl;
        return storedUrl;
      }
    }

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('negative_prompt', CONFIG.NPC_IMAGE_NEGATIVE);
    form.append('model',    CONFIG.NPC_IMAGE_MODEL);
    form.append('width',    String(CONFIG.NPC_IMAGE_WIDTH));
    form.append('height',   String(CONFIG.NPC_IMAGE_HEIGHT));
    form.append('guidance', String(CONFIG.NPC_IMAGE_GUIDANCE));
    form.append('sampler',  CONFIG.NPC_IMAGE_SAMPLER);
    form.append('dezgo_endpoint', 'lightning');
    form.append('format',   'png');
    form.append('transparent_background', 'false');

    const res = await fetch(CONFIG.IMAGE_PROXY_URL, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: form
    });
    if (!res.ok) return null;
    const blob = await res.blob();

    // Upload to npcs/ subfolder in storage
    let url = null;
    if (CONFIG.ENABLE_SUPABASE) {
      const uploadRes = await fetch(
        `${CONFIG.SUPABASE_URL}/storage/v1/object/scene-images/npcs/${filename}`,
        {
          method: 'POST',
          headers: {
            'apikey': CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
            'Content-Type': 'image/png',
            'x-upsert': 'true'
          },
          body: blob
        }
      );
      if (uploadRes.ok) url = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/scene-images/npcs/${filename}`;
    }
    if (!url) url = URL.createObjectURL(blob);

    tmpl.imageUrl = url;
    return url;
  } catch(e) {
    console.warn('NPC image generation failed:', e);
    return null;
  }
}

function applyNpcPortrait(imageUrl, drawerId) {
  const wrap  = document.getElementById(drawerId + '-portrait-wrap');
  const img   = document.getElementById(drawerId + '-portrait-img');
  const emoji = document.getElementById(drawerId + '-avatar-emoji');
  if (!wrap || !img) return;
  if (!imageUrl) {
    wrap.classList.remove('has-portrait');
    img.src = '';
    if (emoji) emoji.style.display = '';
    return;
  }
  // Set src first — browser won't load a display:none img in some cases
  img.style.display = 'block';
  img.style.opacity = '0';
  img.onload = () => {
    img.style.opacity = '1';
    wrap.classList.add('has-portrait');
    if (emoji) emoji.style.display = 'none';
  };
  img.onerror = () => {
    // Image failed — hide and show emoji fallback
    img.style.display = 'none';
    wrap.classList.remove('has-portrait');
    if (emoji) emoji.style.display = '';
  };
  img.src = imageUrl;
}

// Apply portrait silently in background — called when drawer opens
async function triggerNpcPortrait(npcId, drawerId) {
  const url = await generateNpcImage(npcId);
  if (url) applyNpcPortrait(url, drawerId);
}

// ── Portrait overlay ──────────────────────────────
let _portraitOverlayNpcId = null;
let _portraitOverlayDrawerId = null;

function openPortraitOverlay(drawerId) {
  const npcId = drawerId === 'creature' ? creatureSession.npcId : npcSession.npcId;
  if (!npcId) return;
  const tmpl = NPC_TEMPLATES[npcId];
  if (!tmpl) return;
  _portraitOverlayNpcId = npcId;
  _portraitOverlayDrawerId = drawerId;

  const overlay = document.getElementById('portrait-overlay');
  const img = document.getElementById('portrait-overlay-img');
  const placeholder = document.getElementById('portrait-overlay-placeholder');

  if (tmpl.imageUrl) {
    img.src = tmpl.imageUrl;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    img.style.display = 'none';
    img.src = '';
    placeholder.style.display = 'flex';
    placeholder.textContent = tmpl.emoji || '🐾';
  }

  document.getElementById('portrait-regen-btn').classList.remove('loading');
  overlay.classList.add('open');
}

function closePortraitOverlay() {
  document.getElementById('portrait-overlay').classList.remove('open');
  _portraitOverlayNpcId = null;
}

function handlePortraitOverlayClick(e) {
  if (e.target === document.getElementById('portrait-overlay')) closePortraitOverlay();
}

async function regenPortrait(e) {
  e.stopPropagation();
  if (!_portraitOverlayNpcId) return;
  const tmpl = NPC_TEMPLATES[_portraitOverlayNpcId];
  if (!tmpl) return;

  const btn = document.getElementById('portrait-regen-btn');
  btn.classList.add('loading');
  btn.textContent = '✦ Generating…';

  // Clear cached URL so generateNpcImage re-generates
  delete tmpl.imageUrl;

  const url = await generateNpcImage(_portraitOverlayNpcId, true);

  btn.classList.remove('loading');
  btn.textContent = '✦ Generate New';

  if (url) {
    const img = document.getElementById('portrait-overlay-img');
    const placeholder = document.getElementById('portrait-overlay-placeholder');
    const bustUrl = url.split('?')[0] + '?_t=' + Date.now();
    img.onload = null;
    img.src = '';
    setTimeout(() => {
      img.src = bustUrl;
      img.style.display = 'block';
      placeholder.style.display = 'none';
      if (_portraitOverlayDrawerId) applyNpcPortrait(bustUrl, _portraitOverlayDrawerId);
    }, 50);
  }
}

// Apply scene image as background of the scene area
function applySceneBackground(imageUrl) {
  const sceneBox = document.getElementById('scene-box');
  if (!imageUrl) {
    sceneBox.style.backgroundImage = '';
    sceneBox.style.backgroundSize = '';
    sceneBox.style.backgroundPosition = '';
    document.getElementById('scene-img-btns')?.remove();
    return;
  }
  sceneBox.style.backgroundImage = `url('${imageUrl}')`;
  sceneBox.style.backgroundSize = 'cover';
  sceneBox.style.backgroundPosition = 'center';

  // Add text backdrop to all existing messages
  document.querySelectorAll('.message').forEach(el => {
    el.style.background = 'rgba(10,8,6,0.55)';
    el.style.borderRadius = '3px';
    el.style.padding = '6px 10px';
  });

  // Add/update scene image control buttons
  let btns = document.getElementById('scene-img-btns');
  if (!btns) {
    btns = document.createElement('div');
    btns.id = 'scene-img-btns';
    btns.style.cssText = 'position:sticky;top:8px;right:0;display:flex;gap:6px;justify-content:flex-end;z-index:10;margin-bottom:6px;';
    btns.innerHTML = `
      <button onclick="toggleSceneText()" id="btn-toggle-text" style="background:rgba(10,8,6,0.7);border:1px solid rgba(201,148,58,0.4);color:var(--gold);font-size:0.65rem;font-family:'Cinzel Decorative',serif;padding:4px 8px;cursor:pointer;border-radius:2px;">Hide Text</button>
      <button onclick="refreshSceneImage()" id="btn-refresh-img" style="background:rgba(10,8,6,0.7);border:1px solid rgba(201,148,58,0.4);color:var(--gold);font-size:0.65rem;font-family:'Cinzel Decorative',serif;padding:4px 8px;cursor:pointer;border-radius:2px;">⟳ Image</button>
    `;
    sceneBox.insertBefore(btns, sceneBox.firstChild);
  }
}

let _textHidden = false;
function toggleSceneText() {
  _textHidden = !_textHidden;
  const btn = document.getElementById('btn-toggle-text');
  document.querySelectorAll('.message').forEach(el => {
    el.style.display = _textHidden ? 'none' : '';
  });
  if (btn) btn.textContent = _textHidden ? 'Show Text' : 'Hide Text';
}

async function refreshSceneImage() {
  const btn = document.getElementById('btn-refresh-img');
  if (btn) { btn.textContent = '...'; btn.disabled = true; }
  const key = cellKey(state.pos.x, state.pos.y);
  const cell = state.cells[key];
  const meta = getCellMeta(state.pos.x, state.pos.y);
  const northMeta = getCellMeta(state.pos.x, state.pos.y - 1);
  const northHint = (northMeta.name && northMeta.name !== meta.name) ? ` To the north: ${northMeta.name}.` : '';
  // Use stored description if available, otherwise location name
  const desc = (cell?.description || cell?.locationName || terrainLabel(meta.type)) + northHint;
  const newKey = key + '_' + Date.now();
  const url = await generateSceneImage(desc, newKey);
  if (url) {
    applySceneBackground(url);
    state.cells[key].imageUrl = url;
    saveState();
  }
  if (btn) { btn.textContent = '⟳ Image'; btn.disabled = false; }
}

// Continue with the rest of the file...
// (The rest remains the same as in the source)
