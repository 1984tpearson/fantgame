// THEATFIELDS — settlement map
// overworldCell: 250,544  walls: 12x12  hasWalls: true
(function(){
  window.SETTLEMENTS = window.SETTLEMENTS || {};
  const m = {};
  function t(x,y,type,name,extra={}){ m[`${x},${y}`] = Object.assign({type,name},extra); }

  // ── MAP CELLS ──────────────────────────────────────────────────────────────
  t(-6,12,'wall','Wall');
  t(-5,12,'wall','Wall');
  t(-4,12,'wall','Wall');
  t(-3,12,'wall','Wall');
  t(-2,12,'wall','Wall');
  t(-1,12,'wall','Wall');
  t(0,12,'gate','North Gate',{"exit":{"layer":"overworld","pos":{"x":250,"y":538}}});
  t(1,12,'wall','Wall');
  t(2,12,'wall','Wall');
  t(3,12,'wall','Wall');
  t(4,12,'wall','Wall');
  t(5,12,'wall','Wall');
  t(6,12,'wall','Wall');
  t(-6,11,'wall','Wall');
  t(0,11,'street','Main Street');
  t(6,11,'wall','Wall');
  t(-6,10,'wall','Wall');
  t(-5,10,'building','Building');
  t(-4,10,'building','Building');
  t(-3,10,'building','Building');
  t(-2,10,'building','Building');
  t(0,10,'street','Main Street');
  t(2,10,'building','Building');
  t(3,10,'door','The Thatch & Barrel',{"enter":{"layer":"interior","id":"theatfields_inn","entryPos":{"x":1,"y":1}}});
  t(4,10,'building','Building');
  t(5,10,'building','Building');
  t(6,10,'wall','Wall');
  t(-6,9,'wall','Wall');
  t(-5,9,'building','Building');
  t(-4,9,'building','Building');
  t(-3,9,'building','Building');
  t(-2,9,'building','Building');
  t(0,9,'street','Main Street');
  t(2,9,'building','Building');
  t(3,9,'building','Building');
  t(4,9,'building','Building');
  t(5,9,'building','Building');
  t(6,9,'wall','Wall');
  t(-6,8,'wall','Wall');
  t(-5,8,'building','Building');
  t(-4,8,'building','Building');
  t(-3,8,'building','Building');
  t(-2,8,'building','Building');
  t(0,8,'street','Main Street');
  t(2,8,'building','Building');
  t(3,8,'building','Building');
  t(4,8,'building','Building');
  t(5,8,'building','Building');
  t(6,8,'wall','Wall');
  t(-6,7,'wall','Wall');
  t(0,7,'street','Main Street');
  t(6,7,'wall','Wall');
  t(-6,6,'wall','Wall');
  t(-5,6,'street','Cross Street');
  t(-4,6,'street','Cross Street');
  t(-3,6,'street','Cross Street');
  t(-2,6,'street','Cross Street');
  t(-1,6,'street','Cross Street');
  t(0,6,'street','Cross Street');
  t(1,6,'street','Cross Street');
  t(2,6,'street','Cross Street');
  t(3,6,'street','Cross Street');
  t(4,6,'street','Cross Street');
  t(5,6,'street','Cross Street');
  t(6,6,'wall','Wall');
  t(-6,5,'wall','Wall');
  t(-5,5,'building','Building');
  t(-4,5,'building','Building');
  t(-3,5,'building','Building');
  t(-2,5,'building','Building');
  t(0,5,'street','Main Street');
  t(2,5,'building','Building');
  t(3,5,'building','Building');
  t(4,5,'building','Building');
  t(5,5,'building','Building');
  t(6,5,'wall','Wall');
  t(-6,4,'wall','Wall');
  t(-5,4,'building','Building');
  t(-4,4,'building','Building');
  t(-3,4,'building','Building');
  t(-2,4,'building','Building');
  t(0,4,'street','Main Street');
  t(2,4,'building','Building');
  t(3,4,'building','Building');
  t(4,4,'building','Building');
  t(5,4,'building','Building');
  t(6,4,'wall','Wall');
  t(-6,3,'wall','Wall');
  t(-5,3,'building','Building');
  t(-4,3,'building','Building');
  t(-3,3,'building','Building');
  t(-2,3,'building','Building');
  t(0,3,'street','Main Street');
  t(2,3,'building','Building');
  t(3,3,'building','Building');
  t(4,3,'building','Building');
  t(5,3,'building','Building');
  t(6,3,'wall','Wall');
  t(-6,2,'wall','Wall');
  t(-5,2,'building','Building');
  t(-4,2,'building','Building');
  t(-3,2,'building','Building');
  t(-2,2,'building','Building');
  t(0,2,'street','Main Street');
  t(2,2,'building','Building');
  t(3,2,'building','Building');
  t(4,2,'building','Building');
  t(5,2,'building','Building');
  t(6,2,'wall','Wall');
  t(-6,1,'wall','Wall');
  t(0,1,'street','Main Street');
  t(6,1,'wall','Wall');
  t(-6,0,'wall','Wall');
  t(-5,0,'wall','Wall');
  t(-4,0,'wall','Wall');
  t(-3,0,'wall','Wall');
  t(-2,0,'wall','Wall');
  t(-1,0,'wall','Wall');
  t(0,0,'gate','South Gate',{"exit":{"layer":"overworld","pos":{"x":250,"y":550}}});
  t(1,0,'wall','Wall');
  t(2,0,'wall','Wall');
  t(3,0,'wall','Wall');
  t(4,0,'wall','Wall');
  t(5,0,'wall','Wall');
  t(6,0,'wall','Wall');

  window.SETTLEMENTS['theatfields'] = {
    map: m,
    name: "Theatfields",
    hasWalls: true,
    entryPos: {x:0, y:2},
    overworldCell: {x:250, y:544},
    description: "",
  };
})();
