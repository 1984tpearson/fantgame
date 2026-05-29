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
  COURTYARD:'courtyard', MARKET:'market', DOCKS:'docks', GATE:'gate', INTERIOR:'interior'
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
          'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
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
  if (!CONFIG.ENABLE_IMAGES) return null;
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
      <button onclick="toggleSceneText()" id="btn-toggle-text" style="background:rgba(10,8,6,0.7);border:1px solid rgba(201,148,58,0.4);color:var(--gold);font-size:0.65rem;font-family:'Cinzel Decorative',serif;padding:3px 8px;border-radius:3px;cursor:pointer;letter-spacing:0.06em;">Hide Text</button>
      <button onclick="refreshSceneImage()" id="btn-refresh-img" style="background:rgba(10,8,6,0.7);border:1px solid rgba(201,148,58,0.4);color:var(--gold);font-size:0.65rem;font-family:'Cinzel Decorative',serif;padding:3px 8px;border-radius:3px;cursor:pointer;letter-spacing:0.06em;">⟳ Image</button>
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

// ═══════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════
let state = {
  layer: 'overworld', settlementId: null, interiorId: null,
  layerHistory: [], entryPos: null,
  pos: { x:0, y:0 }, lastOverworldPos: { x:0, y:0 },
  cells: {}, seen: {}, history: [],
  player: { hp:100, maxHp:100, stamina:100, maxStamina:100, day:1 },
  wallet: { copper:0, silver:0, gold:12, other:[] },
  inventory: [], inventoryOverloaded: false,
  equipped: { head:null, body:null, hands:null, feet:null, weapon:null, offhand:null, accessory:null },
  skills: {},
  worldState: { factions:[], activeWars:[], worldEvents:[], reputation:{} },
  npcs: {},
  inCombat: false, currentEnemy: null,
  blockedBy: null,
};

let npcSession = { npcId: null, history: [], isOpen: false };

// ═══════════════════════════════════════════════════
// CURRENCY HELPERS
// ═══════════════════════════════════════════════════
function walletTotalCopper() {
  const otherTotal=(state.wallet.other||[]).reduce((s,x)=>s+x.amount*x.valueCpEach,0);
  return state.wallet.gold*1000+state.wallet.silver*100+state.wallet.copper+otherTotal;
}
function walletAdd(cp){normaliseWallet(walletTotalCopper()+Math.round(cp));}
function walletSubtract(cp){normaliseWallet(Math.max(0,walletTotalCopper()-Math.round(cp)));}
function normaliseWallet(total){total=Math.max(0,Math.round(total));state.wallet.gold=Math.floor(total/1000);const r=total%1000;state.wallet.silver=Math.floor(r/100);state.wallet.copper=r%100;}
function formatCopper(cp){cp=Math.round(cp);const g=Math.floor(cp/1000),s=Math.floor((cp%1000)/100),c=cp%100;const p=[];if(g)p.push(`${g}g`);if(s)p.push(`${s}s`);if(c||!p.length)p.push(`${c}c`);return p.join(' ');}
function formatWallet(){const p=[];if(state.wallet.gold)p.push(`${state.wallet.gold}g`);if(state.wallet.silver)p.push(`${state.wallet.silver}s`);if(state.wallet.copper)p.push(`${state.wallet.copper}c`);return p.length?p.join(' '):'0c';}
function applyCoins(a){if(!a||!a.amount)return;const amt=Number(a.amount)||0;const cur=(a.currency||'copper').toLowerCase();if(cur==='gold'||cur==='gp')walletAdd(amt*1000);else if(cur==='silver'||cur==='sp')walletAdd(amt*100);else if(cur==='copper'||cur==='cp')walletAdd(amt);else{const vce=Math.round((Number(a.goldEquiv)||0)*1000/amt)||1;if(!state.wallet.other)state.wallet.other=[];const ex=state.wallet.other.find(s=>s.name.toLowerCase()===a.currency.toLowerCase());if(ex)ex.amount+=amt;else state.wallet.other.push({name:a.currency,amount:amt,valueCpEach:vce});}}
function applyCoinsLost(a){if(!a||!a.amount)return;const amt=Number(a.amount)||0;const cur=(a.currency||'copper').toLowerCase();if(cur==='gold'||cur==='gp')walletSubtract(amt*1000);else if(cur==='silver'||cur==='sp')walletSubtract(amt*100);else if(cur==='copper'||cur==='cp')walletSubtract(amt);else{if(!state.wallet.other)return;const stk=state.wallet.other.find(s=>s.name.toLowerCase()===a.currency.toLowerCase());if(stk){stk.amount=Math.max(0,stk.amount-amt);if(stk.amount===0)state.wallet.other=state.wallet.other.filter(s=>s.amount>0);}}}

function cellKey(x,y){if(state.layer==='interior')return`${state.interiorId}:${x},${y}`;if(state.layer==='settlement')return`${state.settlementId}:${x},${y}`;return`overworld:${x},${y}`;}
function seenSet(){const k=currentSeenKey();if(!state.seen[k])state.seen[k]=new Set();return state.seen[k];}
function currentSeenKey(){if(state.layer==='interior')return state.interiorId;if(state.layer==='settlement')return state.settlementId;return'overworld';}

// ═══════════════════════════════════════════════════
// NPC HELPERS
// ═══════════════════════════════════════════════════
function getNpcState(npcId) {
  if (!state.npcs[npcId]) {
    state.npcs[npcId] = { disposition:0, memory:[], lastSeen:null, tradeStock:null, met:false };
  }
  return state.npcs[npcId];
}

function getNpcDisposition(npcId) {
  const npc = NPC_TEMPLATES[npcId];
  if (!npc) return 0;
  const ns = getNpcState(npcId);
  let disp = ns.disposition;
  const factionRep = state.worldState.reputation[npc.faction] || 0;
  const faction = FACTIONS[npc.faction];
  if (faction) {
    for (const ally of (faction.allies || [])) disp += (state.worldState.reputation[ally] || 0) * 0.3;
    for (const rival of (faction.rivals || [])) disp -= (state.worldState.reputation[rival] || 0) * 0.2;
  }
  return Math.max(-100, Math.min(100, disp + factionRep));
}

function dispositionLabel(disp) {
  if (disp >= 60) return { label:'Devoted',  color:'#a0e878' };
  if (disp >= 30) return { label:'Friendly', color:'#c8e8a0' };
  if (disp >= 10) return { label:'Warm',     color:'#e8d880' };
  if (disp >= -10) return { label:'Neutral',  color:'#a0a090' };
  if (disp >= -30) return { label:'Cool',     color:'#c8a060' };
  if (disp >= -60) return { label:'Hostile',  color:'#d47050' };
  return { label:'Enemies', color:'#e04040' };
}

function getNpcsAtCurrentLocation() {
  const hour = (state.player.day % 1) * 24;
  const present = [];
  for (const [id, tmpl] of Object.entries(NPC_TEMPLATES)) {
    if (tmpl.dynamic) continue;
    for (const slot of tmpl.schedule) {
      if (slot.layer !== state.layer) continue;
      if (slot.settlementId && slot.settlementId !== state.settlementId) continue;
      const active = slot.timeStart < slot.timeEnd
        ? (hour >= slot.timeStart && hour < slot.timeEnd)
        : (hour >= slot.timeStart || hour < slot.timeEnd);
      if (!active) continue;
      if (state.layer === 'interior') {
        if (slot.posKey === state.interiorId) { present.push(id); break; }
      } else if (state.layer === 'settlement') {
        const parts = slot.posKey.split(',');
        if (parts.length === 2) {
          const nx=parseInt(parts[0]), ny=parseInt(parts[1]);
          if (nx === state.pos.x && ny === state.pos.y) { present.push(id); break; }
        }
      } else if (state.layer === 'overworld') {
        present.push(id); break;
      }
    }
  }
  const curKey = cellKey(state.pos.x, state.pos.y);
  for (const [id, ns] of Object.entries(state.npcs)) {
    if (ns.cellKey && ns.cellKey === curKey && NPC_TEMPLATES[id]) {
      if (!present.includes(id)) present.push(id);
    }
  }
  return present;
}

function renderNpcPresence() {
  const npcs = getNpcsAtCurrentLocation();
  const panel = document.getElementById('dnpc-panel-wrap');
  const list = document.getElementById('dnpc-panel');
  if (panel && list) {
    if (npcs.length > 0) {
      panel.style.display = '';
      list.innerHTML = '';
      npcs.forEach(id => {
        const tmpl = NPC_TEMPLATES[id];
        const disp = getNpcDisposition(id);
        const dl = dispositionLabel(disp);
        const row = document.createElement('div');
        row.className = 'dnpc-row';
        row.onclick = () => openNpcDrawer(id);
        row.innerHTML = `
          <div class="dnpc-avatar">${tmpl.emoji}</div>
          <div style="flex:1;min-width:0;">
            <div class="dnpc-name">${tmpl.name}</div>
            <div class="dnpc-loc">${tmpl.role}</div>
          </div>
          <div class="dnpc-rep" style="color:${dl.color};border-color:${dl.color}40;">${dl.label}</div>
        `;
        list.appendChild(row);
      });
    } else {
      panel.style.display = 'none';
    }
  }
  return npcs;
}

function npcPriceFor(npcId, basePriceCp) {
  const disp = getNpcDisposition(npcId);
  const multiplier = 1 - (disp / 100) * 0.25;
  return Math.max(1, Math.round(basePriceCp * multiplier));
}

function renderShopPanel(npcId) {
  const tmpl = NPC_TEMPLATES[npcId];
  if (!tmpl?.trader) return;
  const ns = getNpcState(npcId);
  const stockData = tmpl.trader.stock;
  const panel = document.getElementById('npc-shop-panel');
  const itemsEl = document.getElementById('npc-shop-items');
  panel.classList.add('visible');
  itemsEl.innerHTML = '';

  const buyHeader = document.createElement('div');
  buyHeader.style.cssText = 'font-size:0.62rem;color:var(--stone-light);letter-spacing:0.08em;padding:2px 0 4px;';
  buyHeader.textContent = '— Buy —';
  itemsEl.appendChild(buyHeader);

  stockData.forEach((item) => {
    const currentStock = ns.tradeStock?.[item.name] ?? item.stock;
    if (currentStock <= 0) return;
    const price = npcPriceFor(npcId, item.basePriceCp);
    const canAfford = walletTotalCopper() >= price;
    const row = document.createElement('div');
    row.className = 'shop-item';
    row.innerHTML = `
      <span class="shop-item-name">${item.name}</span>
      <span class="shop-item-price">${formatCopper(price)}</span>
      <button class="shop-buy-btn" ${!canAfford?'disabled':''} onclick="buyFromNpc('${npcId}','${item.name}',${price})">Buy</button>
    `;
    itemsEl.appendChild(row);
  });

  if (state.inventory.length > 0) {
    const sellHeader = document.createElement('div');
    sellHeader.style.cssText = 'font-size:0.62rem;color:var(--stone-light);letter-spacing:0.08em;padding:6px 0 4px;';
    sellHeader.textContent = '— Sell —';
    itemsEl.appendChild(sellHeader);
    state.inventory.forEach((item, idx) => {
      if (!item.valueCp) return;
      const sellPrice = Math.round(item.valueCp * tmpl.trader.buyRate);
      const row = document.createElement('div');
      row.className = 'shop-item';
      row.innerHTML = `
        <span class="shop-item-name">${item.name}</span>
        <span class="shop-item-price">${formatCopper(sellPrice)}</span>
        <button class="shop-sell-btn" onclick="sellToNpc('${npcId}',${idx},${sellPrice})">Sell</button>
      `;
      itemsEl.appendChild(row);
    });
  }
}

function buyFromNpc(npcId, itemName, price) {
  if (walletTotalCopper() < price) return;
  walletSubtract(price);
  const tmpl = NPC_TEMPLATES[npcId];
  const ns = getNpcState(npcId);
  if (!ns.tradeStock) {
    ns.tradeStock = {};
    tmpl.trader.stock.forEach(s => { ns.tradeStock[s.name] = s.stock; });
  }
  if (ns.tradeStock[itemName] !== undefined) ns.tradeStock[itemName] = Math.max(0, ns.tradeStock[itemName] - 1);
  const stockItem = tmpl.trader.stock.find(s => s.name === itemName);
  state.inventory.push({ name: itemName, valueCp: stockItem ? Math.round(stockItem.basePriceCp * 0.7) : price });
  addNpcConvoLine(`You hand over ${formatCopper(price)} for the ${itemName}.`, 'player-said');
  addNpcConvoLine(`${tmpl.name} passes it across with a nod.`, 'npc');
  updateStats(); renderInventory(); renderShopPanel(npcId); saveState();
}

