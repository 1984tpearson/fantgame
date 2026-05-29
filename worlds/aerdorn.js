(function(){
// ═══════════════════════════════════════════════════
// AERDORN — WORLD DATA  
// Grid: 4000 x 7100 squares @ ~35m per square
// North = lower Y, South = higher Y, East = higher X, West = lower X
// IMAGE ALIGNMENT:
//   Map content area: pixel (8,38) to (561,1012) = 553x974px
//   px = 8 + gx*(553/4000),  py = 38 + gy*(974/7100)
// ═══════════════════════════════════════════════════

const WORLD_ID   = 'aerdorn';
const WORLD_NAME = 'The Kingdom of Aerdorn';

window.WORLD_MAP_IMAGE     = 'map.jfif';
window.WORLD_MAP_IMG_X0    = 8;
window.WORLD_MAP_IMG_Y0    = 38;
window.WORLD_MAP_IMG_W     = 553;
window.WORLD_MAP_IMG_H     = 974;
window.WORLD_MAP_GRID_W    = 4000;
window.WORLD_MAP_GRID_H    = 7100;
window.WORLD_MAP_IMG_ALPHA = 0.55;

// ── POINT-IN-POLYGON (ray casting) ──────────────────
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];
    if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi)) inside=!inside;
  }
  return inside;
}

// ── ISLAND OUTLINES ─────────────────────────────────
const ISLAND_OUTLINE = [
  [1967,948],[2200,960],[2450,1020],[2700,1100],[2900,1220],
  [3100,1380],[3250,1520],[3380,1700],[3450,1900],[3472,2100],
  [3450,2400],[3400,2700],[3350,2900],[3300,3100],[3250,3300],
  [3212,3528],[3180,3700],[3100,3900],[3000,4100],[2900,4250],
  [2800,4400],[2778,4500],[2700,4650],[2600,4800],[2450,4950],
  [2300,5050],[2100,5150],[1900,5300],[1800,5500],[1750,5700],
  [1750,5956],[1650,5900],[1500,5800],[1350,5650],[1200,5500],
  [1100,5350],[1050,5200],[1000,5050],[950,4900],[900,4700],
  [850,4500],[800,4300],[750,4100],[700,3900],[650,3700],
  [600,3500],[550,3300],[500,3100],[480,2900],[485,2700],
  [500,2500],[520,2300],[560,2100],[620,1900],[700,1700],
  [800,1550],[920,1400],[1050,1280],[1200,1180],[1400,1080],
  [1600,1000],[1800,960],[1967,948],
];
const ISLE_OF_KNOWLEDGE_POLY = [
  [360,990],[560,990],[600,1150],[560,1280],[400,1300],[320,1180],[360,990]
];
const ISLE_OF_LORE_POLY = [
  [3150,4650],[3380,4650],[3430,4826],[3380,5000],[3150,5000],[3100,4826],[3150,4650]
];

// ── TERRAIN REGIONS (priority order) ────────────────
const TERRAIN_REGIONS = [
  { poly:[[485,2200],[750,1600],[900,1650],[950,2000],[900,2300],[850,2600],[800,2900],[750,3200],[700,3500],[650,3700],[600,3900],[560,3500],[510,3200],[490,2900],[485,2200]], type:'peaks', name:'The Sunset Peaks' },
  { poly:[[950,2000],[1200,1800],[1500,1750],[1700,1800],[1900,1900],[1950,2100],[1900,2400],[1800,2700],[1700,3000],[1500,3200],[1300,3300],[1100,3300],[950,3100],[900,2800],[900,2400],[950,2000]], type:'forest', name:'The Verdant Heart' },
  { x1:950, y1:1900, x2:1350, y2:2500, type:'plains', name:'Aethel Plains' },
  { poly:[[2300,1200],[2900,1300],[3200,1600],[3350,1900],[3300,2300],[3200,2600],[3100,2900],[2900,3100],[2700,3200],[2500,3100],[2400,2900],[2350,2600],[2300,2300],[2250,2000],[2200,1700],[2300,1200]], type:'wilds', name:'The Eldritch Wilds' },
  { poly:[[1700,3300],[2000,3200],[2300,3300],[2500,3500],[2600,3700],[2600,4000],[2500,4200],[2300,4300],[2000,4300],[1800,4200],[1600,4000],[1550,3700],[1600,3500],[1700,3300]], type:'bog', name:'The Great Bog' },
  { poly:[[2600,3500],[2900,3400],[3100,3500],[3200,3700],[3200,4000],[3100,4200],[2900,4400],[2700,4500],[2600,4300],[2600,4000],[2600,3700],[2600,3500]], type:'fens', name:'The Shadow Fens' },
  { poly:[[1100,4800],[1500,4700],[1800,4700],[2000,4800],[2100,5000],[2100,5200],[2000,5400],[1800,5600],[1600,5600],[1400,5500],[1200,5300],[1050,5100],[1000,4950],[1100,4800]], type:'shore', name:'The Azure Shore' },
  { poly:[[1900,2100],[2100,2000],[2200,2200],[2150,2500],[2050,2800],[2000,3100],[1980,3400],[1970,3700],[1960,4000],[1950,4300],[1950,4600],[1900,4400],[1850,4100],[1850,3800],[1870,3500],[1880,3200],[1880,2900],[1870,2600],[1850,2300],[1900,2100]], type:'mountain', name:"The Wyvern's Spine" },
  { x1:1700, y1:950,  x2:2500, y2:1800, type:'plains',   name:'Northern Plains' },
  { x1:1300, y1:4600, x2:2000, y2:5000, type:'farmland', name:'Southern Farmlands' },
];

