// TEMPLATE — copy this folder, rename it, fill in the map below
// Settlement ID: change 'new_settlement' throughout
// hasWalls: true for walled towns, false for open settlements
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  // ── MAP CELLS ──────────────────────────────────────────────────────────────
  // Add t() calls here, or edit in map-editor.html

  window.SETTLEMENTS['new_settlement'] = {
    map: m,
    name: 'New Settlement',
    hasWalls: true,
    entryPos: {x:0, y:2},
    overworldCell: {x:0, y:0},
    description: '',
  };
})();