function sellToNpc(npcId, itemIdx, price) {
  const item = state.inventory[itemIdx];
  if (!item) return;
  walletAdd(price);
  state.inventory.splice(itemIdx, 1);
  const tmpl = NPC_TEMPLATES[npcId];
  addNpcConvoLine(`You hand over the ${item.name}. ${tmpl.name} inspects it and counts out ${formatCopper(price)}.`, 'npc');
  updateStats(); renderInventory(); renderShopPanel(npcId); saveState();
}

function toggleShopPanel() {
  const panel = document.getElementById('npc-shop-panel');
  if (panel.classList.contains('visible')) panel.classList.remove('visible');
  else if (npcSession.npcId) renderShopPanel(npcSession.npcId);
}

// ═══════════════════════════════════════════════════
// NPC DIALOGUE
// ═══════════════════════════════════════════════════
function openNpcDrawer(npcId, forced = false) {
  const tmpl = NPC_TEMPLATES[npcId];
  if (!tmpl) return;
  npcSession.npcId = npcId;
  npcSession.history = [];
  npcSession.isOpen = true;
  npcSession.forced = forced;

  document.getElementById('inv-drawer').classList.remove('open');
  document.getElementById('map-drawer').classList.remove('open');
  const purse = document.getElementById('purse-drawer');
  if (purse) purse.style.display = 'none';

  document.getElementById('npc-avatar').textContent = tmpl.emoji;
  document.getElementById('npc-drawer-name').textContent = tmpl.name;
  document.getElementById('npc-drawer-role').textContent = tmpl.role;
  const disp = getNpcDisposition(npcId);
  const dl = dispositionLabel(disp);
  const badge = document.getElementById('npc-rep-badge');
  badge.textContent = dl.label;
  badge.style.color = dl.color;
  badge.style.borderColor = dl.color + '60';

  const shopToggle = document.getElementById('npc-shop-toggle');
  shopToggle.style.display = tmpl.trader ? '' : 'none';
  document.getElementById('npc-shop-panel').classList.remove('visible');
  document.getElementById('npc-convo-box').innerHTML = '';
  document.getElementById('npc-cmd').value = '';
  document.getElementById('npc-drawer').classList.add('open');

  // Hide or show close button depending on forced mode
  const closeBtn = document.getElementById('npc-close');
  if (closeBtn) closeBtn.style.display = forced ? 'none' : '';

  // Block movement while forced conversation is active
  if (forced) {
    state.blockedBy = npcId;
    updateMoveButtons();
  }

  document.getElementById('npc-cmd').focus();
  generateNpcGreeting(npcId, forced);

  // Show fight/flee buttons in forced mode
  const actionBar = document.getElementById('npc-forced-actions');
  if (actionBar) actionBar.style.display = forced ? 'flex' : 'none';
}

function closeNpcDrawer() {
  // If this was a forced conversation, only allow close if the session is being released
  if (npcSession.forced) return;
  npcSession.isOpen = false;
  npcSession.npcId = null;
  npcSession.forced = false;
  document.getElementById('npc-drawer').classList.remove('open');
  document.getElementById('npc-shop-panel').classList.remove('visible');
}

function releaseNpcDrawer() {
  npcSession.forced = false;
  const closeBtn = document.getElementById('npc-close');
  if (closeBtn) closeBtn.style.display = '';
  const actionBar = document.getElementById('npc-forced-actions');
  if (actionBar) actionBar.style.display = 'none';
  if (state.blockedBy === npcSession.npcId) {
    state.blockedBy = null;
    document.getElementById('blocked-notice')?.remove();
    updateMoveButtons();
  }
}

function addNpcConvoLine(text, type='npc') {
  const box = document.getElementById('npc-convo-box');
  const div = document.createElement('div');
  div.className = `npc-line ${type}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function addNpcTyping() {
  const box = document.getElementById('npc-convo-box');
  const div = document.createElement('div');
  div.id = 'npc-typing';
  div.className = 'npc-line npc';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function removeNpcTyping() {
  const t = document.getElementById('npc-typing');
  if (t) t.remove();
}

async function generateNpcGreeting(npcId, forcedOpen = false) {
  const ns = getNpcState(npcId);
  const firstMeet = !ns.met;
  const memSummary = ns.memory.length ? ns.memory.slice(-3).join('; ') : 'no prior history';
  // Mark as met immediately so repeat visits are handled correctly
  ns.met = true;
  saveState();
  addNpcTyping();
  try {
    const res = await fetch(CONFIG.AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        model: CONFIG.TEXT_MODEL,
        max_tokens: 150,
        messages: [
          { role:'system', content: buildNpcSystemPrompt(npcId) },
          { role:'user', content: firstMeet
            ? `You are meeting this player for the FIRST TIME. You have NEVER seen them before. Do NOT act like you know them. Greet them as a complete stranger — cold, neutral, suspicious, or friendly depending on your role and disposition. 1-2 sentences.${forcedOpen ? ' You have stopped them and initiated this conversation.' : ''}`
            : `The player approaches again. Your memory of them: ${memSummary}. Acknowledge based on that history. 1-2 sentences.${forcedOpen ? ' You have stopped them and initiated this conversation.' : ''}`
          }
        ]
      })
    });
    const data = await res.json();
    removeNpcTyping();
    const raw = data.choices?.[0]?.message?.content || '...';
    const speech = raw.split('\n')
      .filter(l => !l.trim().startsWith('JSON:') && !l.trim().startsWith('{'))
      .join('\n').replace(/\{[^}]*"dispositionDelta"[^}]*\}/g,'').replace(/`/g,'').trim();
    addNpcConvoLine(speech, 'npc');
    npcSession.history = [
      { role:'user', content: firstMeet ? 'First meeting greeting' : `Player returns. Memory: ${memSummary}` },
      { role:'assistant', content: raw }
    ];
    ns.lastSeen = state.player.day;
  } catch(e) {
    removeNpcTyping();
    addNpcConvoLine('...', 'npc');
  }
}

function buildNpcSystemPrompt(npcId) {
  const tmpl = NPC_TEMPLATES[npcId];
  const ns = getNpcState(npcId);
  const disp = getNpcDisposition(npcId);
  const dl = dispositionLabel(disp);
  const factionRep = state.worldState.reputation[tmpl.faction] || 0;
  const memStr = ns.memory.length ? ns.memory.slice(-5).join('; ') : 'none';
  const hasTrader = !!tmpl.trader;

  return `You are ${tmpl.name}, ${tmpl.role}, in the world of Valdenmere.
PERSONALITY: ${tmpl.personality}
FACTION: ${FACTIONS[tmpl.faction]?.name || tmpl.faction}. Faction rep with player: ${factionRep > 0 ? '+'+factionRep : factionRep} (${dl.label}).
DISPOSITION toward player: ${disp.toFixed(0)} / 100 (${dl.label}).
YOUR MEMORY of this player: ${memStr}
WORLD: Valdenmere kingdom. Day ${Math.floor(state.player.day)}.
PLAYER WALLET: ${formatWallet()}. Inventory: ${state.inventory.map(i=>i.name).join(', ')||'nothing notable'}.
${hasTrader ? `You are a trader. Mention wares exist — UI shows them separately. Don't list prices in dialogue.` : ''}
RULES:
- Stay in character. Short, vivid responses. 1-3 sentences per turn.
- React to disposition: hostile = curt/suspicious, neutral = businesslike, friendly = warm, devoted = caring.
- Never break character or mention being an AI.
- After your dialogue response, on a NEW LINE output only the JSON metadata (last line, nothing after):
JSON:{"dispositionDelta":N,"memoryNote":"...","npcAction":null}

npcAction options (null in most cases):
- {"type":"combat","reason":"..."} — Attack. Use when: player attacks you, threatens with weapon at disposition < -30, commits crime you witness, deeply provocative act at very low disposition. NOT for mere rudeness.
- {"type":"block","reason":"..."} — Bar path. For guards checking papers, toll collectors, suspicious sentries. Always explain why.
- {"type":"unblock"} — Step aside. Player has satisfied your requirements (paid, showed papers, persuaded you).
- {"type":"flee","reason":"..."} — Player breaks away (says 'leave me alone', 'step aside', 'I'm going', tries to push past). GUARDS and soldiers NEVER allow this — respond with combat instead. Other NPCs may allow it if disposition and situation permit.
- {"type":"force_move","hostile":true|false,"playerRestrained":false,"dest":{"layer":"...","settlementId":"...","interiorId":"...","x":0,"y":0},"reason":"...","narrativeNote":"1 sentence"}
  hostile=false: FRIENDLY escort — player asked to be taken somewhere. Player gets Go/Resist/Decline buttons.
  hostile=true: forced — arrest, ejection, dragged away. No choice given.
  playerRestrained=true: player unconscious or bound — no choice.
  Known interiorIds: ironhaven_inn_south, ironhaven_forge, ironhaven_alchemist, ironhaven_barracks.

GUARD BEHAVIOUR: block on approach → unblock if convinced → combat if attacked OR if player tries to flee/push past → force_move (hostile=true) if arresting.
ESCORT: player asks to be guided → force_move (hostile=false) with natural narrativeNote.`;
}

async function sendNpcMessage() {
  const input = document.getElementById('npc-cmd');
  const text = input.value.trim();
  if (!text || !npcSession.npcId) return;
  input.value = '';
  addNpcConvoLine(text, 'player-said');
  npcSession.history.push({ role:'user', content: text });
  addNpcTyping();
  try {
    const res = await fetch(CONFIG.AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        model: CONFIG.TEXT_MODEL,
        max_tokens: 200,
        messages: [
          { role:'system', content: buildNpcSystemPrompt(npcSession.npcId) },
          ...npcSession.history
        ]
      })
    });
    const data = await res.json();
    removeNpcTyping();
    const raw = data.choices?.[0]?.message?.content || '...';
    const lines = raw.split('\n');
    let jsonLine = '';
    const speechLines = [];
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('JSON:')) jsonLine = t.replace('JSON:','').trim();
      else if (t.startsWith('{') && t.includes('dispositionDelta')) jsonLine = t; // inline JSON
      else speechLines.push(line);
    }
    // Strip any remaining JSON blobs or backticks from speech
    const speech = speechLines.join('\n').replace(/\{[^}]*"dispositionDelta"[^}]*\}/g,'').replace(/`/g,'').trim();
    addNpcConvoLine(speech, 'npc');
    npcSession.history.push({ role:'assistant', content: raw });
    if (npcSession.history.length > 20) npcSession.history = npcSession.history.slice(-20);

    if (jsonLine) {
      try {
        const meta = JSON.parse(jsonLine.replace(/```json|```/g,'').trim());
        const ns = getNpcState(npcSession.npcId);
        if (meta.dispositionDelta) {
          ns.disposition = Math.max(-100, Math.min(100, ns.disposition + meta.dispositionDelta));
          const tmpl = NPC_TEMPLATES[npcSession.npcId];
          const frepDelta = meta.dispositionDelta * 0.1;
          state.worldState.reputation[tmpl.faction] = Math.max(-100, Math.min(100, (state.worldState.reputation[tmpl.faction]||0) + frepDelta));
          const disp = getNpcDisposition(npcSession.npcId);
          const dl = dispositionLabel(disp);
          const badge = document.getElementById('npc-rep-badge');
          badge.textContent = dl.label;
          badge.style.color = dl.color;
          badge.style.borderColor = dl.color + '60';
        }
        if (meta.memoryNote && typeof meta.memoryNote === 'string') {
          ns.memory.push(`Day ${Math.floor(state.player.day)}: ${meta.memoryNote}`);
          if (ns.memory.length > 20) ns.memory = ns.memory.slice(-20);
        }
        if (meta.npcAction) await executeNpcAction(meta.npcAction, npcSession.npcId);
      } catch(e) {}
    }
    renderNpcPresence();
    saveState();
  } catch(e) {
    removeNpcTyping();
    addNpcConvoLine('...', 'npc');
  }
}