// ── ISLAND MEMBERSHIP CACHE ──────────────────────────
const _islandCache = new Map();
function isOnIsland(x, y) {
  const k=`${x},${y}`;
  if(_islandCache.has(k))return _islandCache.get(k);
  const r=pointInPoly(x,y,ISLAND_OUTLINE)||pointInPoly(x,y,ISLE_OF_KNOWLEDGE_POLY)||pointInPoly(x,y,ISLE_OF_LORE_POLY);
  _islandCache.set(k,r);return r;
}

// ── TERRAIN INFERENCE ────────────────────────────────
function inferTerrain(x, y) {
  if(!isOnIsland(x,y)) return {type:'ocean',name:''};
  if(pointInPoly(x,y,ISLE_OF_KNOWLEDGE_POLY)) return {type:'forest',name:'Isle of Knowledge'};
  if(pointInPoly(x,y,ISLE_OF_LORE_POLY))      return {type:'forest',name:'Isle of Lore'};
  for(const region of TERRAIN_REGIONS){
    const hit=region.poly?pointInPoly(x,y,region.poly):(x>=region.x1&&x<=region.x2&&y>=region.y1&&y<=region.y2);
    if(hit) return {type:region.type,name:region.name};
  }
  return {type:'plains',name:''};
}

// ═══════════════════════════════════════════════════
// WORLD META — Explicitly defined cells
// ═══════════════════════════════════════════════════
const WORLD_META = {};
function defCell(x,y,type,name=''){WORLD_META[`${x},${y}`]={type,name};}
function defLine(pts,type,name){for(const[x,y]of pts)defCell(x,y,type,name);}
function defRect(x1,y1,x2,y2,type,name=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)WORLD_META[`${x},${y}`]={type,name};}

// ── SETTLEMENTS ──────────────────────────────────────
defCell(1114,2092,'city',   'Aethel-Keep');
defCell(2076,1181,'town',   "Weaver's Deep");
defCell(1353,2311,'village','Wheatstone');
defCell(2025,3171,'castle', 'High-Crown Castle');
defCell(2488,1677,'town',   'Gladehome');
defCell(2705,3309,'town',   'Sylvanis-Root');
defCell(3212,3528,'town',   'Briar-Town');
defCell(2778,4447,'town',   'Frilar-Town');
defCell(2004,4352,'village','Theatfields');
defCell(1519,5154,'town',   'Harvestfell');
defCell(1331,3331,'village','Dunesedge');
defCell(1114,3696,'village','Saltwell');
defCell(2438,1873,'village','The Weeping Falls');
defCell(2200,2030,'ruins',  'The Forgotten Archives');

// ── SERPENT RIVER ────────────────────────────────────
(function(){
  const pts=[];
  for(let y=1300;y<=3003;y+=3){
    const bend=(y>2400)?((y-2400)*0.08):0;
    pts.push([Math.round(1808+bend+Math.sin(y*0.018)*10),y]);
  }
  defLine(pts,'river','Serpent River');
})();

// ── SUN KING'S HIGHWAY ───────────────────────────────
(function(){
  const pts=[];
  for(let y=1100;y<=4700;y+=2)
    pts.push([Math.round(2050+Math.sin(y*0.003)*60-(y>2500?(y-2500)*0.02:0)),y]);
  defLine(pts,'road',"The Sun King's Highway");
})();

// ── THE SERPENT'S PATH (to Aethel-Keep) ─────────────
(function(){
  const s=[1808,1728],e=[1114,2092];const pts=[];
  for(let i=0;i<=80;i++){const t=i/80;pts.push([Math.round(s[0]+(e[0]-s[0])*t+Math.sin(t*Math.PI*2)*30),Math.round(s[1]+(e[1]-s[1])*t)]);}
  defLine(pts,'road',"The Serpent's Path");
})();

