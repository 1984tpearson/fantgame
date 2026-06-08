// ═══════════════════════════════════════════════════════════════
// mapforge-config.js — Tile/Object appearance overrides
// Loaded before mapforge.js in both index.html and map-editor.html
//
// Two override modes:
//   customSprites[key]  — full hand-drawn pixel grid (Mode 2)
//                         key = terrain type name or object id
//   paletteOverrides[key] — colour parameter overrides (Mode 1)
//                         key = terrain type name
//
// Custom terrain/object registrations:
//   customTerrains[name] — { label, edgeCol, sprite? }
//   customObjects[id]    — { label, w, h, category, sprite? }
// ═══════════════════════════════════════════════════════════════

window.MapForgeConfig = window.MapForgeConfig || {

  // ── Mode 2: full hand-drawn sprites ──────────────────────────
  // key → 2D array of [r,g,b,a] or null (null = transparent)
  // e.g. customSprites['grass'] = [[...rows of pixels...]]
  customSprites: {},

  // ── Mode 1: colour parameter overrides ───────────────────────
  // key → object with named colour overrides for that terrain
  // e.g. paletteOverrides['grass'] = { G1:[80,120,50,255], G2:[90,130,60,255] }
  paletteOverrides: {},

  // ── Custom terrain registrations ─────────────────────────────
  // These get added to the map editor palette and engine terrain list
  // e.g. customTerrains['ash'] = { label:'Ash', edgeCol:[180,175,165,255] }
  customTerrains: {},

  // ── Custom object registrations ──────────────────────────────
  // e.g. customObjects['my_obj'] = { label:'My Object', w:16, h:16, category:'extras' }
  customObjects: {},

};
