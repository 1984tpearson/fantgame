import re

path = r'C:\Users\1984t\OneDrive\Documents\GitHub\fantgame\worlds\aerdorn.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

OLD = """(function(){
  // EAST-PORT — 50×60 stub (placeholder for proper layout)
  // Overworld anchor: 346,556. 10m per tile. ~500m×600m.
  const m={};
  const W=50,H=60,hw=25;
  for(let x=-hw;x<=hw;x++){m[`${x},0`]={type:'wall',name:'South Wall'};m[`${x},${H}`]={type:'wall',name:'North Wall'};}
  for(let y=0;y<=H;y++){m[`-${hw},${y}`]={type:'wall',name:'West Wall'};m[`${hw},${y}`]={type:'wall',name:'East Wall'};}
  m[`0,0`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:346,y:557}}};
  m[`0,${H}`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:346,y:555}}};
  m[`-${hw},30`]={type:'gate',name:'West Gate',exit:{layer:'overworld',pos:{x:345,y:556}}};
  m[`${hw},30`]={type:'gate',name:'East Gate',exit:{layer:'overworld',pos:{x:347,y:556}}};
  for(let y=1;y<H;y++)m[`0,${y}`]={type:'street',name:'Harbour Street'};
  SETTLEMENTS['frilar_town']={map:m,name:'East-Port',entryPos:{x:0,y:2},overworldCell:{x:346,y:556}};
})();"""