// ── GLADEHOME ROAD ───────────────────────────────────
(function(){
  const pts=[];
  for(let x=2050;x<=2488;x+=2)pts.push([x,Math.round(1677+(x-2050)*0.3+Math.sin(x*0.05)*15)]);
  defLine(pts,'road','Gladehome Road');
})();

// ── MARSH ROAD (High-Crown to Sylvanis-Root) ─────────
(function(){
  const s=[2025,3171],e=[2705,3309];const pts=[];
  for(let i=0;i<=60;i++){const t=i/60;pts.push([Math.round(s[0]+(e[0]-s[0])*t),Math.round(s[1]+(e[1]-s[1])*t+Math.sin(t*Math.PI*3)*25)]);}
  defLine(pts,'road','Marsh Road');
})();

// ── MORAK ROAD (Sylvanis to Briar-Town) ──────────────
(function(){
  const s=[2705,3309],e=[3212,3528];const pts=[];
  for(let i=0;i<=50;i++){const t=i/50;pts.push([Math.round(s[0]+(e[0]-s[0])*t),Math.round(s[1]+(e[1]-s[1])*t+Math.sin(t*Math.PI*2)*20)]);}
  defLine(pts,'road','Morak Road');
})();

// ── KYESTER'S PATH (Briar-Town south) ────────────────
(function(){
  const pts=[];
  for(let y=3528;y<=4200;y+=2)pts.push([Math.round(3212-(y-3528)*0.08+Math.sin(y*0.02)*15),y]);
  defLine(pts,'road',"Kyester's Path");
})();

// ── SOUTHERN SHORE ROAD ──────────────────────────────
(function(){
  const pts=[];
  for(let x=1200;x<=2700;x+=2)pts.push([x,Math.round(4850+Math.sin(x*0.008)*80+Math.cos(x*0.015)*40)]);
  defLine(pts,'road','Shore Road');
})();

// ── THE LITTLE THREAD (bog road south) ───────────────
(function(){
  const s=[1953,4680],e=[1519,5154];const pts=[];
  for(let i=0;i<=60;i++){const t=i/60;pts.push([Math.round(s[0]+(e[0]-s[0])*t+Math.sin(t*Math.PI*4)*20),Math.round(s[1]+(e[1]-s[1])*t)]);}
  defLine(pts,'road','The Little Thread');
})();

// ── TRADE ROUTE (west coast) ─────────────────────────
(function(){
  const pts=[];
  for(let y=2092;y<=3696;y+=2)pts.push([Math.round(1050+Math.sin(y*0.005)*80+Math.cos(y*0.01)*40),y]);
  defLine(pts,'road','Trade Route');
})();

// ── NAMED SEA AREAS ──────────────────────────────────
defRect(1600,860,2500,940,'ocean','The Whispering Sea');
defRect(1200,6000,2800,6200,'ocean','The Sea of Storms');
defRect(0,2000,400,4000,'ocean','Aetherial Ocean');
defRect(3600,2000,4000,4000,'ocean','Aetherial Ocean');

// ═══════════════════════════════════════════════════
// SETTLEMENT MAPS
// entryPos: entering from south = start at bottom (low y in local map = y=0 = south gate)
// ═══════════════════════════════════════════════════
const SETTLEMENTS = {};

// ── AETHEL-KEEP ────────────────────────────────────────
(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-30;x<=30;x++){m[`${x},0`]={type:'wall',name:'South Wall'};m[`${x},60`]={type:'wall',name:'North Wall'};}
  for(let y=0;y<=60;y++){m[`-30,${y}`]={type:'wall',name:'West Wall'};m[`30,${y}`]={type:'wall',name:'East Wall'};}
  m[`0,0`]  ={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:1114,y:2093}}};
  m[`0,60`] ={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:1114,y:2091}}};
  m[`-30,30`]={type:'gate',name:'West Gate', exit:{layer:'overworld',pos:{x:1113,y:2092}}};
  m[`30,30`] ={type:'gate',name:'East Gate', exit:{layer:'overworld',pos:{x:1115,y:2092}}};
  for(let y=1;y<=59;y++)if(!m[`0,${y}`]||m[`0,${y}`].type!=='gate')m[`0,${y}`]={type:'street',name:"King's Road"};
  for(let x=-29;x<=29;x++)if(!m[`${x},30`]||m[`${x},30`].type!=='wall')m[`${x},30`]={type:'street',name:'Market Way'};
  sdef(-20,2,-2,14,'building','South Quarter');
  sdef(2,2,20,14,'docks','Docks Quarter');
  sdef(-25,15,-2,28,'courtyard','Market District');
  sdef(2,15,25,28,'building','Guild District');
  sdef(-25,32,-2,55,'courtyard','Temple District');
  sdef(2,32,25,55,'building','Castle Quarter');
  m[`-10,2`]={type:'door',name:'The Aethel Arms (Inn)',enter:{layer:'interior',id:'aethel_inn',entryPos:{x:2,y:1}}};
  m[`10,2`] ={type:'door',name:'Customs House',        enter:{layer:'interior',id:'aethel_customs',entryPos:{x:2,y:1}}};
  m[`-10,15`]={type:'door',name:"Merchants' Exchange", enter:{layer:'interior',id:'aethel_exchange',entryPos:{x:3,y:1}}};
  m[`10,15`] ={type:'door',name:'Armoury',             enter:{layer:'interior',id:'aethel_armoury',entryPos:{x:2,y:1}}};
  m[`-10,35`]={type:'door',name:'Temple of the Flame', enter:{layer:'interior',id:'aethel_temple',entryPos:{x:4,y:1}}};
  m[`10,35`] ={type:'door',name:'Keep Gatehouse',      enter:{layer:'interior',id:'aethel_keep_gate',entryPos:{x:3,y:1}}};
  SETTLEMENTS['aethel_keep']={map:m,name:'Aethel-Keep',entryPos:{x:0,y:2},overworldCell:{x:1114,y:2092}};
})();

