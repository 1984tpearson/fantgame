// SALTWELL — settlement map
// overworldCell: 139,462  walls: 10x10  hasWalls: true
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  // ── MAP CELLS ──────────────────────────────────────────────────────────────
  t(-5,10,'wall','Wall');
  t(-4,10,'wall','Wall');
  t(-3,10,'wall','Wall');
  t(-2,10,'wall','Wall');
  t(-1,10,'wall','Wall');
  t(0,10,'gate','North Gate',{"exit":{"layer":"overworld","pos":{"x":139,"y":457}}});
  t(1,10,'wall','Wall');
  t(2,10,'wall','Wall');
  t(3,10,'wall','Wall');
  t(4,10,'wall','Wall');
  t(5,10,'wall','Wall');
  t(-5,9,'wall','Wall');
  t(0,9,'street','Main Street');
  t(5,9,'wall','Wall');
  t(-5,8,'wall','Wall');
  t(-4,8,'building','Building');
  t(-3,8,'door','Salt House',{"enter":{"layer":"interior","id":"saltwell_inn","entryPos":{"x":1,"y":1}}});
  t(-2,8,'building','Building');
  t(0,8,'street','Main Street');
  t(2,8,'building','Building');
  t(3,8,'building','Building');
  t(4,8,'building','Building');
  t(5,8,'wall','Wall');
  t(-5,7,'wall','Wall');
  t(-4,7,'building','Building');
  t(-3,7,'building','Building');
  t(-2,7,'building','Building');
  t(0,7,'street','Main Street');
  t(2,7,'building','Building');
  t(3,7,'building','Building');
  t(4,7,'building','Building');
  t(5,7,'wall','Wall');
  t(-5,6,'wall','Wall');
  t(0,6,'street','Main Street');
  t(5,6,'wall','Wall');
  t(-5,5,'wall','Wall');
  t(-4,5,'street','Cross Street');
  t(-3,5,'street','Cross Street');
  t(-2,5,'street','Cross Street');
  t(-1,5,'street','Cross Street');
  t(0,5,'street','Cross Street');
  t(1,5,'street','Cross Street');
  t(2,5,'street','Cross Street');
  t(3,5,'street','Cross Street');
  t(4,5,'street','Cross Street');
  t(5,5,'wall','Wall');
  t(-5,4,'wall','Wall');
  t(-4,4,'building','Building');
  t(-3,4,'building','Building');
  t(-2,4,'building','Building');
  t(0,4,'street','Main Street');
  t(2,4,'building','Building');
  t(3,4,'building','Building');
  t(4,4,'building','Building');
  t(5,4,'wall','Wall');
  t(-5,3,'wall','Wall');
  t(-4,3,'building','Building');
  t(-3,3,'building','Building');
  t(-2,3,'building','Building');
  t(0,3,'street','Main Street');
  t(2,3,'building','Building');
  t(3,3,'building','Building');
  t(4,3,'building','Building');
  t(5,3,'wall','Wall');
  t(-5,2,'wall','Wall');
  t(-4,2,'building','Building');
  t(-3,2,'building','Building');
  t(-2,2,'building','Building');
  t(0,2,'street','Main Street');
  t(2,2,'building','Building');
  t(3,2,'building','Building');
  t(4,2,'building','Building');
  t(5,2,'wall','Wall');
  t(-5,1,'wall','Wall');
  t(0,1,'street','Main Street');
  t(5,1,'wall','Wall');
  t(-5,0,'wall','Wall');
  t(-4,0,'wall','Wall');
  t(-3,0,'wall','Wall');
  t(-2,0,'wall','Wall');
  t(-1,0,'wall','Wall');
  t(0,0,'gate','South Gate',{"exit":{"layer":"overworld","pos":{"x":139,"y":467}}});
  t(1,0,'wall','Wall');
  t(2,0,'wall','Wall');
  t(3,0,'wall','Wall');
  t(4,0,'wall','Wall');
  t(5,0,'wall','Wall');

  window.SETTLEMENTS['saltwell'] = {
    map: m,
    name: "Saltwell",
    hasWalls: true,
    entryPos: {x:0, y:2},
    overworldCell: {x:139, y:462},
    description: "",
  };
})();