async function executeNpcAction(action, npcId) {
  if (!action || !action.type) return;
  const tmpl = NPC_TEMPLATES[npcId];
  const npcName = tmpl?.name || 'them';
  switch (action.type) {
    case 'combat': {
      releaseNpcDrawer();
      closeNpcDrawer();
      npcSession.isOpen = false;
      npcSession.npcId = null;
      addMessage(`${npcName} is done talking.`, 'transition');
      const combatMsg = `${npcName} attacks! ${action.reason || ''}`;
      state.history.push({ role:'assistant', content:`SITUATION: ${combatMsg}\nJSON: {"hasCombat":true,"enemy":"${npcName}","hpDelta":-5,"combatActions":[{"label":"Strike back","action":"Strike back"},{"label":"Defend yourself","action":"Defend yourself"},{"label":"Try to flee","action":"Try to flee"}],"factionRepChanges":{},"npcSpawn":null}` });
      addMessage(combatMsg, 'combat');
      setCombatMode(true, npcName, [
        { label:'Strike back', action:'Strike back' },
        { label:'Defend yourself', action:'Defend yourself' },
        { label:'Try to flee', action:'Try to flee' }
      ]);
      state.player.hp = Math.max(0, state.player.hp - 5);
      updateStats();
      break;
    }
    case 'flee': {
      // Player successfully flees a forced conversation
      releaseNpcDrawer();
      npcSession.isOpen = false;
      npcSession.npcId = null;
      document.getElementById('npc-drawer').classList.remove('open');
      document.getElementById('npc-shop-panel').classList.remove('visible');
      addMessage(`You break away from ${npcName} and slip off.`, 'transition');
      break;
    }
    case 'block': {
      state.blockedBy = npcId;
      updateMoveButtons();
      const box = document.getElementById('scene-box');
      const div = document.createElement('div');
      div.id = 'blocked-notice';
      div.style.cssText = 'font-size:0.75rem;color:#d4805a;font-style:italic;text-align:center;padding:4px 0;animation:fadeIn 0.3s ease;';
      div.textContent = `⛔ ${npcName} is blocking your path. ${action.reason || ''}`;
      document.getElementById('blocked-notice')?.remove();
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
      break;
    }
    case 'unblock': {
      releaseNpcDrawer();
      if (state.blockedBy === npcId) {
        state.blockedBy = null;
        updateMoveButtons();
        document.getElementById('blocked-notice')?.remove();
        addMessage(`${npcName} steps aside.`, 'transition');
      }
      break;
    }
    case 'force_move': {
      const hostile = action.hostile !== false; // default hostile=true unless explicitly false
      if (!hostile && !action.playerRestrained) {
        // Friendly escort — offer player a choice
        const dest = action.dest || {};
        const reason = action.narrativeNote || `${npcName} offers to take you there.`;
        addNpcConvoLine(reason, 'npc');
        // Render choice buttons inside the NPC drawer
        const box = document.getElementById('npc-convo-box');
        const btnWrap = document.createElement('div');
        btnWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin:8px 0;';
        btnWrap.innerHTML = `
          <button class="npc-choice-btn" onclick="acceptEscort('${npcId}', ${JSON.stringify(dest).replace(/"/g,'&quot;')}, '${(action.narrativeNote||'').replace(/'/g,"&#39;")}')" style="background:rgba(160,200,120,0.12);border:1px solid rgba(160,200,120,0.4);color:#a0c878;font-family:'Crimson Pro',serif;font-size:0.9rem;padding:8px 12px;border-radius:3px;cursor:pointer;text-align:left;">✓ Go with ${npcName}</button>
          <button class="npc-choice-btn" onclick="resistEscort('${npcId}')" style="background:rgba(212,128,90,0.1);border:1px solid rgba(212,128,90,0.4);color:#d4805a;font-family:'Crimson Pro',serif;font-size:0.9rem;padding:8px 12px;border-radius:3px;cursor:pointer;text-align:left;">⚔ Resist</button>
          <button class="npc-choice-btn" onclick="declineEscort('${npcId}')" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:var(--stone-light);font-family:'Crimson Pro',serif;font-size:0.9rem;padding:8px 12px;border-radius:3px;cursor:pointer;text-align:left;">✗ Decline</button>
        `;
        box.appendChild(btnWrap);
        box.scrollTop = box.scrollHeight;
        // Store pending dest for acceptEscort
        npcSession.pendingDest = dest;
      } else {
        // Hostile / player restrained — just move them
        releaseNpcDrawer();
        npcSession.isOpen = false;
        npcSession.npcId = null;
        document.getElementById('npc-drawer').classList.remove('open');
        if (action.narrativeNote) addMessage(action.narrativeNote, 'transition');
        else addMessage(`${npcName} forces you to move.`, 'transition');
        await new Promise(r => setTimeout(r, 600));
        const dest = action.dest || {};
        state.blockedBy = null;
        document.getElementById('blocked-notice')?.remove();
        await doLayerMove(dest);
      }
      break;
    }
  }
}

async function acceptEscort(npcId, dest, narrativeNote) {
  document.querySelectorAll('.npc-choice-btn').forEach(b => b.remove());
  releaseNpcDrawer();
  npcSession.isOpen = false;
  npcSession.npcId = null;
  document.getElementById('npc-drawer').classList.remove('open');
  if (narrativeNote) addMessage(narrativeNote, 'transition');
  await new Promise(r => setTimeout(r, 600));
  state.blockedBy = null;
  document.getElementById('blocked-notice')?.remove();
  await doLayerMove(dest);
}

function resistEscort(npcId) {
  document.querySelectorAll('.npc-choice-btn').forEach(b => b.remove());
  const tmpl = NPC_TEMPLATES[npcId];
  const npcName = tmpl?.name || 'them';
  addNpcConvoLine(`${npcName} doesn't take kindly to that.`, 'npc');
  // Trigger combat via the normal NPC action path
  executeNpcAction({ type:'combat', reason:'They resist your escort.' }, npcId);
}

function declineEscort(npcId) {
  document.querySelectorAll('.npc-choice-btn').forEach(b => b.remove());
  releaseNpcDrawer();
  addNpcConvoLine('Very well.', 'npc');
}

function npcForcedFight() {
  const npcId = npcSession.npcId;
  if (!npcId) return;
  const tmpl = NPC_TEMPLATES[npcId];
  addNpcConvoLine(`*You go for ${tmpl?.name || 'them'}*`, 'player-said');
  executeNpcAction({ type: 'combat', reason: 'Player initiated attack.' }, npcId);
}

function npcForcedFlee() {
  const npcId = npcSession.npcId;
  if (!npcId) return;
  // Send as a message so the NPC can react — guard will escalate to combat
  document.getElementById('npc-cmd').value = '*I try to push past and flee*';
  sendNpcMessage();
}

async function doLayerMove(dest) {
  if (dest.layer === 'interior' && (dest.interiorId || dest.id)) {
    const id = dest.interiorId || dest.id;
    await enterInterior(id, { x: dest.x ?? 1, y: dest.y ?? 1 });
  } else if (dest.layer === 'settlement' && (dest.settlementId || dest.id)) {
    const sid = dest.settlementId || dest.id;
    if (SETTLEMENTS[sid]) await enterSettlement(sid);
  } else if (dest.layer === 'overworld') {
    if (typeof dest.x === 'number' && typeof dest.y === 'number') {
      state.layer = 'overworld'; state.settlementId = null; state.interiorId = null;
      state.layerHistory = []; updateLayerBadge(); await enterCell(dest.x, dest.y);
    }
  } else { await exitLayer(); }
}


// ═══════════════════════════════════════════════════
// STORAGE — SUPABASE + LOCALSTORAGE FALLBACK
// ═══════════════════════════════════════════════════
async function saveState() {
  // Always save to localStorage as fast local backup
  const seenSer = {};
  for (const [k,v] of Object.entries(state.seen)) seenSer[k] = [...v];
  const localData = JSON.stringify({
    layer:state.layer, settlementId:state.settlementId, interiorId:state.interiorId,
    layerHistory:state.layerHistory, cells:state.cells, seen:seenSer,
    player:state.player, wallet:state.wallet, inventory:state.inventory,
    inventoryOverloaded:state.inventoryOverloaded, equipped:state.equipped,
    skills:state.skills, worldState:state.worldState, npcs:state.npcs,
    pos:state.pos, lastOverworldPos:state.lastOverworldPos, blockedBy:state.blockedBy
  });
  try { localStorage.setItem('valdenmere-state', localData); } catch(e) {}

  // Also save to Supabase (non-blocking)
  if (CONFIG.ENABLE_SUPABASE) {
    DB.savePlayer({
      layer: state.layer, settlement_id: state.settlementId, interior_id: state.interiorId,
      pos_x: state.pos.x, pos_y: state.pos.y,
      last_overworld_x: state.lastOverworldPos.x, last_overworld_y: state.lastOverworldPos.y,
      player: state.player, wallet: state.wallet, inventory: state.inventory,
      equipped: state.equipped, skills: state.skills, world_state: state.worldState,
      layer_history: state.layerHistory, blocked_by: state.blockedBy,
      meta: { npcs: state.npcs }
    }).catch(() => {});
  }
}

async function loadState() {
  // Try Supabase first, fall back to localStorage
  if (CONFIG.ENABLE_SUPABASE) {
    const row = await DB.loadPlayer();
    if (row) {
      state.layer = row.layer || 'overworld';
      state.settlementId = row.settlement_id || null;
      state.interiorId = row.interior_id || null;
      state.layerHistory = row.layer_history || [];
      state.pos = { x: row.pos_x || 0, y: row.pos_y || 0 };
      state.lastOverworldPos = { x: row.last_overworld_x || 0, y: row.last_overworld_y || 0 };
      state.player = { ...state.player, ...(row.player || {}) };
      state.wallet = { other: [], ...state.wallet, ...(row.wallet || {}) };
      state.inventory = row.inventory || [];
      state.equipped = { ...state.equipped, ...(row.equipped || {}) };
      state.skills = row.skills || {};
      state.worldState = { ...state.worldState, ...(row.world_state || {}) };
      state.blockedBy = row.blocked_by || null;
      if (row.npcs) state.npcs = row.npcs;
      // Cells still from localStorage (large data)
      const raw = localStorage.getItem('valdenmere-state');
      if (raw) {
        const s = JSON.parse(raw);
        state.cells = s.cells || {};
        state.seen = {};
        if (s.seen) for (const [k,v] of Object.entries(s.seen)) state.seen[k] = new Set(v);
      }
      return true;
    }
  }
  // localStorage fallback
  try {
    const raw = localStorage.getItem('valdenmere-state');
    if (raw) {
      const s = JSON.parse(raw);
      state.layer = s.layer || 'overworld';
      state.settlementId = s.settlementId || null;
      state.interiorId = s.interiorId || null;
      state.layerHistory = s.layerHistory || [];
      state.cells = s.cells || {};
      state.seen = {};
      if (s.seen) for (const [k,v] of Object.entries(s.seen)) state.seen[k] = new Set(v);
      state.player = { ...state.player, ...s.player };
      state.wallet = { other: [], ...state.wallet, ...(s.wallet || {}) };
      if (s.player?.gold && !s.wallet) state.wallet.gold = s.player.gold;
      state.inventory = s.inventory || [];
      state.inventoryOverloaded = s.inventoryOverloaded || false;
      state.equipped = { ...state.equipped, ...(s.equipped || {}) };
      state.skills = s.skills || {};
      state.worldState = { ...state.worldState, ...s.worldState };
      state.npcs = s.npcs || {};
      state.pos = s.pos || { x:0, y:0 };
      state.lastOverworldPos = s.lastOverworldPos || { ...state.pos };
      state.blockedBy = s.blockedBy || null;
      return true;
    }
  } catch(e) {}
  return false;
}

// ═══════════════════════════════════════════════════
// TERRAIN / MAP HELPERS
// ═══════════════════════════════════════════════════
function getCellMeta(x,y){if(state.layer==='settlement'){const s=SETTLEMENTS[state.settlementId];return s?.map[`${x},${y}`]||{type:T.COURTYARD,name:''};}if(state.layer==='interior')return{type:T.INTERIOR,name:''};return WORLD_META[`${x},${y}`]||{type:T.PLAINS,name:''};}
function terrainLabel(type){return{ocean:'Ocean',plains:'Plains',forest:'Forest',mountain:'Mountains',city:'City',town:'Town',village:'Village',road:'Road',farmland:'Farmland',river:'River',street:'Street',building:'Building',door:'Doorway',wall:'Wall',courtyard:'Courtyard',market:'Market',docks:'Docks',gate:'Gate',interior:'Interior'}[type]||'Wilderness';}
function getNeighbourMeta(x,y){return{n:getCellMeta(x,y-1),s:getCellMeta(x,y+1),e:getCellMeta(x+1,y),w:getCellMeta(x-1,y)};}
function isTraversable(type){return type!==T.OCEAN&&type!==T.WALL&&type!==T.BUILDING;}

// ═══════════════════════════════════════════════════
// LAYER TRANSITIONS
// ═══════════════════════════════════════════════════
let _suppressTransitions=false, _inTransition=false;

function getCellTransition(x,y){if(_suppressTransitions)return null;if(state.layer==='overworld'){const sid=OVERWORLD_TO_SETTLEMENT[`${x},${y}`];if(sid&&SETTLEMENTS[sid])return{type:'enter_settlement',id:sid};return null;}if(state.layer==='settlement'){const cell=SETTLEMENTS[state.settlementId]?.map[`${x},${y}`];if(cell?.enter)return{type:'enter_interior',...cell.enter};return null;}return null;}