// ── WEAVER'S DEEP ──────────────────────────────────────
(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-18;x<=18;x++){m[`${x},0`]={type:'wall',name:'Wall'};m[`${x},36`]={type:'wall',name:'Wall'};}
  for(let y=0;y<=36;y++){m[`-18,${y}`]={type:'wall',name:'Wall'};m[`18,${y}`]={type:'wall',name:'Wall'};}
  m[`0,0`] ={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:2076,y:1182}}};
  m[`0,36`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:2076,y:1180}}};
  for(let y=1;y<=35;y++)m[`0,${y}`]={type:'street',name:'High Street'};
  for(let x=-17;x<=17;x++)m[`${x},18`]={type:'street',name:'Cross Road'};
  sdef(-8,2,8,8,'market',"Market Square");
  sdef(-15,2,-2,8,'building',"Weaver's Hall");
  sdef(2,2,15,8,'building',"Fishmonger's Row");
  sdef(-15,20,-2,32,'building','The Deep Anchor');
  sdef(2,20,15,32,'building',"Tanner's Quarter");
  m[`-8,2`]={type:'door',name:"Weaver's Hall",    enter:{layer:'interior',id:'weavers_hall',  entryPos:{x:3,y:1}}};
  m[`-8,20`]={type:'door',name:'The Deep Anchor', enter:{layer:'interior',id:'weavers_inn',   entryPos:{x:2,y:1}}};
  m[`8,20`]= {type:'door',name:"Tanner's Shop",   enter:{layer:'interior',id:'weavers_tanner',entryPos:{x:1,y:1}}};
  SETTLEMENTS['weavers_deep']={map:m,name:"Weaver's Deep",entryPos:{x:0,y:2},overworldCell:{x:2076,y:1181}};
})();

// ── HIGH-CROWN CASTLE ──────────────────────────────────
(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-20;x<=20;x++){m[`${x},0`]={type:'wall',name:'Outer Wall'};m[`${x},40`]={type:'wall',name:'Outer Wall'};}
  for(let y=0;y<=40;y++){m[`-20,${y}`]={type:'wall',name:'Outer Wall'};m[`20,${y}`]={type:'wall',name:'Outer Wall'};}
  m[`0,0`] ={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:2025,y:3172}}};
  m[`0,40`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:2025,y:3170}}};
  for(let y=1;y<=39;y++)m[`0,${y}`]={type:'street',name:'Castle Road'};
  sdef(-18,2,-2,18,'courtyard','Outer Bailey');
  sdef(2,2,18,18,'building','Barracks');
  sdef(-18,22,-2,38,'building','Great Hall');
  sdef(2,22,18,38,'building','Royal Quarters');
  m[`-8,2`]={type:'door',name:"Steward's Office",enter:{layer:'interior',id:'highcrown_steward',entryPos:{x:2,y:1}}};
  m[`8,2`]= {type:'door',name:'Barracks',         enter:{layer:'interior',id:'highcrown_barracks',entryPos:{x:2,y:1}}};
  m[`-8,22`]={type:'door',name:'Great Hall',      enter:{layer:'interior',id:'highcrown_hall',entryPos:{x:4,y:1}}};
  m[`8,22`]= {type:'door',name:'Royal Quarters',  enter:{layer:'interior',id:'highcrown_royal',entryPos:{x:3,y:1}}};
  SETTLEMENTS['high_crown']={map:m,name:'High-Crown Castle',entryPos:{x:0,y:2},overworldCell:{x:2025,y:3171}};
})();

