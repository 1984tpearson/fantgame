// ═══════════════════════════════════════════════════════════════
// mapforge.js — Medieval Pixel Art Sprite Engine
// Extracted from map-forge-3.jsx (BUILD-003 v2.0.0)
// Exports: window.MapForge
// ═══════════════════════════════════════════════════════════════
(function(global) {
'use strict';


// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
const lerp = (a, b, t) => {
  t = Math.max(0, Math.min(1, t));
  return [0,1,2,3].map(i => Math.round(a[i] + (b[i]-a[i])*t));
};
const jitter = (c, amt=14, rng=Math.random) =>
  [0,1,2].map(i => Math.max(0,Math.min(255,c[i]+Math.round((rng()-0.5)*2*amt)))).concat([255]);
const hex = ([r,g,b,a=255]) => `rgba(${r},${g},${b},${a/255})`;

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ─── DRAWING PRIMITIVES ───────────────────────────────────────────────────────
function createPixelGrid(w, h) {
  return new Array(h).fill(null).map(() => new Array(w).fill(null));
}
function setPixel(grid, x, y, col) {
  if (x >= 0 && y >= 0 && x < grid[0].length && y < grid.length && col)
    grid[y][x] = col;
}
function getPixel(grid, x, y) {
  if (x >= 0 && y >= 0 && x < grid[0].length && y < grid.length)
    return grid[y][x];
  return null;
}