async function enterSettlement(id){const s=SETTLEMENTS[id];if(!s)return;state.layerHistory.push({layer:state.layer,settlementId:state.settlementId,interiorId:state.interiorId,pos:{...state.lastOverworldPos}});state.layer='settlement';state.settlementId=id;state.interiorId=null;state.pos={...s.entryPos};addMessage(`You pass through the gates of ${s.name}.`,'transition');updateLayerBadge();_suppressTransitions=true;_inTransition=true;await enterCell(state.pos.x,state.pos.y);_inTransition=false;_suppressTransitions=false;await saveState();}
async function enterInterior(id,ep){state.layerHistory.push({layer:state.layer,settlementId:state.settlementId,interiorId:state.interiorId,pos:{...state.pos}});state.layer='interior';state.interiorId=id;state.pos={...ep}||{x:1,y:1};const dc=state.cells[`${state.layerHistory[state.layerHistory.length-1]?.settlementId}:${state.layerHistory[state.layerHistory.length-1]?.pos?.x},${state.layerHistory[state.layerHistory.length-1]?.pos?.y}`];addMessage(`You step inside ${dc?.locationName||'the building'}.`,'transition');updateLayerBadge();_suppressTransitions=true;_inTransition=true;await enterCell(state.pos.x,state.pos.y);_inTransition=false;_suppressTransitions=false;await saveState();}
async function exitLayer(){if(state.layerHistory.length===0)return;if(npcSession.isOpen)closeNpcDrawer();state.blockedBy=null;document.getElementById('blocked-notice')?.remove();const prev=state.layerHistory.pop();if(state.layer==='interior')addMessage(`You step back outside.`,'transition');else if(state.layer==='settlement')addMessage(`You pass back through the gates of ${SETTLEMENTS[state.settlementId]?.name||'the settlement'}.`,'transition');state.layer=prev.layer;state.settlementId=prev.settlementId;state.interiorId=prev.interiorId;state.pos={...prev.pos};updateLayerBadge();_suppressTransitions=true;_inTransition=true;await enterCell(state.pos.x,state.pos.y);_inTransition=false;_suppressTransitions=false;await saveState();}
function handleCentreBtn(){if(state.layer!=='overworld')exitLayer();}
function updateLayerBadge(){const badge=document.getElementById('layer-badge'),mt=document.getElementById('map-panel-title'),dt=document.getElementById('map-drawer-title');if(state.layer==='overworld'){badge.className='layer-badge overworld';badge.textContent='';badge.style.display='none';if(mt)mt.textContent='— Known World —';if(dt)dt.textContent='— Known World —';}else if(state.layer==='settlement'){const name=SETTLEMENTS[state.settlementId]?.name||state.settlementId;badge.className='layer-badge settlement';badge.textContent=name;badge.style.display='';if(mt)mt.textContent=`— ${name} —`;if(dt)dt.textContent=`— ${name} —`;}else{badge.className='layer-badge interior';badge.textContent='Interior';badge.style.display='';if(mt)mt.textContent='— Interior —';if(dt)dt.textContent='— Interior —';}const dot=document.getElementById('btn-center-dot'),ex=document.getElementById('btn-center-exit'),cb=document.getElementById('btn-center');if(state.layer!=='overworld'){dot.style.display='none';ex.style.display='block';cb.classList.add('exit-btn');}else{dot.style.display='block';ex.style.display='none';cb.classList.remove('exit-btn');}}


// ═══════════════════════════════════════════════════
// CANVAS MAP
// ═══════════════════════════════════════════════════
const CELL_PX=16;
const TERRAIN_HEX={ocean:'#1a2d3a',plains:'#3a4a2a',forest:'#1e3a1e',mountain:'#4a4040',city:'#6a5030',town:'#5a4525',village:'#4a3a20',road:'#3a4a2a',farmland:'#4a4a20',river:'#3a4a2a',unknown:'#181410',street:'#4a3e30',building:'#5a3a20',door:'#7a5030',wall:'#3a3030',courtyard:'#3a4228',market:'#5a4a28',docks:'#2a3a4a',gate:'#6a5540',interior:'#3a2a18'};
let mapView={x:0,y:0,scale:1,travelTarget:null};
function getVisibleCellMeta(cx,cy){if(state.layer==='settlement'){const s=SETTLEMENTS[state.settlementId];return s?.map[`${cx},${cy}`]||{type:T.COURTYARD,name:''};}if(state.layer==='interior')return{type:T.INTERIOR,name:''};return WORLD_META[`${cx},${cy}`]||{type:T.PLAINS,name:''};}
function drawMapCanvas(){const canvas=document.getElementById('map-canvas');if(!canvas)return;const hEl=document.getElementById('map-drawer-header'),lEl=document.getElementById('map-legend');const hH=hEl?hEl.offsetHeight:44,lH=lEl?lEl.offsetHeight:32;const W=window.innerWidth,H=window.innerHeight-hH-lH;if(W<10||H<10)return;if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;canvas.style.width=W+'px';canvas.style.height=H+'px';}
const ctx=canvas.getContext('2d');ctx.clearRect(0,0,W,H);const cs=CELL_PX*mapView.scale;const{x:px,y:py}=state.pos;const ox=W/2-(px*cs)+mapView.x,oy=H/2-(py*cs)+mapView.y;const x0=Math.floor(-ox/cs)-2,y0=Math.floor(-oy/cs)-2,x1=Math.floor((W-ox)/cs)+2,y1=Math.floor((H-oy)/cs)+2;const lt=new Set();const ss=seenSet();
for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){try{const key=cellKey(cx,cy);const meta=getVisibleCellMeta(cx,cy);const visited=!!state.cells[key],seen=ss.has(`${cx},${cy}`),isCurrent=cx===px&&cy===py;const sx=ox+cx*cs,sy=oy+cy*cs;const isLinear=meta.type==='road'||meta.type==='river';const bgType=isLinear?'plains':meta.type;ctx.globalAlpha=1;ctx.fillStyle=TERRAIN_HEX[bgType]||TERRAIN_HEX.unknown;ctx.fillRect(sx,sy,cs-1,cs-1);ctx.globalAlpha=1;
if(isLinear){ctx.globalAlpha=0.9;const fn=meta.type==='river'?isRiverType:isRoadType;const conn=getConnectionsAt(cx,cy,fn);const cc=cs/2;ctx.strokeStyle=meta.type==='river'?'#5aaad4':'#c8a878';ctx.lineWidth=meta.type==='river'?cs*0.22:cs*0.16;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();const{n,s,e,w}=conn;const cnt=[n,s,e,w].filter(Boolean).length;if(cnt>0){if(n&&s&&!e&&!w){ctx.moveTo(sx+cc,sy);ctx.lineTo(sx+cc,sy+cs);}else if(e&&w&&!n&&!s){ctx.moveTo(sx,sy+cc);ctx.lineTo(sx+cs,sy+cc);}else if(n&&e&&!s&&!w){ctx.moveTo(sx+cc,sy);ctx.bezierCurveTo(sx+cc,sy+cc*0.2,sx+cs-cc*0.2,sy+cc,sx+cs,sy+cc);}else if(n&&w&&!s&&!e){ctx.moveTo(sx+cc,sy);ctx.bezierCurveTo(sx+cc,sy+cc*0.2,sx+cc*0.2,sy+cc,sx,sy+cc);}else if(s&&e&&!n&&!w){ctx.moveTo(sx+cc,sy+cs);ctx.bezierCurveTo(sx+cc,sy+cs-cc*0.2,sx+cs-cc*0.2,sy+cc,sx+cs,sy+cc);}else if(s&&w&&!n&&!e){ctx.moveTo(sx+cc,sy+cs);ctx.bezierCurveTo(sx+cc,sy+cs-cc*0.2,sx+cc*0.2,sy+cc,sx,sy+cc);}else{if(n||s){ctx.moveTo(sx+cc,n?sy:sy+cc);ctx.lineTo(sx+cc,s?sy+cs:sy+cc);}if(e||w){ctx.moveTo(w?sx:sx+cc,sy+cc);ctx.lineTo(e?sx+cs:sx+cc,sy+cc);}}ctx.stroke();}ctx.globalAlpha=1;}
if(meta.type===T.DOOR||meta.type===T.GATE){ctx.globalAlpha=0.8;ctx.fillStyle='#e8b84b';ctx.fillRect(sx+cs*0.35,sy+cs*0.35,cs*0.3,cs*0.3);ctx.globalAlpha=1;}
if(mapView.travelTarget&&mapView.travelTarget.x===cx&&mapView.travelTarget.y===cy){ctx.strokeStyle='#e8b84b';ctx.lineWidth=2;ctx.strokeRect(sx+1,sy+1,cs-3,cs-3);}
if(isCurrent){const cc=cs/2;ctx.beginPath();ctx.arc(sx+cc,sy+cc,cs*0.22,0,Math.PI*2);ctx.fillStyle='#e8b84b';ctx.shadowColor='#e8b84b';ctx.shadowBlur=cs*0.5;ctx.fill();ctx.shadowBlur=0;}
lt.add(meta.type);}catch(e){}}
const leg=document.getElementById('map-legend');if(leg){leg.innerHTML='';lt.forEach(t=>leg.innerHTML+=`<div class="leg-item"><div class="leg-swatch t-${t==='road'||t==='river'?'plains':t}"></div>${terrainLabel(t)}</div>`);}}

let mapDrag={active:false,startX:0,startY:0,startMapX:0,startMapY:0},mapPinch={active:false,startDist:0,startScale:1},mapInteractionInit=false;
function initMapInteraction(){if(mapInteractionInit)return;mapInteractionInit=true;const canvas=document.getElementById('map-canvas');if(!canvas)return;canvas.addEventListener('touchstart',e=>{e.preventDefault();if(e.touches.length===2){mapPinch.active=true;mapDrag.active=false;mapPinch.startDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);mapPinch.startScale=mapView.scale;}else if(e.touches.length===1){mapDrag.active=true;mapPinch.active=false;mapDrag.startX=e.touches[0].clientX;mapDrag.startY=e.touches[0].clientY;mapDrag.startMapX=mapView.x;mapDrag.startMapY=mapView.y;mapDrag.moved=false;}},{passive:false});
canvas.addEventListener('touchmove',e=>{e.preventDefault();if(mapPinch.active&&e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);mapView.scale=Math.max(0.5,Math.min(4,mapPinch.startScale*(d/mapPinch.startDist)));drawMapCanvas();}else if(mapDrag.active&&e.touches.length===1){const dx=e.touches[0].clientX-mapDrag.startX,dy=e.touches[0].clientY-mapDrag.startY;if(Math.abs(dx)>3||Math.abs(dy)>3)mapDrag.moved=true;mapView.x=mapDrag.startMapX+dx;mapView.y=mapDrag.startMapY+dy;drawMapCanvas();}},{passive:false});
canvas.addEventListener('touchend',e=>{if(mapDrag.active&&!mapDrag.moved&&e.changedTouches.length===1)handleMapTap(e.changedTouches[0].clientX,e.changedTouches[0].clientY);mapDrag.active=false;mapPinch.active=false;},{passive:false});
canvas.addEventListener('mousedown',e=>{mapDrag.active=true;mapDrag.startX=e.clientX;mapDrag.startY=e.clientY;mapDrag.startMapX=mapView.x;mapDrag.startMapY=mapView.y;mapDrag.moved=false;});canvas.addEventListener('mousemove',e=>{if(!mapDrag.active)return;const dx=e.clientX-mapDrag.startX,dy=e.clientY-mapDrag.startY;if(Math.abs(dx)>3||Math.abs(dy)>3)mapDrag.moved=true;mapView.x=mapDrag.startMapX+dx;mapView.y=mapDrag.startMapY+dy;drawMapCanvas();});canvas.addEventListener('mouseup',e=>{if(mapDrag.active&&!mapDrag.moved)handleMapTap(e.clientX,e.clientY);mapDrag.active=false;});canvas.addEventListener('wheel',e=>{e.preventDefault();const d=e.deltaY>0?0.9:1.1;mapView.scale=Math.max(0.5,Math.min(4,mapView.scale*d));drawMapCanvas();},{passive:false});}