// ── GLADEHOME ──────────────────────────────────────────
(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-12;x<=12;x++){m[`${x},0`]={type:'wall',name:'Palisade'};m[`${x},24`]={type:'wall',name:'Palisade'};}
  for(let y=0;y<=24;y++){m[`-12,${y}`]={type:'wall',name:'Palisade'};m[`12,${y}`]={type:'wall',name:'Palisade'};}
  m[`0,0`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:2488,y:1678}}};
  for(let y=1;y<=23;y++)m[`0,${y}`]={type:'street',name:'Glade Road'};
  sdef(-10,2,-2,10,'building',"The Glad Cup (Inn)");
  sdef(2,2,10,10,'building','Herbalist');
  sdef(-10,14,-2,22,'building',"Woodcutter's Lodge");
  sdef(2,14,10,22,'market','Market Green');
  m[`-5,2`]={type:'door',name:'The Glad Cup',enter:{layer:'interior',id:'gladehome_inn',entryPos:{x:2,y:1}}};
  m[`5,2`]= {type:'door',name:'Herbalist',   enter:{layer:'interior',id:'gladehome_herbalist',entryPos:{x:1,y:1}}};
  SETTLEMENTS['gladehome']={map:m,name:'Gladehome',entryPos:{x:0,y:2},overworldCell:{x:2488,y:1677}};
})();

// ── SYLVANIS-ROOT ──────────────────────────────────────
(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-14;x<=14;x++){m[`${x},0`]={type:'wall',name:'Bark Wall'};m[`${x},28`]={type:'wall',name:'Bark Wall'};}
  for(let y=0;y<=28;y++){m[`-14,${y}`]={type:'wall',name:'Bark Wall'};m[`14,${y}`]={type:'wall',name:'Bark Wall'};}
  m[`0,0`] ={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:2705,y:3310}}};
  m[`0,28`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:2705,y:3308}}};
  for(let y=1;y<=27;y++)m[`0,${y}`]={type:'street',name:'Root Way'};
  sdef(-12,2,-2,12,'building','Sylvan Lodge (Inn)');
  sdef(2,2,12,12,'building','Root Apothecary');
  sdef(-12,16,-2,26,'courtyard','The Old Grove');
  sdef(2,16,12,26,'building',"Hunters' Hall");
  m[`-5,2`]={type:'door',name:'Sylvan Lodge',    enter:{layer:'interior',id:'sylvanis_inn',entryPos:{x:2,y:1}}};
  m[`5,2`]= {type:'door',name:'Root Apothecary', enter:{layer:'interior',id:'sylvanis_apothecary',entryPos:{x:1,y:1}}};
  m[`5,16`]={type:'door',name:"Hunters' Hall",   enter:{layer:'interior',id:'sylvanis_hunters',entryPos:{x:2,y:1}}};
  SETTLEMENTS['sylvanis_root']={map:m,name:'Sylvanis-Root',entryPos:{x:0,y:2},overworldCell:{x:2705,y:3309}};
})();

// ── BRIAR-TOWN ─────────────────────────────────────────
(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-16;x<=16;x++){m[`${x},0`]={type:'wall',name:'Wall'};m[`${x},32`]={type:'wall',name:'Wall'};}
  for(let y=0;y<=32;y++){m[`-16,${y}`]={type:'wall',name:'Wall'};m[`16,${y}`]={type:'wall',name:'Wall'};}
  m[`0,0`] ={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:3212,y:3529}}};
  m[`0,32`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:3212,y:3527}}};
  for(let y=1;y<=31;y++)m[`0,${y}`]={type:'street',name:'Briar Street'};
  for(let x=-15;x<=15;x++)m[`${x},16`]={type:'street',name:'Fens Road'};
  sdef(-14,2,-2,14,'building','The Briar Thorn (Inn)');
  sdef(2,2,14,14,'market','Market');
  sdef(-14,18,-2,30,'building','Militia Barracks');
  sdef(2,18,14,30,'building','Trading Post');
  m[`-6,2`]={type:'door',name:'The Briar Thorn',  enter:{layer:'interior',id:'briar_inn',entryPos:{x:2,y:1}}};
  m[`6,2`]= {type:'door',name:'Market Hall',       enter:{layer:'interior',id:'briar_market',entryPos:{x:3,y:1}}};
  m[`-6,18`]={type:'door',name:'Militia Barracks', enter:{layer:'interior',id:'briar_barracks',entryPos:{x:2,y:1}}};
  m[`6,18`]= {type:'door',name:'Trading Post',     enter:{layer:'interior',id:'briar_trading',entryPos:{x:2,y:1}}};
  SETTLEMENTS['briar_town']={map:m,name:'Briar-Town',entryPos:{x:0,y:2},overworldCell:{x:3212,y:3528}};
})();