NEW = """(function(){
// ═══════════════════════════════════════════════════
// EAST-PORT — full layout
// 50×60 tiles, 10m/tile (~500m×600m). No walls.
// x: -25(west) to +25(east/harbour). y: 0(south) to 60(north).
// Coordinate origin is the south road entry point.
//
// Districts:
//   Fishermen's Quarter  — NE  (x:5..24,  y:35..58)
//   Market District      — centre (x:-8..8, y:22..42)
//   Merchant Quarter     — NW  (x:-24..-9, y:35..58)
//   Residential          — SW  (x:-24..-9, y:2..22)
//   Tradesmen's Row      — SE  (x:9..24,   y:2..22)
//   Harbour / Docks      — E edge (x:22..25, y:10..50)
//
// Streets:
//   Harbour Street  — E-W spine, y=30
//   Fisher's Way    — N-S spine, x=0
//   Tanner's Lane   — N-S east,  x=10
//   Chapel Lane     — N-S west,  x=-10
//   Quay Road       — E-W south, y=12
//   Chandler's Walk — E-W north, y=48
// ═══════════════════════════════════════════════════
const m={};
function t(x,y,type,name,extra={}){m[`${x},${y}`]=Object.assign({type,name},extra);}
function rect(x1,y1,x2,y2,type,name,extra={}){
  for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)t(x,y,type,name,extra);
}

// ── STREETS ──────────────────────────────────────
// Harbour Street (E-W spine, y=30)
for(let x=-25;x<=21;x++)t(x,30,'street','Harbour Street');
// Fisher's Way (N-S spine, x=0)
for(let y=0;y<=60;y++)t(0,y,'street',"Fisher's Way");
// Tanner's Lane (N-S east, x=10)
for(let y=0;y<=60;y++)t(10,y,'street',"Tanner's Lane");
// Chapel Lane (N-S west, x=-10)
for(let y=0;y<=60;y++)t(-10,y,'street',"Chapel Lane");
// Quay Road (E-W south, y=12)
for(let x=-25;x<=21;x++)t(x,12,'street','Quay Road');
// Chandler's Walk (E-W north, y=48)
for(let x=-25;x<=21;x++)t(x,48,'street',"Chandler's Walk");
// Short connector lanes
for(let y=12;y<=30;y++)t(5,y,'street','Rope Lane');
for(let y=30;y<=48;y++)t(-5,y,'street','Salt Lane');
for(let y=12;y<=30;y++)t(15,y,'street','Smoker Lane');
for(let y=30;y<=48;y++)t(20,y,'street','Pier Lane');

// ── ROAD ENTRIES (open ends, no gates) ──────────
t(0,0,'road',"Fisher's Way");   // south entry
t(0,60,'road',"Fisher's Way");  // north entry
t(-25,30,'road','Harbour Street'); // west entry

// ── HARBOUR (east edge, natural inlet) ──────────
rect(22,8,25,52,'docks','East-Port Harbour');
t(22,30,'street','Harbour Street'); // street meets docks

// ── MARKET DISTRICT (centre) ─────────────────────
// Market square itself
rect(-7,23,7,29,'market','Market Square');
rect(-7,31,7,37,'market','Market Square');
// Key buildings around the square
t(-8,26,'building','The Salt & Sail Inn',{interiorType:'inn',doors:['east']});
t(-8,34,'building','Market Hall',{interiorType:'market_hall',doors:['east']});
t(8,26,'building','Chandler & Rope',{interiorType:'shop',doors:['west']});
t(8,34,'building','Spice Merchant',{interiorType:'shop',doors:['west']});
t(-4,22,'building',"Fletcher's Stall",{interiorType:'shop',doors:['north']});
t(4,22,'building','Grain Exchange',{interiorType:'shop',doors:['north']});
t(-4,38,'building','Apothecary',{interiorType:'shop',doors:['south']});
t(4,38,'building','Moneylender',{interiorType:'shop',doors:['south']});

// ── FISHERMEN'S QUARTER (NE) ─────────────────────
// Net sheds and cottages
rect(11,49,14,59,'building','Net Shed',{interiorType:'house',doors:['south']});
rect(16,49,19,59,'building','Net Shed',{interiorType:'house',doors:['south']});
rect(21,49,21,59,'building','Net Shed',{interiorType:'house',doors:['west']});
// Fishermen's cottages
t(11,43,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(13,43,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(15,43,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(17,43,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(19,43,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(21,43,'building',"Fisher's Cottage",{interiorType:'house',doors:['west']});
t(11,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(13,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(15,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(17,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(19,40,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
// Smokehouse — notable building
t(11,34,'building','Smokehouse',{interiorType:'shop',doors:['west','south']});
t(12,34,'building','Smokehouse',{interiorType:'shop',doors:['south']});

// ── MERCHANT QUARTER (NW) ────────────────────────
// Larger, well-spaced houses
t(-11,49,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-12,49,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-14,49,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-15,49,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-17,49,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-18,49,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-20,49,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-21,49,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-23,49,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-24,49,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-11,52,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-14,52,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-17,52,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-20,52,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-23,52,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-11,55,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-14,55,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-17,55,'building','Merchant House',{interiorType:'house',doors:['east','south']});
t(-20,55,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-23,55,'building','Merchant House',{interiorType:'house',doors:['east']});
// Notary/scribe — merchant quarter's functional building
t(-11,43,'building','Notary & Scribe',{interiorType:'shop',doors:['east','south']});
t(-12,43,'building','Notary & Scribe',{interiorType:'shop',doors:['south']});
t(-11,40,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-14,40,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-17,40,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-20,40,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-23,40,'building','Merchant House',{interiorType:'house',doors:['east']});

// ── RESIDENTIAL (SW) ─────────────────────────────
// Chapel — landmark
t(-11,20,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east','south']});
t(-12,20,'building','Chapel of the Tides',{interiorType:'chapel',doors:['south']});
t(-11,19,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east']});
t(-12,19,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east']});
// Ordinary houses
t(-11,15,'building','House',{interiorType:'house',doors:['east']});
t(-13,15,'building','House',{interiorType:'house',doors:['east']});
t(-15,15,'building','House',{interiorType:'house',doors:['east']});
t(-17,15,'building','House',{interiorType:'house',doors:['east']});
t(-19,15,'building','House',{interiorType:'house',doors:['east']});
t(-21,15,'building','House',{interiorType:'house',doors:['east']});
t(-23,15,'building','House',{interiorType:'house',doors:['east']});
t(-11,8,'building','House',{interiorType:'house',doors:['east','north']});
t(-13,8,'building','House',{interiorType:'house',doors:['north']});
t(-15,8,'building','House',{interiorType:'house',doors:['north']});
t(-17,8,'building','House',{interiorType:'house',doors:['north']});
t(-19,8,'building','House',{interiorType:'house',doors:['north']});
t(-21,8,'building','House',{interiorType:'house',doors:['north']});
t(-23,8,'building','House',{interiorType:'house',doors:['north']});
t(-11,5,'building','House',{interiorType:'house',doors:['east']});
t(-13,5,'building','House',{interiorType:'house',doors:['east']});
t(-15,5,'building','House',{interiorType:'house',doors:['east']});
t(-17,5,'building','House',{interiorType:'house',doors:['east']});
t(-19,5,'building','House',{interiorType:'house',doors:['east']});
t(-21,5,'building','House',{interiorType:'house',doors:['east']});
t(-23,5,'building','House',{interiorType:'house',doors:['east']});

// ── TRADESMEN'S ROW (SE) ─────────────────────────
// Blacksmith
t(11,20,'building','Blacksmith',{interiorType:'blacksmith',doors:['west','south']});
t(12,20,'building','Blacksmith',{interiorType:'blacksmith',doors:['south']});
t(11,19,'building','Blacksmith',{interiorType:'blacksmith',doors:['west']});
t(12,19,'building','Blacksmith',{interiorType:'blacksmith',doors:['west']});
// Bathhouse
t(14,20,'building','Bathhouse',{interiorType:'bathhouse',doors:['west','south']});
t(15,20,'building','Bathhouse',{interiorType:'bathhouse',doors:['south']});
t(14,19,'building','Bathhouse',{interiorType:'bathhouse',doors:['west']});
t(15,19,'building','Bathhouse',{interiorType:'bathhouse',doors:['west']});
// Tanner
t(11,15,'building','Tannery',{interiorType:'shop',doors:['west']});
t(12,15,'building','Tannery',{interiorType:'shop',doors:['west']});
// Carpenter
t(14,15,'building','Carpenter',{interiorType:'shop',doors:['west']});
t(15,15,'building','Carpenter',{interiorType:'shop',doors:['west']});
// Ordinary tradesmen houses
t(11,8,'building','House',{interiorType:'house',doors:['west','north']});
t(13,8,'building','House',{interiorType:'house',doors:['north']});
t(15,8,'building','House',{interiorType:'house',doors:['north']});
t(17,8,'building','House',{interiorType:'house',doors:['north']});
t(19,8,'building','House',{interiorType:'house',doors:['north']});
t(21,8,'building','House',{interiorType:'house',doors:['north']});
t(11,5,'building','House',{interiorType:'house',doors:['west']});
t(13,5,'building','House',{interiorType:'house',doors:['west']});
t(15,5,'building','House',{interiorType:'house',doors:['west']});
t(17,5,'building','House',{interiorType:'house',doors:['west']});
t(19,5,'building','House',{interiorType:'house',doors:['west']});
t(21,5,'building','House',{interiorType:'house',doors:['west']});

// ── HARBORMASTER (east, near docks) ──────────────
t(20,31,'building','Harbormaster',{interiorType:'harbormaster',doors:['west','south']});
t(20,32,'building','Harbormaster',{interiorType:'harbormaster',doors:['west']});
t(21,31,'building','Harbormaster',{interiorType:'harbormaster',doors:['south']});
t(21,32,'building','Harbormaster',{interiorType:'harbormaster',doors:['west']});

// ── OPEN GROUND / COURTYARD ──────────────────────
// Small plaza at main crossing
rect(-2,28,2,32,'courtyard','Town Crossing');
// Dockside open area
rect(16,27,21,29,'courtyard','Dockside Yard');
rect(16,31,21,33,'courtyard','Dockside Yard');

SETTLEMENTS['frilar_town']={
  map:m,
  name:'East-Port',
  entryPos:{x:0,y:2},
  overworldCell:{x:346,y:556},
  description:'A natural harbour town on the east coast. Smells of salt, smoke, and fish. The kind of place where you can find passage east if you have coin — or find trouble if you do not.',
};
})();"""

if OLD in content:
    content = content.replace(OLD, NEW)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched OK")
else:
    print("ERROR: old string not found")