function handleMapTap(cx,cy){const canvas=document.getElementById('map-canvas');const rect=canvas.getBoundingClientRect();const W=rect.width,H=rect.height;const cs=CELL_PX*mapView.scale;const{x:px,y:py}=state.pos;const ox=W/2-(px*cs)+mapView.x,oy=H/2-(py*cs)+mapView.y;const x=Math.floor((cx-rect.left-ox)/cs),y=Math.floor((cy-rect.top-oy)/cs);const key=cellKey(x,y);if(x===px&&y===py)return;const meta=getVisibleCellMeta(x,y);if(!isTraversable(meta.type))return;if(state.layer!=='overworld')return;const steps=Math.abs(x-px)+Math.abs(y-py);const ec=Math.round((1-Math.pow(0.995,steps))*100);mapView.travelTarget={x,y};drawMapCanvas();document.getElementById('map-travel-dest').textContent=state.cells[key]?.locationName||meta.name||terrainLabel(meta.type);document.getElementById('map-travel-info').textContent=`~${steps} steps · ${ec}% chance of encounter`;document.getElementById('map-travel-go').onclick=()=>startQuickTravel(x,y);document.getElementById('map-travel-confirm').classList.add('visible');}
function cancelTravel(){mapView.travelTarget=null;document.getElementById('map-travel-confirm').classList.remove('visible');drawMapCanvas();}
async function startQuickTravel(dx,dy){document.getElementById('map-travel-confirm').classList.remove('visible');toggleMap();const{x:sx,y:sy}=state.pos;mapView.travelTarget=null;const path=[];let cx=sx,cy=sy;while(cx!==dx||cy!==dy){if(cx!==dx)cx+=cx<dx?1:-1;else if(cy!==dy)cy+=cy<dy?1:-1;path.push({x:cx,y:cy});}addMessage(`You set off toward ${state.cells[cellKey(dx,dy)]?.locationName||terrainLabel(getVisibleCellMeta(dx,dy).type)}...`,'system');for(let i=0;i<path.length;i++){const step=path[i];const meta=getVisibleCellMeta(step.x,step.y);if(!isTraversable(meta.type)){addMessage('Your path is blocked. You stop here.','system');await enterCell(path[i-1]?.x??sx,path[i-1]?.y??sy);return;}state.player.day+=0.05;state.player.stamina=Math.min(state.player.maxStamina,state.player.stamina+1);state.pos={x:step.x,y:step.y};const ss2=seenSet();for(let dy2=-FOV_RADIUS;dy2<=FOV_RADIUS;dy2++)for(let dx2=-FOV_RADIUS;dx2<=FOV_RADIUS;dx2++)ss2.add(`${step.x+dx2},${step.y+dy2}`);if(Math.random()<0.005){addMessage(`Something catches your attention after ${i+1} step${i>0?'s':''}...`,'system');await enterCell(step.x,step.y);return;}}await enterCell(dx,dy);}

const FOV_RADIUS=2,MAP_VIEW=9;
function renderMinimapInto(mapEl,legEl,vr){if(!mapEl)return;const size=vr*2+1;mapEl.style.gridTemplateColumns=`repeat(${size}, 13px)`;mapEl.innerHTML='';const{x:px,y:py}=state.pos;const ss=seenSet();const shown=new Set();
// Render north (lower y) at top: iterate dy from -vr (north) to +vr (south)
for(let dy=-vr;dy<=vr;dy++)for(let dx=-vr;dx<=vr;dx++){const cx=px+dx,cy=py+dy;const key=cellKey(cx,cy);const meta=getVisibleCellMeta(cx,cy);const visited=!!state.cells[key],isCurrent=dx===0&&dy===0,seen=ss.has(`${cx},${cy}`),revealed=visited||isCurrent||seen;const isLinear=meta.type==='road'||meta.type==='river';const cell=document.createElement('div');cell.className=`mmc t-${isLinear?'plains':meta.type}`;if(isCurrent)cell.classList.add('current');if(revealed&&isLinear){const s=makeCellSVG(cx,cy,meta.type);if(s)cell.appendChild(s);}if(revealed&&(meta.type===T.DOOR||meta.type===T.GATE)){const dot=document.createElement('div');dot.style.cssText='position:absolute;inset:3px;background:rgba(232,184,75,0.7);border-radius:50%;';cell.appendChild(dot);}mapEl.appendChild(cell);if(revealed)shown.add(meta.type);}if(legEl){legEl.innerHTML='';shown.forEach(t=>legEl.innerHTML+=`<div class="leg-item"><div class="leg-swatch t-${t}"></div>${terrainLabel(t)}</div>`);}}
function renderMinimap(){renderMinimapInto(document.getElementById('minimap-desktop'),document.getElementById('legend-desktop'),7);if(document.getElementById('map-drawer').classList.contains('open'))drawMapCanvas();}
function toggleMap(){const d=document.getElementById('map-drawer');const o=d.classList.toggle('open');if(o){mapView.x=0;mapView.y=0;cancelTravel();requestAnimationFrame(()=>requestAnimationFrame(()=>{initMapInteraction();drawMapCanvas();}));}}

// SVG road/river rendering
function isRoadType(t){return t==='road';}function isRiverType(t){return t==='river';}
function getConnectionsAt(x,y,fn){function typeAt(cx,cy){if(state.layer==='settlement')return SETTLEMENTS[state.settlementId]?.map[`${cx},${cy}`]?.type||T.COURTYARD;return(WORLD_META[`${cx},${cy}`]||{}).type||T.PLAINS;}return{n:fn(typeAt(x,y-1)),s:fn(typeAt(x,y+1)),e:fn(typeAt(x+1,y)),w:fn(typeAt(x-1,y))};}
function buildPathSVG(conn,S){const c=S/2,t=S*0.1;const{n,s,e,w}=conn;const cnt=[n,s,e,w].filter(Boolean).length;if(cnt===0)return'';if(n&&s&&!e&&!w)return`M${c},0 L${c},${S}`;if(e&&w&&!n&&!s)return`M0,${c} L${S},${c}`;if(cnt===1){if(n)return`M${c},0 L${c},${c}`;if(s)return`M${c},${S} L${c},${c}`;if(e)return`M${S},${c} L${c},${c}`;if(w)return`M0,${c} L${c},${c}`;}if(n&&e&&!s&&!w)return`M${c},0 C${c},${c-t} ${S-t},${c} ${S},${c}`;if(n&&w&&!s&&!e)return`M${c},0 C${c},${c-t} ${t},${c} 0,${c}`;if(s&&e&&!n&&!w)return`M${c},${S} C${c},${S-t+t*2} ${S-t},${c} ${S},${c}`;if(s&&w&&!n&&!e)return`M${c},${S} C${c},${S-t+t*2} ${t},${c} 0,${c}`;if(n&&s&&e&&!w)return`M${c},0 L${c},${S} M${c},${c} C${c+t},${c} ${S-t},${c} ${S},${c}`;if(n&&s&&w&&!e)return`M${c},0 L${c},${S} M${c},${c} C${c-t},${c} ${t},${c} 0,${c}`;if(e&&w&&n&&!s)return`M0,${c} L${S},${c} M${c},${c} C${c},${c-t} ${c},${t} ${c},0`;if(e&&w&&s&&!n)return`M0,${c} L${S},${c} M${c},${c} C${c},${c+t} ${c},${S-t} ${c},${S}`;if(n&&s&&e&&w)return`M${c},0 L${c},${S} M0,${c} L${S},${c}`;return'';}
function makeCellSVG(x,y,type){const isR=type==='river';const fn=isR?isRiverType:isRoadType;const conn=getConnectionsAt(x,y,fn);const pd=buildPathSVG(conn,100);if(!pd)return null;const color=isR?'#5aaad4':'#c8a878';const w=isR?22:16;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('style','position:absolute;inset:0;width:100%;height:100%;display:block;');svg.className.baseVal='tile-svg';const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',pd);path.setAttribute('stroke',color);path.setAttribute('stroke-width',String(w));path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');path.setAttribute('fill','none');svg.appendChild(path);return svg;}

function updateMoveButtons(){const{x,y}=state.pos;const centre=document.getElementById('btn-center');if(centre){const cm=getCellMeta(x,y);centre.style.background=TERRAIN_HEX[cm.type]||TERRAIN_HEX.unknown;const os=centre.querySelector('svg.tile-svg');if(os)os.remove();if(cm.type==='road'||cm.type==='river'){const s=makeCellSVG(x,y,cm.type);if(s)centre.insertBefore(s,centre.firstChild);}}
const isBlocked=!!state.blockedBy;
const dirs={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0],ne:[1,-1],nw:[-1,-1],se:[1,1],sw:[-1,1]};for(const[d,[dx,dy]]of Object.entries(dirs)){const btn=document.getElementById(`btn-${d}`);if(!btn)continue;const nx=x+dx,ny=y+dy;const wm=getCellMeta(nx,ny);btn.disabled=!isTraversable(wm.type)||state.inCombat||isBlocked;const os=btn.querySelector('svg.tile-svg');if(os)os.remove();btn.style.background=TERRAIN_HEX[wm.type]||TERRAIN_HEX.unknown;if(wm.type==='road'||wm.type==='river'){const s=makeCellSVG(nx,ny,wm.type);if(s)btn.insertBefore(s,btn.firstChild);}}}


// ═══════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════
function addMessage(text,cls='scene',header=''){const box=document.getElementById('scene-box');const div=document.createElement('div');div.className=`message ${cls}`;if(header)div.innerHTML=`<div class="scene-header">${header}</div>`;div.innerHTML+=(text||'').replace(/\n/g,'<br>');if(box.style.backgroundImage){div.style.background='rgba(10,8,6,0.55)';div.style.borderRadius='3px';div.style.padding='6px 10px';}if(_textHidden)div.style.display='none';box.appendChild(div);box.scrollTop=box.scrollHeight;}
function addZones(locationName,location,situation,notice){const box=document.getElementById('scene-box');const hasBg=!!box.style.backgroundImage;const mkStyle=()=>hasBg?'background:rgba(10,8,6,0.55);border-radius:3px;padding:6px 10px;':'';if(location){const d=document.createElement('div');d.className='message location';d.innerHTML=`<div class="scene-header">${locationName}</div>${location}`;d.style.cssText=mkStyle();d.style.animation='fadeIn 0.35s ease';if(_textHidden)d.style.display='none';box.appendChild(d);}if(situation){const d=document.createElement('div');d.className='message situation';d.textContent=situation;d.style.cssText=mkStyle();d.style.animation='fadeIn 0.35s ease 0.1s both';if(_textHidden)d.style.display='none';box.appendChild(d);}if(notice){const d=document.createElement('div');d.className='message notice';d.textContent=notice;d.style.cssText=mkStyle();d.style.animation='fadeIn 0.35s ease 0.2s both';if(_textHidden)d.style.display='none';box.appendChild(d);}box.scrollTop=box.scrollHeight;}
function addTypingIndicator(){const box=document.getElementById('scene-box');const d=document.createElement('div');d.className='message scene';d.id='typing';d.innerHTML='<div class="typing-dots"><span></span><span></span><span></span></div>';box.appendChild(d);box.scrollTop=box.scrollHeight;}
function removeTypingIndicator(){const t=document.getElementById('typing');if(t)t.remove();}
function setLoading(show,text='The world stirs...'){document.getElementById('loading-text').textContent=text;document.getElementById('loading-overlay').classList.toggle('visible',show);}
function updateHeader(){const{x,y}=state.pos;const meta=getCellMeta(x,y);const key=cellKey(x,y);const cell=state.cells[key];document.getElementById('location-tag').textContent=cell?.locationName||meta.name||terrainLabel(meta.type);document.getElementById('coords').textContent=`${x}, ${y}`;}
function updateStats(){const p=state.player;document.getElementById('hp-val').textContent=p.hp;document.getElementById('sp-val').textContent=p.stamina;const rg=(walletTotalCopper()/1000).toFixed(2);document.getElementById('gold-val').textContent=`≈${rg}g`;document.getElementById('day-val').textContent=Math.floor(p.day);document.getElementById('hp-bar').style.width=`${(p.hp/p.maxHp)*100}%`;document.getElementById('sp-bar').style.width=`${(p.stamina/p.maxStamina)*100}%`;const dhp=document.getElementById('dhp-val');if(dhp){dhp.textContent=p.hp;document.getElementById('dsp-val').textContent=p.stamina;document.getElementById('dgold-val').textContent=`≈${rg}g`;document.getElementById('dday-val').textContent=Math.floor(p.day);document.getElementById('dhp-bar').style.width=`${(p.hp/p.maxHp)*100}%`;document.getElementById('dsp-bar').style.width=`${(p.stamina/p.maxStamina)*100}%`;}}
function setCombatMode(on,enemy=null,actions=null){state.inCombat=on;state.currentEnemy=enemy;document.getElementById('combat-panel').classList.toggle('visible',on);if(on)renderCombatActions(actions);updateMoveButtons();}
function renderCombatActions(actions){const c=document.getElementById('combat-actions');c.innerHTML='';const def=[{label:'Attack',action:'Attack'},{label:'Defend',action:'Defend'},{label:'Flee',action:'Flee'}];const list=(actions&&actions.length)?actions:def;list.forEach(a=>{const btn=document.createElement('button');const isItem=a.label.toLowerCase().includes('item')||a.label.toLowerCase().includes('use');const isFlee=a.label.toLowerCase().includes('flee')||a.label.toLowerCase().includes('run');btn.className='combat-btn'+(isFlee?' flee-btn':'')+(isItem?' item-btn':'');if(isItem){btn.textContent='🧪 '+a.label;btn.onclick=()=>openItemUse();}else{btn.textContent=isFlee?'💨 '+a.label:'⚔ '+a.label;btn.onclick=()=>sendCombatAction(a.action);}c.appendChild(btn);});const hasItem=list.some(a=>a.label.toLowerCase().includes('item')||a.label.toLowerCase().includes('use'));if(!hasItem&&state.inventory.length>0){const btn=document.createElement('button');btn.className='combat-btn item-btn';btn.textContent='🧪 Use Item';btn.onclick=()=>openItemUse();c.appendChild(btn);}}
function openItemUse(){const d=document.getElementById('item-use-drawer'),l=document.getElementById('item-use-list'),e=document.getElementById('item-use-empty');l.innerHTML='';if(state.inventory.length===0)e.style.display='block';else{e.style.display='none';state.inventory.forEach(item=>{const btn=document.createElement('button');btn.className='item-use-btn';btn.textContent=item.name;btn.onclick=()=>{closeItemUse();sendCombatAction(`I use the ${item.name}`);};l.appendChild(btn);});}d.classList.add('open');}
function closeItemUse(){document.getElementById('item-use-drawer').classList.remove('open');}