// ── FRILAR-TOWN ────────────────────────────────────────
(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-12;x<=12;x++){m[`${x},0`]={type:'wall',name:'Wall'};m[`${x},24`]={type:'wall',name:'Wall'};}
  for(let y=0;y<=24;y++){m[`-12,${y}`]={type:'wall',name:'Wall'};m[`12,${y}`]={type:'wall',name:'Wall'};}
  m[`0,0`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:2778,y:4448}}};
  for(let y=1;y<=23;y++)m[`0,${y}`]={type:'street',name:'Shore Street'};
  sdef(-10,2,-2,10,'building','The Shadow Flask (Inn)');
  sdef(2,2,10,10,'building',"Fisherman's Store");
  sdef(-10,14,-2,22,'building','Fens Watch Post');
  sdef(2,14,10,22,'market','Fish Market');
  m[`-5,2`]={type:'door',name:'The Shadow Flask',   enter:{layer:'interior',id:'frilar_inn',entryPos:{x:2,y:1}}};
  m[`5,2`]= {type:'door',name:"Fisherman's Store",  enter:{layer:'interior',id:'frilar_store',entryPos:{x:1,y:1}}};
  SETTLEMENTS['frilar_town']={map:m,name:'Frilar-Town',entryPos:{x:0,y:2},overworldCell:{x:2778,y:4447}};
})();

// ── HARVESTFELL ────────────────────────────────────────
(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-14;x<=14;x++){m[`${x},0`]={type:'wall',name:'Wall'};m[`${x},28`]={type:'wall',name:'Wall'};}
  for(let y=0;y<=28;y++){m[`-14,${y}`]={type:'wall',name:'Wall'};m[`14,${y}`]={type:'wall',name:'Wall'};}
  m[`0,0`] ={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:1519,y:5155}}};
  m[`0,28`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:1519,y:5153}}};
  for(let y=1;y<=27;y++)m[`0,${y}`]={type:'street',name:'Harvest Road'};
  for(let x=-13;x<=13;x++)m[`${x},14`]={type:'street',name:'Shore Way'};
  sdef(-12,2,-2,12,'building','The Golden Sheaf (Inn)');
  sdef(2,2,12,12,'market','Harvest Market');
  sdef(-12,16,-2,26,'building','Temple of the Sea');
  sdef(2,16,12,26,'docks','South Docks');
  m[`-5,2`]={type:'door',name:'The Golden Sheaf',  enter:{layer:'interior',id:'harvestfell_inn',entryPos:{x:2,y:1}}};
  m[`5,2`]= {type:'door',name:'Harvest Market',    enter:{layer:'interior',id:'harvestfell_market',entryPos:{x:3,y:1}}};
  m[`-5,16`]={type:'door',name:'Temple of the Sea',enter:{layer:'interior',id:'harvestfell_temple',entryPos:{x:3,y:1}}};
  SETTLEMENTS['harvestfell']={map:m,name:'Harvestfell',entryPos:{x:0,y:2},overworldCell:{x:1519,y:5154}};
})();

// ── SMALL SETTLEMENTS ──────────────────────────────────
(function(){
  // THEATFIELDS
  const m={};
  for(let y=0;y<=12;y++)m[`0,${y}`]={type:'street',name:'Village Lane'};
  for(let x=-5;x<=5;x++)m[`${x},6`]={type:'street',name:'Village Lane'};
  m[`0,6`]={type:'courtyard',name:'Village Well'};
  [[3,2],[3,8],[-3,2],[-3,8]].forEach(([x,y])=>{
    for(let dx=0;dx<=2;dx++)for(let dy=0;dy<=2;dy++)m[`${x+dx},${y+dy}`]={type:'building',name:'Dwelling'};
  });
  m[`3,2`]={type:'door',name:'The Thatch & Barrel (Inn)',enter:{layer:'interior',id:'theatfields_inn',entryPos:{x:1,y:1}}};
  SETTLEMENTS['theatfields']={map:m,name:'Theatfields',entryPos:{x:0,y:0},overworldCell:{x:2004,y:4352}};
})();

