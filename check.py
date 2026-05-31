f = open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', encoding='utf-8').read()

# Find the addZones call in enterCell to insert notice logic after it
old = "  addZones(state.cells[key].locationName, location, situation, notice);"
new = """  addZones(state.cells[key].locationName, location, situation, null);

  // ── NOTICE: separate focused call, probabilistic ──────────────────
  const _isFirstVisit = !existing.locationName;
  const _noticeChance = _isFirstVisit ? (1/6) : (1/15);
  if (Math.random() < _noticeChance) {
    maybeGenerateNotice(x, y, state.cells[key].locationName, getCellMeta(x,y).type);
  }"""

if old in f:
    f = f.replace(old, new)
    print("enterCell notice trigger added.")
else:
    print("NOT FOUND: addZones line")

# Now add the maybeGenerateNotice function before enterCell
notice_fn = """
// ═══════════════════════════════════════════════════
// NOTICE — SEPARATE FOCUSED CALL
// ═══════════════════════════════════════════════════
async function maybeGenerateNotice(x, y, locationName, terrainType) {
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
        max_tokens: 80,
        messages: [{
          role: 'system',
          content: 'You are a detail spotter for a gritty fantasy RPG. Respond with ONE sentence only — no preamble, no explanation. Describe a single specific hidden, unusual, or interactive detail the player might notice on close inspection. It must be something they could act on: a concealed object, a suspicious person, a hidden entrance, something out of place. NOT general atmosphere, NOT crowds, NOT signs or stalls. If nothing genuinely interesting fits this location, respond with exactly: NONE'
        }, {
          role: 'user',
          content: `Location: ${locationName} (${terrainType}). What specific hidden or unusual detail might a careful observer notice?`
        }]
      })
    });
    const data = await res.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();
    if (text && text !== 'NONE' && text.toUpperCase() !== 'NONE') {
      addZones('', '', '', text);
    }
  } catch(e) {
    // Silent fail — notice is optional
  }
}

"""

# Insert before async function enterCell
insert_before = "async function enterCell(x, y) {"
if insert_before in f:
    f = f.replace(insert_before, notice_fn + insert_before)
    print("maybeGenerateNotice function added.")
else:
    print("NOT FOUND: enterCell declaration")

open(r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\engine.js', 'w', encoding='utf-8').write(f)
print("Done.")