// ═══════════════════════════════════════════════════
// AI — MAIN GAME (via OpenRouter)
// ═══════════════════════════════════════════════════
function layerContext(){if(state.layer==='interior')return'INTERIOR SCALE: 1m per cell. Inside a building. Describe room details: furniture, light, smells, sounds, occupants.';if(state.layer==='settlement'){const name=SETTLEMENTS[state.settlementId]?.name||state.settlementId;return`SETTLEMENT SCALE: 5m per cell. Inside ${name}. Describe street-scale details: stalls, doorways, crowds, signage, cobblestones.`;}return'OVERWORLD SCALE: 50m per cell. Describe landscape: terrain, weather, distant landmarks.';}

function buildNpcContextForSystemPrompt(){const present=getNpcsAtCurrentLocation();if(present.length===0)return'';const lines=present.map(id=>{const tmpl=NPC_TEMPLATES[id];const disp=getNpcDisposition(id);const dl=dispositionLabel(disp);const ns=getNpcState(id);const mem=ns.memory.length?ns.memory.slice(-2).join('; '):'not yet met';return`  - ${tmpl.name} (${tmpl.role}): disposition=${dl.label}, memory="${mem}"`;});return`\nNPCS PRESENT HERE:\n${lines.join('\n')}\nIf the player tries to talk to one, mention they can use the Talk button or type "talk to [name]".`;}

function buildSystemPrompt(actionOnly=false){
  const invSummary=state.inventory.length?state.inventory.map(i=>i.name).join(', '):'nothing';
  const playerName=state.player.name||'unknown traveller';
  const equippedSummary=Object.entries(state.equipped).filter(([,v])=>v).map(([k,v])=>`${SLOT_LABELS[k]}: ${v.name}`).join(', ')||'nothing equipped';
  const walletSummary=`${state.wallet.gold}g ${state.wallet.silver}s ${state.wallet.copper}c (total: ${walletTotalCopper()}cp)`;
  const weaponName=state.equipped.weapon?.name||'bare hands';
  const skillSummary=Object.keys(state.skills).length?Object.entries(state.skills).map(([k,v])=>`${k}:${v}`).join(', '):'none yet';
  const repSummary=Object.entries(state.worldState.reputation||{}).filter(([,v])=>v!==0).map(([k,v])=>`${FACTIONS[k]?.name||k}:${v>0?'+'+v:v}`).join(', ')||'none';
  const npcCtx=buildNpcContextForSystemPrompt();
  const emptyActions='"combatActions":[]';
  return `You are the game master for Valdenmere, a gritty high fantasy world with realistic consequences.

PLAYER NAME: ${playerName}

WORLD: Valdenmere kingdom. Ironhaven (capital), Thornwick (large town, SW), Saltmere (port, SE), Greyveil (village, NE foothills), Dunrock (village, W farmlands). Terrain: plains, Ashwood Forest (W), Greymount Range (NE), River Veld. Tone: gritty, vivid, grounded. Think early Tolkien with real danger.
COORDINATE SYSTEM: Lower Y = further north. Higher Y = further south. Ironhaven is NORTH of the starting position. When describing directions to named places, use this: if a place has lower Y coords it is north, higher Y is south.

${layerContext()}

PLAYER INVENTORY: ${invSummary}
PLAYER EQUIPPED: ${equippedSummary}
WEAPON: ${weaponName}
WALLET: ${walletSummary}
OVERLOADED: ${state.inventoryOverloaded}
FACTION REPUTATION: ${repSummary}
WORLD STATE: ${JSON.stringify(state.worldState)}
SKILLS: ${skillSummary}
${npcCtx}

${actionOnly?`ACTION MODE: Player acts. No location re-description. Omit LOCATION.
RESPONSE FORMAT:
SITUATION: <result, 1-2 sentences>
NOTICE: <newly revealed, 1 sentence, omit if nothing>
IMAGE_SUBJECT: <3-6 word visual subject for image generation. Include what lies to the north if notable, e.g. "lush forest path, distant city walls north", "mossy stone crossroads, mountain peaks beyond", omit if no significant visual change>
JSON: {"locationName":null,"exits":null,"hasCombat":false,"enemy":null,"hpDelta":0,"staminaDelta":0,"coinsAwarded":null,"coinsLost":null,"inventoryAdd":[],"inventoryRemove":[],"inventoryOverloaded":false,"cellNotes":null,"skillUpdates":{},${emptyActions},"factionRepChanges":{},"npcSpawn":null}`:
`ENTRY MODE: Player just arrived.
RESPONSE FORMAT:
LOCATION: <place description, 1-2 sentences>
SITUATION: <current activity, 1-2 sentences, omit if nothing>
NOTICE: <interactable detail, 1 sentence, omit if nothing>
IMAGE_SUBJECT: <3-6 word visual subject. Include what lies to the north if notable, e.g. "cobblestone market street, castle towers north">
JSON: {"locationName":"...","exits":{"n":true,"s":true,"e":true,"w":true},"hasCombat":false,"enemy":null,"hpDelta":0,"staminaDelta":0,"coinsAwarded":null,"coinsLost":null,"inventoryAdd":[],"inventoryRemove":[],"inventoryOverloaded":false,"cellNotes":null,"skillUpdates":{},${emptyActions},"factionRepChanges":{},"npcSpawn":null}`}

CURRENCY RULES: coinsAwarded/coinsLost: {"currency":"copper"|"silver"|"gold","amount":N}. Null if none. NEVER put coins in inventoryAdd.
ITEM VALUES: inventoryAdd items must include: [{"name":"Iron Dagger","valueCp":150}]
FACTION REP: factionRepChanges = {"faction_id": delta} (-20 to +20). Use sparingly.
COMBAT RULES:
- hasCombat triggers ORGANICALLY from player actions: attacking an NPC or creature, provoking a hostile encounter, being ambushed (bandits, wild animals), doing something dangerous (kicking a beehive, startling a horse). Do NOT trigger combat for passive movement through areas.
- When hasCombat=true: hpDelta reflects first-strike damage (negative = player took damage). combatActions should be 3-4 options including one flee option. Always include a free-text option reminding player they can also type anything.
- Combat is turn-based via the SITUATION field each turn. Narrate blow-by-blow. Do NOT resolve entire fights in one response.
- Track enemy condition narratively: describe when they're tiring, bleeding, near death. Player has no HP bar for enemies — keep them guessing.
- Flee success depends on context: easy in open country, hard in tight spaces or against fast enemies.
- Player can type anything in combat (throw item, use environment, call for help) — resolve creatively.
NOTICE: ~1 in 5 squares. Omit if in doubt.
SKILLS: skillUpdates = {skill:delta}. Never reveal to player.
NPC SPAWN: npcSpawn: {"name":"...","role":"...","faction":"...","emoji":"...","personality":"...","initialDisposition":0,"trader":null} — only when player engages a specific individual not already an NPC. Null otherwise.`;
}