(function(){
  // DUNESEDGE
  const m={};
  for(let y=0;y<=10;y++)m[`0,${y}`]={type:'street',name:'Dune Road'};
  for(let x=-4;x<=4;x++)m[`${x},5`]={type:'street',name:'Dune Road'};
  m[`0,5`]={type:'courtyard',name:'Village Centre'};
  [[-3,2],[-3,7],[3,2],[3,7]].forEach(([x,y])=>{
    for(let dx=0;dx<=1;dx++)for(let dy=0;dy<=1;dy++)m[`${x+dx},${y+dy}`]={type:'building',name:'Dwelling'};
  });
  m[`-3,2`]={type:'door',name:'The Dusty Boot (Inn)',enter:{layer:'interior',id:'dunesedge_inn',entryPos:{x:1,y:1}}};
  SETTLEMENTS['dunesedge']={map:m,name:'Dunesedge',entryPos:{x:0,y:0},overworldCell:{x:1331,y:3331}};
})();

(function(){
  // SALTWELL
  const m={};
  for(let y=0;y<=8;y++)m[`0,${y}`]={type:'street',name:'Salt Road'};
  for(let x=-3;x<=3;x++)m[`${x},4`]={type:'street',name:'Salt Road'};
  m[`0,4`]={type:'courtyard',name:'The Salt Well'};
  m[`-2,2`]={type:'door',name:'Salt House',enter:{layer:'interior',id:'saltwell_inn',entryPos:{x:1,y:1}}};
  m[`-1,2`]={type:'building',name:'Salt House'};m[`-2,3`]={type:'building',name:'Salt House'};m[`-1,3`]={type:'building',name:'Salt House'};
  m[`2,5`]={type:'building',name:"Fisher's Hut"};m[`3,5`]={type:'building',name:"Fisher's Hut"};
  m[`2,6`]={type:'building',name:"Fisher's Hut"};m[`3,6`]={type:'building',name:"Fisher's Hut"};
  SETTLEMENTS['saltwell']={map:m,name:'Saltwell',entryPos:{x:0,y:0},overworldCell:{x:1114,y:3696}};
})();

(function(){
  // WHEATSTONE
  const m={};
  for(let y=0;y<=10;y++)m[`0,${y}`]={type:'street',name:'Wheat Lane'};
  for(let x=-5;x<=5;x++)m[`${x},5`]={type:'street',name:'Wheat Lane'};
  m[`0,5`]={type:'courtyard',name:'Grain Square'};
  [[-4,2],[4,2],[-4,7],[4,7]].forEach(([x,y])=>{
    for(let dx=0;dx<=2;dx++)for(let dy=0;dy<=2;dy++)m[`${x+dx},${y+dy}`]={type:'building',name:'Farmhouse'};
  });
  m[`-4,2`]={type:'door',name:'The Wheat Sheaf (Inn)',enter:{layer:'interior',id:'wheatstone_inn',entryPos:{x:1,y:1}}};
  SETTLEMENTS['wheatstone']={map:m,name:'Wheatstone',entryPos:{x:0,y:0},overworldCell:{x:1353,y:2311}};
})();

// ═══════════════════════════════════════════════════
// OVERWORLD → SETTLEMENT LOOKUP
// ═══════════════════════════════════════════════════
const OVERWORLD_TO_SETTLEMENT = {};
(function(){
  const entries = {
    'aethel_keep':   [1114,2092], 'weavers_deep': [2076,1181],
    'wheatstone':    [1353,2311], 'high_crown':   [2025,3171],
    'gladehome':     [2488,1677], 'sylvanis_root':[2705,3309],
    'briar_town':    [3212,3528], 'frilar_town':  [2778,4447],
    'theatfields':   [2004,4352], 'harvestfell':  [1519,5154],
    'dunesedge':     [1331,3331], 'saltwell':     [1114,3696],
  };
  for(const[id,[x,y]]of Object.entries(entries))
    OVERWORLD_TO_SETTLEMENT[`${x},${y}`]=id;
})();

// ═══════════════════════════════════════════════════
// NPC TEMPLATES
// ═══════════════════════════════════════════════════
const NPC_TEMPLATES = {
  'innkeeper_aethel':{
    id:'innkeeper_aethel',name:'Dara Fenn',role:'Innkeeper, The Aethel Arms',
    faction:'aethel_citizens',emoji:'🏠',
    personality:'Sturdy northern woman. Blunt but fair. Knows every face that passes through. Keeps secrets for coin.',
    schedule:[{timeStart:6,timeEnd:24,layer:'interior',settlementId:'aethel_keep',posKey:'aethel_inn'}],
    trader:{stock:[
      {name:'Bed for the Night',basePriceCp:60,stock:99},{name:'Hot Stew',basePriceCp:10,stock:99},
      {name:'Aethel Ale',basePriceCp:5,stock:99},{name:'Healing Salve',basePriceCp:90,stock:3},
      {name:'Trail Rations (3 days)',basePriceCp:35,stock:5},
    ],buyRate:0.3,sellMarkup:1.4}
  },
  'gate_captain_aethel':{
    id:'gate_captain_aethel',name:'Cort Vane',role:'Gate Captain, South Gate',
    faction:'aethel_guard',emoji:'⚔',
    personality:'Veteran soldier. Seen too much. Trusts no one from the east. Fair to honest travellers. Rigid about the law.',
    schedule:[
      {timeStart:6,timeEnd:20,layer:'settlement',settlementId:'aethel_keep',posKey:'0,2'},
      {timeStart:20,timeEnd:6,layer:'interior',settlementId:'aethel_keep',posKey:'aethel_barracks'}
    ]
  },
  'archivist_ruins':{
    id:'archivist_ruins',name:'Mael the Pale',role:'Wandering Scholar',
    faction:'scholars',emoji:'📜',
    personality:'Obsessive. Mutters to himself. Knows things about the Old Kingdom that should be forgotten. Not dangerous. Probably.',
    schedule:[{timeStart:0,timeEnd:24,layer:'overworld',posKey:'2200,2030'}]
  },
  'innkeeper_harvestfell':{
    id:'innkeeper_harvestfell',name:'Tomas Brent',role:'Innkeeper, The Golden Sheaf',
    faction:'harvestfell_citizens',emoji:'🌾',
    personality:'Cheerful. Optimistic despite hard times. Deeply religious. Puts dried sea-flowers on every table.',
    schedule:[{timeStart:7,timeEnd:23,layer:'interior',settlementId:'harvestfell',posKey:'harvestfell_inn'}],
    trader:{stock:[
      {name:'Bed for the Night',basePriceCp:40,stock:99},{name:'Fish Stew',basePriceCp:8,stock:99},
      {name:'Southern Rum',basePriceCp:6,stock:99},{name:'Salt (pouch)',basePriceCp:20,stock:5},
    ],buyRate:0.25,sellMarkup:1.3}
  },
  'hunter_sylvanis':{
    id:'hunter_sylvanis',name:'Bryn of the Root',role:"Hunter, Hunters' Hall",
    faction:'sylvanis_citizens',emoji:'🏹',
    personality:"Quiet and watchful. Communicates in short, precise sentences. Deeply suspicious of city folk. Respects those who know the wild.",
    schedule:[{timeStart:8,timeEnd:18,layer:'interior',settlementId:'sylvanis_root',posKey:'sylvanis_hunters'}],
    trader:{stock:[
      {name:"Hunter's Shortbow",basePriceCp:450,stock:1},{name:'Arrow Bundle (24)',basePriceCp:36,stock:8},
      {name:'Skinning Knife',basePriceCp:120,stock:2},{name:'Dried Venison (3 days)',basePriceCp:28,stock:4},
      {name:'Wilds Salve (slow heal)',basePriceCp:70,stock:2},
    ],buyRate:0.4,sellMarkup:1.2}
  },
};

// ═══════════════════════════════════════════════════
// FACTIONS
// ═══════════════════════════════════════════════════
const FACTIONS = {
  aethel_guard:        {name:'Aethel City Guard',   color:'#7a9abf',rivals:['shadow_compact'],allies:['royal_court']},
  aethel_citizens:     {name:'Aethel Folk',          color:'#a0c878',rivals:[],allies:[]},
  royal_court:         {name:'Royal Court',           color:'#c9943a',rivals:['old_blood'],    allies:['aethel_guard']},
  old_blood:           {name:'Old Blood (nobles)',    color:'#9a70c0',rivals:['royal_court'],  allies:[]},
  shadow_compact:      {name:'Shadow Compact',        color:'#606080',rivals:['aethel_guard'], allies:[]},
  scholars:            {name:'The Scholars',          color:'#a0b8c8',rivals:[],allies:[]},
  sylvanis_citizens:   {name:'Sylvanis Folk',         color:'#70b870',rivals:[],allies:[]},
  harvestfell_citizens:{name:'Harvestfell Folk',      color:'#c8b060',rivals:[],allies:[]},
  briar_citizens:      {name:'Briar-Town Folk',       color:'#b09060',rivals:[],allies:[]},
  weavers_citizens:    {name:"Weaver's Deep Folk",    color:'#70a0b8',rivals:[],allies:[]},
};

// ═══════════════════════════════════════════════════
// EXPOSE TO ENGINE
// ═══════════════════════════════════════════════════
window.WORLD_DATA = {
  id:                    WORLD_ID,
  name:                  WORLD_NAME,
  meta:                  WORLD_META,
  inferTerrain:          inferTerrain,
  settlements:           SETTLEMENTS,
  overworldToSettlement: OVERWORLD_TO_SETTLEMENT,
  npcTemplates:          NPC_TEMPLATES,
  factions:              FACTIONS,
};

})();