async function callAI(messages, actionOnly=false) {
  addTypingIndicator();
  try {
    const res = await fetch(CONFIG.AI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        model: CONFIG.TEXT_MODEL,
        max_tokens: 400,
        messages: [
          { role:'system', content: buildSystemPrompt(actionOnly) },
          ...messages
        ]
      })
    });
    const data = await res.json();
    removeTypingIndicator();
    const raw = data.choices?.[0]?.message?.content || '';
    let location='', situation='', notice='', imageSubject='', meta={};
    // Normalise markdown bold labels e.g. **LOCATION:** → LOCATION:
    const normalised = raw.replace(/\*\*([A-Z_]+):\*\*/g, '$1:').replace(/\*\*([A-Z_]+)\*\*:/g, '$1:');
    const lines = normalised.split('\n');
    let jsonStr = '';
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('LOCATION:')) location = t.replace('LOCATION:','').trim();
      else if (t.startsWith('SITUATION:')) situation = t.replace('SITUATION:','').trim();
      else if (t.startsWith('NOTICE:')) notice = t.replace('NOTICE:','').trim();
      else if (t.startsWith('IMAGE_SUBJECT:')) imageSubject = t.replace('IMAGE_SUBJECT:','').trim();
      else if (t.startsWith('JSON:')) jsonStr = t.replace('JSON:','').trim();
    }
    if (!jsonStr) jsonStr = lines[lines.length-1].trim();
    try {
      jsonStr = jsonStr.replace(/```json|```/g,'').trim();
      meta = JSON.parse(jsonStr);
    } catch(e) {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) try { meta = JSON.parse(m[0]); } catch(e2) {}
      if (!location && !situation) location = raw.replace(/\{[\s\S]*\}/,'').replace(/JSON:.*/g,'').replace(/IMAGE_SUBJECT:.*/g,'').trim();
    }
    // Strip any leaked JSON or backticks from display fields
    const stripMeta = (s) => s.replace(/```[\s\S]*?```/g,'').replace(/\{[\s\S]*\}/g,'').replace(/`/g,'').trim();
    location = stripMeta(location);
    situation = stripMeta(situation);
    notice = stripMeta(notice);
    // Don't display literal "null" strings
    if (notice.toLowerCase() === 'null' || notice.toLowerCase() === 'none') notice = '';
    if (situation.toLowerCase() === 'null' || situation.toLowerCase() === 'none') situation = '';
    return { location, situation, notice, imageSubject, meta };
  } catch(e) {
    removeTypingIndicator();
    return { location:'', situation:'The world grows quiet... (error)', notice:'', imageSubject:'', meta:{} };
  }
}

// ═══════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════
const SLOT_LABELS={head:'Head',body:'Body',hands:'Hands',feet:'Feet',weapon:'Weapon',offhand:'Off-hand',accessory:'Accessory'};
function guessSlot(name){const n=name.toLowerCase();if(/helm|hat|hood|cap|crown|circlet/.test(n))return'head';if(/sword|axe|dagger|knife|spear|staff|bow|mace|club|blade|wand|hammer/.test(n))return'weapon';if(/shield|buckler|tome|offhand/.test(n))return'offhand';if(/boot|shoe|sandal|greave/.test(n))return'feet';if(/glove|gauntlet|bracer/.test(n))return'hands';if(/ring|amulet|necklace|pendant|brooch|talisman/.test(n))return'accessory';if(/cloak|robe|coat|armour|armor|jacket|tunic|shirt|jerkin|vest|dress|mail|leather/.test(n))return'body';return null;}
let _mobileTab='pack',_desktopTab='pack';
function switchMobileTab(tab){_mobileTab=tab;document.getElementById('mpanel-pack').style.display=tab==='pack'?'':'none';document.getElementById('mpanel-equip').style.display=tab==='equip'?'':'none';document.getElementById('mtab-pack').style.opacity=tab==='pack'?'1':'0.4';document.getElementById('mtab-equip').style.opacity=tab==='equip'?'1':'0.4';document.getElementById('mtab-pack').style.borderBottomColor=tab==='pack'?'rgba(201,148,58,0.4)':'rgba(201,148,58,0.1)';document.getElementById('mtab-equip').style.borderBottomColor=tab==='equip'?'rgba(201,148,58,0.4)':'rgba(201,148,58,0.1)';if(tab==='equip')renderEquipped();}
function switchDesktopTab(tab){_desktopTab=tab;document.getElementById('dpanel-pack').style.display=tab==='pack'?'':'none';document.getElementById('dpanel-equip').style.display=tab==='equip'?'':'none';document.getElementById('dtab-pack').style.opacity=tab==='pack'?'1':'0.45';document.getElementById('dtab-equip').style.opacity=tab==='equip'?'1':'0.45';document.getElementById('dtab-pack').style.borderBottomColor=tab==='pack'?'rgba(201,148,58,0.4)':'rgba(201,148,58,0.1)';document.getElementById('dtab-equip').style.borderBottomColor=tab==='equip'?'rgba(201,148,58,0.4)':'rgba(201,148,58,0.1)';if(tab==='equip')renderEquipped();}
function togglePurse(){const d=document.getElementById('purse-drawer');const isO=d.style.display==='none'||!d.style.display;d.style.display=isO?'block':'none';if(isO)renderPurse();if(isO){document.getElementById('inv-drawer').classList.remove('open');document.getElementById('map-drawer').classList.remove('open');}}
function renderPurse(){const el=document.getElementById('purse-contents');if(!el)return;const{gold,silver,copper,other}=state.wallet;const rows=[{label:'Gold',symbol:'⬡',amount:gold,color:'#e8b84b'},{label:'Silver',symbol:'◈',amount:silver,color:'#c0c0c0'},{label:'Copper',symbol:'◉',amount:copper,color:'#c87840'}];let html=rows.map(r=>`<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="font-size:1.1rem;color:${r.color};">${r.symbol}</span><span style="font-size:0.85rem;color:var(--stone-light);width:52px;">${r.label}</span><span style="font-size:1rem;color:var(--parchment);font-weight:300;">${r.amount}</span></div>`).join('');if(other&&other.length){html+=`<div style="font-size:0.65rem;color:var(--stone);letter-spacing:0.1em;padding:8px 0 4px;font-family:'Cinzel Decorative',serif;opacity:0.6;">— Other —</div>`;html+=other.map(s=>{const tv=formatCopper(s.amount*s.valueCpEach),ev=formatCopper(s.valueCpEach);return`<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="font-size:1rem;color:var(--stone-light);">◇</span><span style="flex:1;font-size:0.85rem;color:var(--parchment);">${s.name}</span><span style="font-size:1rem;color:var(--parchment);font-weight:300;margin-right:6px;">×${s.amount}</span><span style="font-size:0.68rem;color:var(--stone-light);text-align:right;">≈${tv}<br><span style="opacity:0.6;">${ev} each</span></span></div>`;}).join('');}el.innerHTML=html;}
function toggleInv(){document.getElementById('inv-drawer').classList.toggle('open');document.getElementById('map-drawer').classList.remove('open');renderInventory();renderEquipped();}
function renderEquipped(){const slots=Object.keys(SLOT_LABELS);const mEl=document.getElementById('equipped-list-mobile');if(mEl){mEl.innerHTML='';slots.forEach(slot=>{const item=state.equipped[slot];const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.85rem;';row.innerHTML=`<span style="color:var(--stone-light);font-size:0.72rem;width:68px;flex-shrink:0;">${SLOT_LABELS[slot]}</span><span style="flex:1;color:${item?'var(--parchment)':'var(--stone)'};font-style:${item?'normal':'italic'};">${item?item.name:'—'}</span>${item?`<button onclick="unequipItem('${slot}')" style="background:none;border:1px solid rgba(139,58,42,0.4);color:rgba(212,128,90,0.7);font-size:0.68rem;padding:2px 6px;border-radius:2px;cursor:pointer;font-family:'Crimson Pro',serif;">Remove</button>`:''}`;mEl.appendChild(row);});}const dEl=document.getElementById('equipped-list-desktop');if(dEl){dEl.innerHTML='';slots.forEach(slot=>{const item=state.equipped[slot];const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:4px 2px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.78rem;';row.innerHTML=`<span style="color:var(--stone-light);font-size:0.68rem;width:58px;flex-shrink:0;">${SLOT_LABELS[slot]}</span><span style="flex:1;color:${item?'var(--parchment)':'var(--stone)'};font-style:${item?'normal':'italic'};">${item?item.name:'—'}</span>${item?`<button onclick="unequipItem('${slot}')" style="background:none;border:none;color:rgba(212,128,90,0.6);cursor:pointer;font-size:0.68rem;">↩</button>`:''}`;dEl.appendChild(row);});}}
function equipItem(idx){const item=state.inventory[idx];if(!item)return;const slot=item.slot||guessSlot(item.name);if(!slot){addMessage(`You can't equip the ${item.name}.`,'system');return;}if(state.equipped[slot])state.inventory.push(state.equipped[slot]);state.equipped[slot]=item;state.inventory.splice(idx,1);addMessage(`You equip the ${item.name}.`,'system');renderInventory();renderEquipped();saveState();}
function unequipItem(slot){const item=state.equipped[slot];if(!item)return;state.equipped[slot]=null;state.inventory.push(item);addMessage(`You remove the ${item.name}.`,'system');renderInventory();renderEquipped();saveState();}
function renderInventory(){const list=document.getElementById('inv-list'),empty=document.getElementById('inv-empty'),overload=document.getElementById('inv-overload'),listD=document.getElementById('inv-list-desktop'),emptyD=document.getElementById('inv-empty-desktop'),overloadD=document.getElementById('inv-overload-desktop'),items=state.inventory;overload.classList.toggle('visible',state.inventoryOverloaded);if(overloadD)overloadD.style.display=state.inventoryOverloaded?'block':'none';if(items.length===0){list.innerHTML='';empty.style.display='block';if(listD)listD.innerHTML='';if(emptyD)emptyD.style.display='block';return;}empty.style.display='none';if(emptyD)emptyD.style.display='none';const canEquip=(item)=>!!(item.slot||guessSlot(item.name));list.innerHTML='';items.forEach((item,i)=>{const div=document.createElement('div');div.className='inv-item';const vs=item.valueCp?`<span style="font-size:0.68rem;color:var(--stone-light);margin-right:6px;">≈${formatCopper(item.valueCp)}</span>`:'';div.innerHTML=`<span class="inv-item-name">${item.name}</span>${vs}${canEquip(item)?`<button onclick="equipItem(${i})" style="background:rgba(201,148,58,0.12);border:1px solid rgba(201,148,58,0.3);color:var(--gold);font-size:0.68rem;padding:3px 7px;border-radius:2px;cursor:pointer;font-family:'Crimson Pro',serif;margin-right:4px;">Equip</button>`:''}<button class="inv-drop-btn" onclick="dropItem(${i})">Drop</button>`;list.appendChild(div);});if(listD){listD.innerHTML='';items.forEach((item,i)=>{const div=document.createElement('div');div.style.cssText='font-size:0.78rem;color:var(--parchment);padding:3px 2px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.05);gap:4px;';const vs=item.valueCp?`<span style="font-size:0.65rem;color:var(--stone-light);">≈${formatCopper(item.valueCp)}</span>`:'';div.innerHTML=`<span style="flex:1">${item.name}</span>${vs}${canEquip(item)?`<button onclick="equipItem(${i})" style="background:none;border:none;color:rgba(201,148,58,0.7);cursor:pointer;font-size:0.68rem;">equip</button>`:''}<button onclick="dropItem(${i})" style="background:none;border:none;color:rgba(212,128,90,0.6);cursor:pointer;font-size:0.7rem;">drop</button>`;listD.appendChild(div);});}}
function dropItem(idx){const item=state.inventory[idx];if(!item)return;state.inventory.splice(idx,1);state.inventoryOverloaded=false;renderInventory();addMessage(`You drop the ${item.name}.`,'system');saveState();}
function applyInventoryChanges(meta){if(meta.inventoryAdd&&Array.isArray(meta.inventoryAdd))meta.inventoryAdd.forEach(e=>{if(!e)return;const name=typeof e==='string'?e.trim():(e.name||'').trim();const vCp=typeof e==='object'?(e.valueCp||null):null;if(name)state.inventory.push({name,valueCp:vCp});});if(meta.inventoryRemove&&Array.isArray(meta.inventoryRemove))meta.inventoryRemove.forEach(name=>{const idx=state.inventory.findIndex(i=>i.name.toLowerCase()===name.toLowerCase());if(idx!==-1){state.inventory.splice(idx,1);return;}for(const slot of Object.keys(state.equipped)){if(state.equipped[slot]?.name.toLowerCase()===name.toLowerCase()){state.equipped[slot]=null;break;}}});if(typeof meta.inventoryOverloaded==='boolean')state.inventoryOverloaded=meta.inventoryOverloaded;renderInventory();renderEquipped();}
function applyCellNotes(meta){if(!meta.cellNotes)return;const key=cellKey(state.pos.x,state.pos.y);if(!state.cells[key])return;const ex=state.cells[key].notes;if(ex&&!meta.cellNotes.includes(ex))state.cells[key].notes=ex+'; '+meta.cellNotes;else state.cells[key].notes=meta.cellNotes;}
function applySkillChanges(meta){if(!meta.skillUpdates||typeof meta.skillUpdates!=='object')return;for(const[skill,delta]of Object.entries(meta.skillUpdates)){if(typeof delta!=='number')continue;const cur=state.skills[skill]||0;const next=cur+delta;if(next<=0)delete state.skills[skill];else state.skills[skill]=next;}}
function applyFactionRepChanges(meta){if(!meta.factionRepChanges||typeof meta.factionRepChanges!=='object')return;for(const[faction,delta]of Object.entries(meta.factionRepChanges)){if(typeof delta!=='number')continue;state.worldState.reputation[faction]=Math.max(-100,Math.min(100,(state.worldState.reputation[faction]||0)+delta));}}
function buildCellPrompt(x,y){const meta=getCellMeta(x,y);const nb=getNeighbourMeta(x,y);const key=cellKey(x,y);const cell=state.cells[key];const visited=!!cell;const notesLine=cell?.notes?`\nPersistent notes: "${cell.notes}"`:'';function dirDesc(m){return m.name?`${m.type} (${m.name})`:m.type;}const dirContext=`Layout: N=${dirDesc(nb.n)}, S=${dirDesc(nb.s)}, E=${dirDesc(nb.e)}, W=${dirDesc(nb.w)}.`;const presentNpcs=getNpcsAtCurrentLocation();const npcHint=presentNpcs.length>0?`\nNPCs present: ${presentNpcs.map(id=>NPC_TEMPLATES[id]?.name).join(', ')}.`:'';if(visited)return`Player returns to (${x},${y}). Terrain: ${meta.type}${meta.name?`, ${meta.name}`:''}.Previously: "${cell.locationName}". ${dirContext}${notesLine}${npcHint}\nBriefly acknowledge return.`;return`First visit to (${x},${y}). Terrain: ${meta.type}${meta.name?`, part of ${meta.name}`:''}.${dirContext} Day ${Math.floor(state.player.day)}.${notesLine}${npcHint}\nDescribe what the player sees, smells, hears.`;}


// ═══════════════════════════════════════════════════
// CORE GAME LOGIC
// ═══════════════════════════════════════════════════
async function enterCell(x, y) {
  const transition = getCellTransition(x, y);
  if (transition) {
    if (transition.type === 'enter_settlement') { await enterSettlement(transition.id); return; }
    if (transition.type === 'enter_interior') { await enterInterior(transition.id, transition.entryPos||{x:1,y:1}); return; }
  }

  const key = cellKey(x, y);
  state.pos = { x, y };
  state.history = [];
  const ss = seenSet();
  for (let dy=-FOV_RADIUS; dy<=FOV_RADIUS; dy++)
    for (let dx=-FOV_RADIUS; dx<=FOV_RADIUS; dx++)
      ss.add(`${x+dx},${y+dy}`);

  const cellPrompt = buildCellPrompt(x, y);
  const messages = [{ role:'user', content: cellPrompt }];
  let location='', situation='', notice='', imageSubject='', meta={};

  try {
    ({ location, situation, notice, imageSubject, meta } = await callAI(messages));
  } catch(e) {
    removeTypingIndicator();
    addMessage('The world is quiet here...', 'system');
    updateHeader(); updateMoveButtons(); renderMinimap();
    return;
  }

  if (meta.hpDelta) state.player.hp = Math.max(0, Math.min(state.player.maxHp, state.player.hp + meta.hpDelta));
  if (meta.coinsAwarded) applyCoins(meta.coinsAwarded);
  if (meta.coinsLost) applyCoinsLost(meta.coinsLost);
  if (meta.staminaDelta) state.player.stamina = Math.max(0, Math.min(state.player.maxStamina, state.player.stamina + meta.staminaDelta));
  applyInventoryChanges(meta); applySkillChanges(meta); applyFactionRepChanges(meta);

  const existing = state.cells[key] || {};
  state.cells[key] = {
    ...existing,
    locationName: meta.locationName || existing.locationName || terrainLabel(getCellMeta(x,y).type),
    exits: meta.exits || existing.exits || {n:true,s:true,e:true,w:true},
    description: location || existing.description || '',
    lastVisited: state.player.day
  };

  const rawResponse = [location?`LOCATION: ${location}`:'', situation?`SITUATION: ${situation}`:'', notice?`NOTICE: ${notice}`:''].filter(Boolean).join('\n');
  state.history.push({ role:'user', content: cellPrompt });
  state.history.push({ role:'assistant', content: rawResponse + '\nJSON: ' + JSON.stringify(meta) });

  // Apply scene image — use cached URL if available, otherwise generate
  const cachedImageUrl = existing.imageUrl || null;
  // Build image description from actual scene text — far more accurate than a 6-word summary
  const northMeta = getCellMeta(x, y - 1);
  const northHint = (northMeta.name && northMeta.name !== getCellMeta(x,y).name) ? ` To the north: ${northMeta.name}.` : '';
  const imageDesc = location ? `${location}${northHint}` : imageSubject;

  if (cachedImageUrl) {
    applySceneBackground(cachedImageUrl);
  } else if (!CONFIG.ENABLE_IMAGES) {
    applySceneBackground('background.png');
  } else if (imageDesc && CONFIG.ENABLE_IMAGES) {
    // Generate in background — don't block text display
    generateSceneImage(imageDesc, key).then(url => {
      if (url) {
        applySceneBackground(url);
        state.cells[key].imageUrl = url;
        if (CONFIG.ENABLE_SUPABASE) {
          DB.upsertCell({
            layer: state.layer,
            settlement_id: state.settlementId || null,
            x, y,
            location_name: state.cells[key].locationName,
            description: location,
            image_url: url,
            notes: state.cells[key].notes || null,
            last_visited: state.player.day
          }).catch(() => {});
        }
      }
    });
  } else if (!imageDesc) {
    if (!cachedImageUrl) applySceneBackground(null);
  }

  addZones(state.cells[key].locationName, location, situation, notice);

  // Show NPC presence and handle forced intercepts
  const presentNpcs = getNpcsAtCurrentLocation();
  let forcedNpc = null;
  if (presentNpcs.length > 0) {
    // Check if any NPC should force-intercept the player
    for (const id of presentNpcs) {
      const tmpl = NPC_TEMPLATES[id];
      const disp = getNpcDisposition(id);
      const ns = getNpcState(id);
      const isGuardType = tmpl.faction === 'ironhaven_guard' || (tmpl.role && /guard|sentry|soldier|watchman|toll|bouncer/i.test(tmpl.role));
      const isHostileType = disp < -40;
      // Intercept if: guard-type NPC (always check papers on first meeting), or hostile NPC
      if ((isGuardType && ns.memory.length === 0) || isHostileType) {
        forcedNpc = id;
        break;
      }
    }
  }

  if (presentNpcs.length > 0) {
    presentNpcs.forEach(id => {
      if (id === forcedNpc) return; // forced ones handled separately
      const tmpl = NPC_TEMPLATES[id];
      const box = document.getElementById('scene-box');
      const div = document.createElement('div');
      div.style.cssText = 'font-size:0.78rem;color:#a0c878;margin-bottom:8px;display:flex;align-items:center;gap:8px;animation:fadeIn 0.35s ease 0.3s both;';
      if (box.style.backgroundImage) div.style.textShadow = '0 1px 4px rgba(0,0,0,0.9),0 0 12px rgba(0,0,0,0.7)';
      div.innerHTML = `<span style="opacity:0.7;">${tmpl.emoji}</span><span style="flex:1;font-style:italic;">${tmpl.name} is here</span><button onclick="openNpcDrawer('${id}')" style="background:rgba(160,200,120,0.1);border:1px solid rgba(160,200,120,0.3);color:#a0c878;font-size:0.65rem;font-family:'Cinzel Decorative',serif;padding:2px 7px;border-radius:3px;cursor:pointer;letter-spacing:0.06em;">Talk</button>`;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    });
  }

  updateHeader(); updateStats(); updateMoveButtons(); renderMinimap(); renderNpcPresence();
  if (meta.hasCombat && meta.enemy) setCombatMode(true, meta.enemy, meta.combatActions);
  if (!_inTransition) await saveState();

  // Trigger forced intercept after a short delay so scene text renders first
  if (forcedNpc && !state.inCombat) {
    setTimeout(() => openNpcDrawer(forcedNpc, true), 800);
  }
}

async function move(dx, dy) {
  if (state.inCombat) return;
  const nx = state.pos.x + dx, ny = state.pos.y + dy;
  const meta = getCellMeta(nx, ny);
  if (!isTraversable(meta.type)) return;
  state.player.day += (state.layer === 'overworld') ? 0.1 : 0.01;
  state.player.day = Math.round(state.player.day * 10) / 10;
  state.player.stamina = Math.min(state.player.maxStamina, state.player.stamina + 2);
  if (state.layer === 'overworld' && !OVERWORLD_TO_SETTLEMENT[`${state.pos.x},${state.pos.y}`])
    state.lastOverworldPos = { ...state.pos };
  await enterCell(nx, ny);
}

function tryRouteToNpc(text) {
  const presentNpcs = getNpcsAtCurrentLocation();
  if (!presentNpcs.length) return null;
  const lower = text.toLowerCase();
  for (const id of presentNpcs) {
    const tmpl = NPC_TEMPLATES[id];
    const nameParts = tmpl.name.toLowerCase().split(' ');
    const roleWords = tmpl.role.toLowerCase().split(/[\s,]+/);
    const allTokens = [...nameParts, ...roleWords];
    if (allTokens.some(tok => tok.length > 3 && lower.includes(tok))) return id;
  }
  for (const [id, ns] of Object.entries(state.npcs)) {
    if (!ns.template) continue;
    if (ns.cellKey !== cellKey(state.pos.x, state.pos.y)) continue;
    const nameParts = (ns.template.name || '').toLowerCase().split(' ');
    if (nameParts.some(tok => tok.length > 3 && lower.includes(tok))) return id;
  }
  return null;
}

function spawnNpc(spawnData, cellKeyStr) {
  const id = 'dynamic_' + Date.now();
  NPC_TEMPLATES[id] = {
    id, name: spawnData.name, role: spawnData.role || 'Stranger',
    faction: spawnData.faction || 'ironhaven_citizens', emoji: spawnData.emoji || '👤',
    personality: spawnData.personality || 'A person of few words.',
    schedule: [], trader: spawnData.trader || null, dynamic: true
  };
  state.npcs[id] = {
    disposition: spawnData.initialDisposition || 0,
    memory: [`Day ${Math.floor(state.player.day)}: First encountered by player.`],
    lastSeen: state.player.day, tradeStock: null, cellKey: cellKeyStr,
    template: NPC_TEMPLATES[id]
  };
  addMessage(`You've met someone new: ${spawnData.name}.`, 'system');
  return id;
}

async function handleInput() {
  const cmd = document.getElementById('cmd');
  const text = cmd.value.trim();
  if (!text) return;
  cmd.value = '';

  const npcTarget = tryRouteToNpc(text);
  if (npcTarget) { openNpcDrawer(npcTarget); return; }

  addMessage(text, 'player');
  const messages = [...state.history, { role:'user', content: text }];
  const { location, situation, notice, imageSubject, meta } = await callAI(messages, true);

  if (meta.hpDelta) state.player.hp = Math.max(0, Math.min(state.player.maxHp, state.player.hp + meta.hpDelta));
  if (meta.coinsAwarded) applyCoins(meta.coinsAwarded);
  if (meta.coinsLost) applyCoinsLost(meta.coinsLost);
  if (meta.staminaDelta) state.player.stamina = Math.max(0, Math.min(state.player.maxStamina, state.player.stamina + meta.staminaDelta));
  applyInventoryChanges(meta); applyCellNotes(meta); applySkillChanges(meta); applyFactionRepChanges(meta);

  // Update scene image if action causes a significant visual change
  if (imageSubject && CONFIG.ENABLE_IMAGES) {
    generateSceneImage(imageSubject, cellKey(state.pos.x, state.pos.y) + '_action').then(url => {
      if (url) applySceneBackground(url);
    });
  }

  if (meta.npcSpawn && meta.npcSpawn.name) {
    const newId = spawnNpc(meta.npcSpawn, cellKey(state.pos.x, state.pos.y));
    setTimeout(() => openNpcDrawer(newId), 300);
  }

  const rawResponse = [situation?`SITUATION: ${situation}`:'', notice?`NOTICE: ${notice}`:''].filter(Boolean).join('\n');
  state.history.push({ role:'user', content: text });
  state.history.push({ role:'assistant', content: rawResponse + '\nJSON: ' + JSON.stringify(meta) });
  if (state.history.length > 20) state.history = state.history.slice(-20);

  if (meta.hasCombat) addMessage(situation || location, 'combat');
  else addZones('', situation?'':location, situation, notice);

  updateStats();
  if (meta.hasCombat && meta.enemy) setCombatMode(true, meta.enemy, meta.combatActions);
  else if (!meta.hasCombat && state.inCombat) { setCombatMode(false); addMessage('The threat passes.', 'system'); }
  await saveState();
}

async function sendCombatAction(action) {
  addMessage(action, 'player');
  const messages = [...state.history, { role:'user', content: action }];
  const { situation, notice, meta } = await callAI(messages, true);
  if (meta.hpDelta) state.player.hp = Math.max(0, Math.min(state.player.maxHp, state.player.hp + meta.hpDelta));
  applyInventoryChanges(meta); applyCellNotes(meta); applySkillChanges(meta); applyFactionRepChanges(meta);
  state.history.push({ role:'assistant', content: `SITUATION: ${situation}\nJSON: ${JSON.stringify(meta)}` });
  addMessage(situation, 'combat');
  updateStats();
  if (!meta.hasCombat) { setCombatMode(false); addMessage('The battle is over.', 'system'); }
  else renderCombatActions(meta.combatActions);
  await saveState();
}

// ═══════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════
document.addEventListener('keydown', e => {
  const cmd = document.getElementById('cmd');
  const npcCmd = document.getElementById('npc-cmd');
  if (e.target === npcCmd) { if (e.key === 'Enter') sendNpcMessage(); return; }
  if (e.target === cmd) { if (e.key === 'Enter') handleInput(); return; }
  if (state.inCombat || state.blockedBy) return;
  if (e.key === 'ArrowUp'   || e.key === 'w') move(0,-1);
  if (e.key === 'ArrowDown' || e.key === 's') move(0,1);
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-1,0);
  if (e.key === 'ArrowRight'|| e.key === 'd') move(1,0);
  if (e.key === 'q') move(-1,-1);
  if (e.key === 'e') move(1,-1);
  if (e.key === 'z') move(-1,1);
  if (e.key === 'c') move(1,1);
  if (e.key === 'Escape') {
    if (npcSession.isOpen) { closeNpcDrawer(); return; }
    if (state.layer !== 'overworld') exitLayer();
  }
});

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
async function clearSave() {
  try { localStorage.removeItem('valdenmere-state'); } catch(e) {}
  if (CONFIG.ENABLE_SUPABASE) {
    await DB.query(`player_state?world_id=eq.${WORLD_DATA.id}&player_id=eq.default`, 'DELETE').catch(()=>{});
  }
  addMessage('Save cleared. Reloading...', 'system');
  setTimeout(() => location.reload(), 800);
}

function openSettings() {
  const modal = document.getElementById('settings-modal');
  modal.style.display = 'flex';
  const nameInput = document.getElementById('settings-name');
  nameInput.value = state.player.name || '';
}

function closeSettings() {
  document.getElementById('settings-modal').style.display = 'none';
}

function saveSettings() {
  const name = document.getElementById('settings-name').value.trim();
  if (name) {
    state.player.name = name;
    saveState();
    addMessage(`Your name is recorded as ${name}.`, 'system');
  }
  closeSettings();
}

function resetGame() {
  if (!confirm('Reset everything and start over?')) return;
  closeSettings();
  clearSave();
}

async function init() {
  setLoading(true, 'Loading world...');
  const lt = setTimeout(() => {
    setLoading(false);
    addMessage('Something went wrong. Try refreshing.', 'system');
  }, 20000);
  try {
    const hadSave = await loadState();
    updateStats(); updateLayerBadge(); renderMinimap();
    if (hadSave) {
      addMessage(`You find yourself once again in Valdenmere.`, 'system');
      // Restore cached background image if available, or use placeholder
      const key = cellKey(state.pos.x, state.pos.y);
      if (state.cells[key]?.imageUrl) applySceneBackground(state.cells[key].imageUrl);
      else if (!CONFIG.ENABLE_IMAGES) applySceneBackground('background.png');
      _suppressTransitions = true;
      await enterCell(state.pos.x, state.pos.y);
      _suppressTransitions = false;
    } else {
      state.equipped.body   = { name:'Worn Leather Jerkin' };
      state.equipped.feet   = { name:'Scuffed Travelling Boots' };
      state.equipped.weapon = { name:'Battered Shortsword' };
      const ri = [
        {name:'Tarnished Lucky Coin'},{name:'Half-eaten Wedge of Cheese'},
        {name:'Crumpled Letter (unread)'},{name:'Small Vial of Unknown Liquid'},
        {name:'Crow Feather (suspiciously large)'},{name:'Snapped Compass Needle'},
        {name:'Dried Sprig of Wolfsbane'}
      ];
      state.inventory = [{ name:'Heel of Bread' }, ri[Math.floor(Math.random() * ri.length)]];
      addMessage(`Welcome to Valdenmere.`, 'system');
      await enterCell(0, 0);
    }
  } catch(e) {
    console.error('Init error:', e);
    addMessage('The world stirs but does not wake. Try refreshing.', 'system');
  } finally {
    clearTimeout(lt);
    setLoading(false);
  }
}

init();
