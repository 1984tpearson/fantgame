(function(){
// ═══════════════════════════════════════════════════
// AERDORN — WORLD DATA
// Grid: 500 x 888 squares (scaled down 8x from original)
// Each square ~280m. North=low Y, South=high Y, East=high X, West=low X
//
// IMAGE ALIGNMENT:
//   Map content: pixel (8,38) to (561,1012) = 553x974px
//   px = 8  + gx * (553/500)
//   py = 38 + gy * (974/888)
// ═══════════════════════════════════════════════════

const WORLD_ID   = 'aerdorn';
const WORLD_NAME = 'The Kingdom of Aerdorn';

window.WORLD_MAP_IMAGE     = 'map.jfif';
window.WORLD_MAP_IMG_X0    = 8;
window.WORLD_MAP_IMG_Y0    = 38;
window.WORLD_MAP_IMG_W     = 553;
window.WORLD_MAP_IMG_H     = 974;
window.WORLD_MAP_GRID_W    = 500;
window.WORLD_MAP_GRID_H    = 888;
window.WORLD_MAP_IMG_ALPHA = 0.60;

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];
    if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi)) inside=!inside;
  }
  return inside;
}

const ISLAND_OUTLINE = [
  [246,118],[275,120],[306,128],[338,138],[362,152],[388,172],[406,190],
  [422,212],[431,238],[434,262],[431,300],[425,338],[419,362],[412,388],
  [406,412],[402,441],[398,462],[388,488],[375,512],[362,531],[350,550],
  [347,562],[338,581],[325,600],[306,619],[288,631],[262,644],[238,662],
  [225,688],[219,712],[219,744],[206,738],[188,725],[169,706],[150,688],
  [138,669],[131,650],[125,631],[119,612],[112,588],[106,562],[100,538],
  [94,512],[88,488],[81,462],[75,438],[69,412],[62,388],[60,362],[61,338],
  [62,312],[65,288],[70,262],[78,238],[88,212],[100,194],[115,175],
  [131,160],[150,148],[175,135],[200,125],[225,120],[246,118],
];
const ISLE_OF_KNOWLEDGE_POLY=[[45,124],[70,124],[75,144],[70,160],[50,162],[40,148],[45,124]];
const ISLE_OF_LORE_POLY=[[394,581],[422,581],[429,603],[422,625],[394,625],[387,603],[394,581]];

const TERRAIN_REGIONS = [
  {poly:[[61,275],[94,200],[113,206],[119,250],[112,288],[106,325],[100,438],[88,450],[70,438],[64,362],[61,275]],type:'peaks',name:'The Sunset Peaks'},
  {poly:[[119,250],[150,225],[188,219],[213,225],[238,238],[244,262],[238,300],[225,338],[213,375],[188,400],[163,412],[138,412],[119,388],[113,350],[113,300],[119,250]],type:'forest',name:'The Verdant Heart'},
  {x1:119,y1:238,x2:169,y2:312,type:'plains',name:'Aethel Plains'},
  {poly:[[288,150],[362,162],[400,200],[419,238],[412,288],[400,325],[388,362],[362,388],[338,400],[312,388],[300,362],[294,325],[288,288],[281,250],[275,212],[288,150]],type:'wilds',name:'The Eldritch Wilds'},
  {poly:[[213,412],[250,400],[288,412],[312,438],[325,462],[325,500],[312,525],[288,538],[250,538],[225,525],[200,500],[194,462],[200,438],[213,412]],type:'bog',name:'The Great Bog'},
  {poly:[[325,438],[362,425],[388,438],[400,462],[400,500],[388,525],[362,550],[338,562],[325,538],[325,500],[325,462],[325,438]],type:'fens',name:'The Shadow Fens'},
  {poly:[[138,600],[188,588],[225,588],[250,600],[262,625],[262,650],[250,675],[225,700],[200,700],[175,688],[150,662],[131,638],[125,619],[138,600]],type:'shore',name:'The Azure Shore'},
  {poly:[[238,262],[262,250],[275,275],[269,312],[256,350],[250,388],[247,425],[246,500],[244,575],[238,550],[231,512],[231,475],[234,438],[235,400],[234,325],[231,288],[238,262]],type:'mountain',name:"The Wyvern's Spine"},
  {x1:213,y1:118,x2:312,y2:225,type:'plains',name:'Northern Plains'},
  {x1:163,y1:575,x2:250,y2:625,type:'farmland',name:'Southern Farmlands'},
];

const _ic=new Map();
function isOnIsland(x,y){const k=`${x},${y}`;if(_ic.has(k))return _ic.get(k);const r=pointInPoly(x,y,ISLAND_OUTLINE)||pointInPoly(x,y,ISLE_OF_KNOWLEDGE_POLY)||pointInPoly(x,y,ISLE_OF_LORE_POLY);_ic.set(k,r);return r;}

function inferTerrain(x,y){
  if(!isOnIsland(x,y))return{type:'ocean',name:''};
  if(pointInPoly(x,y,ISLE_OF_KNOWLEDGE_POLY))return{type:'forest',name:'Isle of Knowledge'};
  if(pointInPoly(x,y,ISLE_OF_LORE_POLY))return{type:'forest',name:'Isle of Lore'};
  for(const r of TERRAIN_REGIONS){
    const hit=r.poly?pointInPoly(x,y,r.poly):(x>=r.x1&&x<=r.x2&&y>=r.y1&&y<=r.y2);
    if(hit)return{type:r.type,name:r.name};
  }
  return{type:'plains',name:''};
}

const WORLD_META={};
function defCell(x,y,type,name=''){WORLD_META[`${x},${y}`]={type,name};}
function defLine(pts,type,name){for(const[x,y]of pts)defCell(x,y,type,name);}
function defRect(x1,y1,x2,y2,type,name=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)WORLD_META[`${x},${y}`]={type,name};}

defCell(139,262,'city','Aethel-Keep');
defCell(260,148,'town',"Weaver's Deep");
defCell(169,289,'village','Wheatstone');
defCell(253,396,'castle','High-Crown Castle');
defCell(311,210,'town','Gladehome');
defCell(338,414,'town','Sylvanis-Root');
defCell(400,439,'town','Briar-Town');
defCell(346,556,'town','East-Port');
defCell(250,544,'village','Theatfields');
defCell(190,644,'town','Harvestfell');
defCell(166,416,'village','Dunesedge');
defCell(139,462,'village','Saltwell');
defCell(275,254,'ruins','The Forgotten Archives');
defCell(305,234,'village','The Weeping Falls');

// ── SETTLEMENT FOOTPRINTS (multi-square overworld presence) ──
// Each settlement takes up a rect of squares on the overworld map.
// The type is set to match the settlement tier so the map colours correctly.
const _fp=[
  ['aethel_keep',  136,258,142,266,'city'],
  ['weavers_deep', 258,145,262,151,'town'],
  ['high_crown',   251,393,255,399,'castle'],
  ['gladehome',    310,208,312,212,'town'],
  ['sylvanis_root',337,412,339,416,'town'],
  ['briar_town',   400,439,401,440,'town'],
  ['frilar_town',  346,556,347,557,'town'],
  ['harvestfell',  188,642,192,646,'town'],
  ['theatfields',  249,543,251,545,'village'],
  ['dunesedge',    165,415,167,417,'village'],
  ['saltwell',     138,461,140,463,'village'],
  ['wheatstone',   168,288,170,290,'village'],
];
for(const[sid,x1,y1,x2,y2,t]of _fp)
  for(let _x=x1;_x<=x2;_x++)for(let _y=y1;_y<=y2;_y++)
    WORLD_META[`${_x},${_y}`]={type:t,name:sid};

(function(){const pts=[];for(let y=162;y<=375;y++){const bend=(y>300)?((y-300)*0.08):0;pts.push([Math.round(226+bend+Math.sin(y*0.14)*2),y]);}defLine(pts,'river','Serpent River');})();
(function(){const pts=[];for(let y=138;y<=588;y++)pts.push([Math.round(256+Math.sin(y*0.024)*8-(y>312?(y-312)*0.015:0)),y]);defLine(pts,'road',"The Sun King's Highway");})();
(function(){const s=[226,216],e=[139,262];const pts=[];for(let i=0;i<=40;i++){const t=i/40;pts.push([Math.round(s[0]+(e[0]-s[0])*t+Math.sin(t*Math.PI*2)*4),Math.round(s[1]+(e[1]-s[1])*t)]);}defLine(pts,'road',"The Serpent's Path");})();
(function(){const pts=[];for(let x=256;x<=311;x++)pts.push([x,Math.round(210+(x-256)*0.3+Math.sin(x*0.4)*2)]);defLine(pts,'road','Gladehome Road');})();
(function(){const s=[253,396],e=[338,414];const pts=[];for(let i=0;i<=50;i++){const t=i/50;pts.push([Math.round(s[0]+(e[0]-s[0])*t),Math.round(s[1]+(e[1]-s[1])*t+Math.sin(t*Math.PI*3)*3)]);}defLine(pts,'road','Marsh Road');})();
(function(){const s=[338,414],e=[402,441];const pts=[];for(let i=0;i<=40;i++){const t=i/40;pts.push([Math.round(s[0]+(e[0]-s[0])*t),Math.round(s[1]+(e[1]-s[1])*t+Math.sin(t*Math.PI*2)*3)]);}defLine(pts,'road','Morak Road');})();
(function(){const pts=[];for(let y=441;y<=525;y++)pts.push([Math.round(402-(y-441)*0.08+Math.sin(y*0.16)*2),y]);defLine(pts,'road',"Kyester's Path");})();
(function(){const pts=[];for(let x=150;x<=338;x++)pts.push([x,Math.round(606+Math.sin(x*0.06)*10+Math.cos(x*0.12)*5)]);defLine(pts,'road','Shore Road');})();
(function(){const s=[244,585],e=[190,644];const pts=[];for(let i=0;i<=40;i++){const t=i/40;pts.push([Math.round(s[0]+(e[0]-s[0])*t+Math.sin(t*Math.PI*4)*3),Math.round(s[1]+(e[1]-s[1])*t)]);}defLine(pts,'road','The Little Thread');})();
(function(){const pts=[];for(let y=262;y<=462;y++)pts.push([Math.round(131+Math.sin(y*0.04)*10+Math.cos(y*0.08)*5),y]);defLine(pts,'road','Trade Route');})();

defRect(175,108,312,118,'ocean','The Whispering Sea');
defRect(150,750,350,775,'ocean','The Sea of Storms');
defRect(0,250,50,500,'ocean','Aetherial Ocean');
defRect(450,250,500,500,'ocean','Aetherial Ocean');
// East-Port harbour — 1 wide, 2 tall, immediately east of 2x2 town (x=348, y=556-557)
defRect(348,556,348,557,'docks','East-Port Harbour');

const SETTLEMENTS={};
function makeSimpleTown(id,name,wx,wy,walls,doors){
  const m={};const hw=Math.floor(walls/2);
  for(let x=-hw;x<=hw;x++){m[`${x},0`]={type:'wall',name:'Wall'};m[`${x},${walls}`]={type:'wall',name:'Wall'};}
  for(let y=0;y<=walls;y++){m[`-${hw},${y}`]={type:'wall',name:'Wall'};m[`${hw},${y}`]={type:'wall',name:'Wall'};}
  const _fh=Math.floor(walls/4)+3;m[`0,0`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:wx,y:wy-_fh}}};
  m[`0,${walls}`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:wx,y:wy+_fh}}};
  for(let y=1;y<walls;y++)m[`0,${y}`]={type:'street',name:'Main Street'};
  const mid=Math.floor(walls/2);
  for(let x=-(hw-1);x<=(hw-1);x++)m[`${x},${mid}`]={type:'street',name:'Cross Street'};
  for(let x=-(hw-1);x<=-2;x++)for(let y=2;y<mid-1;y++)m[`${x},${y}`]={type:'building',name:'Building'};
  for(let x=2;x<=(hw-1);x++)for(let y=2;y<mid-1;y++)m[`${x},${y}`]={type:'building',name:'Building'};
  for(let x=-(hw-1);x<=-2;x++)for(let y=mid+1;y<walls-1;y++)m[`${x},${y}`]={type:'building',name:'Building'};
  for(let x=2;x<=(hw-1);x++)for(let y=mid+1;y<walls-1;y++)m[`${x},${y}`]={type:'building',name:'Building'};
  for(const[dx,dy,dn,did]of doors)m[`${dx},${dy}`]={type:'door',name:dn,enter:{layer:'interior',id:did,entryPos:{x:1,y:1}}};
  SETTLEMENTS[id]={map:m,name,entryPos:{x:0,y:2},overworldCell:{x:wx,y:wy}};
}

(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-30;x<=30;x++){m[`${x},0`]={type:'wall',name:'South Wall'};m[`${x},60`]={type:'wall',name:'North Wall'};}
  for(let y=0;y<=60;y++){m[`-30,${y}`]={type:'wall',name:'West Wall'};m[`30,${y}`]={type:'wall',name:'East Wall'};}
  m[`0,0`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:139,y:257}}};
  m[`0,60`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:139,y:267}}};
  m[`-30,30`]={type:'gate',name:'West Gate',exit:{layer:'overworld',pos:{x:135,y:262}}};
  m[`30,30`]={type:'gate',name:'East Gate',exit:{layer:'overworld',pos:{x:143,y:262}}};
  for(let y=1;y<=59;y++)m[`0,${y}`]={type:'street',name:"King's Road"};
  for(let x=-29;x<=29;x++)if(!m[`${x},30`]||m[`${x},30`].type!=='wall')m[`${x},30`]={type:'street',name:'Market Way'};
  sdef(-20,2,-2,14,'building','South Quarter');sdef(2,2,20,14,'docks','Docks Quarter');
  sdef(-25,15,-2,28,'courtyard','Market District');sdef(2,15,25,28,'building','Guild District');
  sdef(-25,32,-2,55,'courtyard','Temple District');sdef(2,32,25,55,'building','Castle Quarter');
  m[`-10,2`]={type:'door',name:'The Aethel Arms',enter:{layer:'interior',id:'aethel_inn',entryPos:{x:2,y:1}}};
  m[`10,2`]={type:'door',name:'Customs House',enter:{layer:'interior',id:'aethel_customs',entryPos:{x:2,y:1}}};
  m[`-10,15`]={type:'door',name:"Merchants' Exchange",enter:{layer:'interior',id:'aethel_exchange',entryPos:{x:3,y:1}}};
  m[`10,15`]={type:'door',name:'Armoury',enter:{layer:'interior',id:'aethel_armoury',entryPos:{x:2,y:1}}};
  m[`-10,35`]={type:'door',name:'Temple of the Flame',enter:{layer:'interior',id:'aethel_temple',entryPos:{x:4,y:1}}};
  m[`10,35`]={type:'door',name:'Keep Gatehouse',enter:{layer:'interior',id:'aethel_keep_gate',entryPos:{x:3,y:1}}};
  SETTLEMENTS['aethel_keep']={map:m,name:'Aethel-Keep',entryPos:{x:0,y:2},overworldCell:{x:139,y:262}};
})();

(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-18;x<=18;x++){m[`${x},0`]={type:'wall',name:'Wall'};m[`${x},36`]={type:'wall',name:'Wall'};}
  for(let y=0;y<=36;y++){m[`-18,${y}`]={type:'wall',name:'Wall'};m[`18,${y}`]={type:'wall',name:'Wall'};}
  m[`0,0`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:260,y:144}}};
  m[`0,36`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:260,y:152}}};
  for(let y=1;y<=35;y++)m[`0,${y}`]={type:'street',name:'High Street'};
  for(let x=-17;x<=17;x++)m[`${x},18`]={type:'street',name:'Cross Road'};
  sdef(-8,2,8,8,'market','Market Square');sdef(-15,2,-2,8,'building',"Weaver's Hall");
  sdef(2,2,15,8,'building',"Fishmonger's Row");sdef(-15,20,-2,32,'building','The Deep Anchor');
  sdef(2,20,15,32,'building',"Tanner's Quarter");
  m[`-8,2`]={type:'door',name:"Weaver's Hall",enter:{layer:'interior',id:'weavers_hall',entryPos:{x:3,y:1}}};
  m[`-8,20`]={type:'door',name:'The Deep Anchor',enter:{layer:'interior',id:'weavers_inn',entryPos:{x:2,y:1}}};
  m[`8,20`]={type:'door',name:"Tanner's Shop",enter:{layer:'interior',id:'weavers_tanner',entryPos:{x:1,y:1}}};
  SETTLEMENTS['weavers_deep']={map:m,name:"Weaver's Deep",entryPos:{x:0,y:2},overworldCell:{x:260,y:148}};
})();

(function(){
  const m={};
  function sdef(x1,y1,x2,y2,t,n){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type:t,name:n};}
  for(let x=-20;x<=20;x++){m[`${x},0`]={type:'wall',name:'Outer Wall'};m[`${x},40`]={type:'wall',name:'Outer Wall'};}
  for(let y=0;y<=40;y++){m[`-20,${y}`]={type:'wall',name:'Outer Wall'};m[`20,${y}`]={type:'wall',name:'Outer Wall'};}
  m[`0,0`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:253,y:392}}};
  m[`0,40`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:253,y:400}}};
  for(let y=1;y<=39;y++)m[`0,${y}`]={type:'street',name:'Castle Road'};
  sdef(-18,2,-2,18,'courtyard','Outer Bailey');sdef(2,2,18,18,'building','Barracks');
  sdef(-18,22,-2,38,'building','Great Hall');sdef(2,22,18,38,'building','Royal Quarters');
  m[`-8,2`]={type:'door',name:"Steward's Office",enter:{layer:'interior',id:'highcrown_steward',entryPos:{x:2,y:1}}};
  m[`8,2`]={type:'door',name:'Barracks',enter:{layer:'interior',id:'highcrown_barracks',entryPos:{x:2,y:1}}};
  m[`-8,22`]={type:'door',name:'Great Hall',enter:{layer:'interior',id:'highcrown_hall',entryPos:{x:4,y:1}}};
  m[`8,22`]={type:'door',name:'Royal Quarters',enter:{layer:'interior',id:'highcrown_royal',entryPos:{x:3,y:1}}};
  SETTLEMENTS['high_crown']={map:m,name:'High-Crown Castle',entryPos:{x:0,y:2},overworldCell:{x:253,y:396}};
})();

makeSimpleTown('gladehome','Gladehome',311,210,24,[[-8,2,'The Glad Cup (Inn)','gladehome_inn'],[8,2,'Herbalist','gladehome_herbalist']]);
makeSimpleTown('sylvanis_root','Sylvanis-Root',338,414,28,[[-8,2,'Sylvan Lodge','sylvanis_inn'],[8,2,'Root Apothecary','sylvanis_apothecary'],[8,16,"Hunters' Hall",'sylvanis_hunters']]);
(function(){
  // BRIAR-TOWN — 50×60 stub (placeholder for proper layout)
  // Overworld anchor: 400,439. 10m per tile. ~500m×600m.
  const m={};
  const W=50,H=60,hw=25;
  for(let x=-hw;x<=hw;x++){m[`${x},0`]={type:'wall',name:'South Wall'};m[`${x},${H}`]={type:'wall',name:'North Wall'};}
  for(let y=0;y<=H;y++){m[`-${hw},${y}`]={type:'wall',name:'West Wall'};m[`${hw},${y}`]={type:'wall',name:'East Wall'};}
  m[`0,0`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:400,y:440}}};
  m[`0,${H}`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:400,y:438}}};
  m[`-${hw},30`]={type:'gate',name:'West Gate',exit:{layer:'overworld',pos:{x:399,y:439}}};
  m[`${hw},30`]={type:'gate',name:'East Gate',exit:{layer:'overworld',pos:{x:401,y:439}}};
  for(let y=1;y<H;y++)m[`0,${y}`]={type:'street',name:'Morak Street'};
  SETTLEMENTS['briar_town']={map:m,name:'Briar-Town',entryPos:{x:0,y:2},overworldCell:{x:400,y:439}};
})();
(function(){
// ═══════════════════════════════════════════════════
// EAST-PORT — full layout
// 28×28 tiles, 20m/tile (~560m×560m). No walls.
// x: -14(west) to +14(east/harbour). y: 0(south) to 28(north).
//
// Districts:
//   Fishermen's Quarter  — NE  (x:5..13, y:16..26)
//   Market District      — centre (x:-4..4, y:10..18)
//   Merchant Quarter     — NW  (x:-13..-5, y:16..26)
//   Residential          — SW  (x:-13..-5, y:2..12)
//   Tradesmen's Row      — SE  (x:5..13, y:2..12)
//   Harbour / Docks      — E edge (x:12..13, y:4..24)
//
// Streets:
//   Harbour Street  — E-W spine, y=14
//   Fisher's Way    — N-S spine, x=0
//   Tanner's Lane   — N-S east,  x=5
//   Chapel Lane     — N-S west,  x=-5
//   Quay Road       — E-W south, y=6
//   Chandler's Walk — E-W north, y=22
// ═══════════════════════════════════════════════════
const m={};
function t(x,y,type,name,extra={}){m[`${x},${y}`]=Object.assign({type,name},extra);}
function rect(x1,y1,x2,y2,type,name,extra={}){
  for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)t(x,y,type,name,extra);
}

// ── STREETS ────────────────────────────────────────────
for(let x=-14;x<=12;x++)t(x,14,'street','Harbour Street');
for(let y=0;y<=28;y++)t(0,y,'street',"Fisher's Way");
for(let y=0;y<=28;y++)t(5,y,'street',"Tanner's Lane");
for(let y=0;y<=28;y++)t(-5,y,'street',"Chapel Lane");
for(let x=-14;x<=12;x++)t(x,6,'street','Quay Road');
for(let x=-14;x<=12;x++)t(x,22,'street',"Chandler's Walk");
for(let y=6;y<=14;y++)t(3,y,'street','Rope Lane');
for(let y=14;y<=22;y++)t(-3,y,'street','Salt Lane');
for(let y=6;y<=14;y++)t(8,y,'street','Smoker Lane');
for(let y=14;y<=22;y++)t(10,y,'street','Pier Lane');

// ── ROAD ENTRIES ─────────────────────────────────────────
t(0,0,'road',"Fisher's Way");
t(0,28,'road',"Fisher's Way");
t(-14,14,'road','Harbour Street');

// ── HARBOUR (east edge) ─────────────────────────────────
rect(12,4,13,24,'docks','East-Port Harbour');
t(12,14,'street','Harbour Street');

// ── MARKET DISTRICT (centre) ───────────────────────
rect(-4,10,3,13,'market','Market Square');
rect(-4,15,3,18,'market','Market Square');
t(-5,12,'building','The Salt & Sail Inn',{interiorType:'inn',doors:['east']});
t(-5,16,'building','Market Hall',{interiorType:'market_hall',doors:['east']});
t(4,12,'building','Chandler & Rope',{interiorType:'shop',doors:['west']});
t(4,16,'building','Spice Merchant',{interiorType:'shop',doors:['west']});
t(-2,9,'building',"Fletcher's Stall",{interiorType:'shop',doors:['north']});
t(2,9,'building','Grain Exchange',{interiorType:'shop',doors:['north']});
t(-2,19,'building','Apothecary',{interiorType:'shop',doors:['south']});
t(2,19,'building','Moneylender',{interiorType:'shop',doors:['south']});

// ── FISHERMEN'S QUARTER (NE) ─────────────────────
rect(6,23,8,27,'building','Net Shed',{interiorType:'house'});
t(6,23,'building','Net Shed',{interiorType:'house',doors:['south']});
rect(9,23,11,27,'building','Net Shed',{interiorType:'house'});
t(9,23,'building','Net Shed',{interiorType:'house',doors:['south']});
t(6,19,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(7,19,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(9,19,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(11,19,'building',"Fisher's Cottage",{interiorType:'house',doors:['west']});
t(6,16,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(7,16,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(9,16,'building',"Fisher's Cottage",{interiorType:'house',doors:['south']});
t(6,15,'building','Smokehouse',{interiorType:'shop',doors:['west']});

// ── MERCHANT QUARTER (NW) ───────────────────────
t(-6,23,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-7,23,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-9,23,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-11,23,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-13,23,'building','Merchant House',{interiorType:'house',doors:['south']});
t(-6,26,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-9,26,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-11,26,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-13,26,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-6,19,'building','Notary & Scribe',{interiorType:'shop',doors:['east']});
t(-9,19,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-11,19,'building','Merchant House',{interiorType:'house',doors:['east']});
t(-13,19,'building','Merchant House',{interiorType:'house',doors:['east']});

// ── RESIDENTIAL (SW) ─────────────────────────────
t(-6,11,'building','Chapel of the Tides',{interiorType:'chapel'});
t(-7,11,'building','Chapel of the Tides',{interiorType:'chapel'});
t(-6,10,'building','Chapel of the Tides',{interiorType:'chapel',doors:['east']});
t(-7,10,'building','Chapel of the Tides',{interiorType:'chapel'});
t(-6,7,'building','House',{interiorType:'house',doors:['east']});
t(-7,7,'building','House',{interiorType:'house',doors:['east']});
t(-9,7,'building','House',{interiorType:'house',doors:['east']});
t(-11,7,'building','House',{interiorType:'house',doors:['east']});
t(-13,7,'building','House',{interiorType:'house',doors:['east']});
t(-6,3,'building','House',{interiorType:'house',doors:['east']});
t(-7,3,'building','House',{interiorType:'house',doors:['east']});
t(-9,3,'building','House',{interiorType:'house',doors:['north']});
t(-11,3,'building','House',{interiorType:'house',doors:['north']});
t(-13,3,'building','House',{interiorType:'house',doors:['north']});

// ── TRADESMEN'S ROW (SE) ─────────────────────────
t(6,11,'building','Blacksmith',{interiorType:'blacksmith',doors:['west']});
t(7,11,'building','Blacksmith',{interiorType:'blacksmith'});
t(6,10,'building','Blacksmith',{interiorType:'blacksmith'});
t(7,10,'building','Blacksmith',{interiorType:'blacksmith'});
t(9,11,'building','Bathhouse',{interiorType:'bathhouse',doors:['west']});
t(9,10,'building','Bathhouse',{interiorType:'bathhouse'});
t(6,7,'building','Tannery',{interiorType:'shop',doors:['west']});
t(9,7,'building','Carpenter',{interiorType:'shop',doors:['west']});
t(6,3,'building','House',{interiorType:'house',doors:['west']});
t(7,3,'building','House',{interiorType:'house',doors:['west']});
t(9,3,'building','House',{interiorType:'house',doors:['west']});
t(11,3,'building','House',{interiorType:'house',doors:['west']});
t(13,3,'building','House',{interiorType:'house',doors:['west']});
t(6,8,'building','House',{interiorType:'house',doors:['west']});
t(9,8,'building','House',{interiorType:'house',doors:['west']});
t(11,8,'building','House',{interiorType:'house',doors:['west']});
t(13,8,'building','House',{interiorType:'house',doors:['west']});

// ── HARBORMASTER ──────────────────────────────────────
t(10,14,'building','Harbormaster',{interiorType:'harbormaster',doors:['west']});
t(11,14,'building','Harbormaster',{interiorType:'harbormaster'});
t(10,15,'building','Harbormaster',{interiorType:'harbormaster'});
t(11,15,'building','Harbormaster',{interiorType:'harbormaster'});

// ── COURTYARDS ──────────────────────────────────────────
rect(-1,13,1,15,'courtyard','Town Crossing');
rect(8,12,11,13,'courtyard','Dockside Yard');
rect(8,15,11,16,'courtyard','Dockside Yard');

SETTLEMENTS['frilar_town']={
  map:m,
  name:'East-Port',
  hasWalls:false,
  entryPos:{x:0,y:2},
  overworldCell:{x:346,y:556},
  description:'A natural harbour town on the east coast. Smells of salt, smoke, and fish. The kind of place where you can find passage east if you have coin — or find trouble if you do not.',
};
})();
makeSimpleTown('harvestfell','Harvestfell',190,644,28,[[-6,2,'The Golden Sheaf','harvestfell_inn'],[6,2,'Harvest Market','harvestfell_market'],[-6,16,'Temple of the Sea','harvestfell_temple']]);
makeSimpleTown('theatfields','Theatfields',250,544,12,[[3,2,'The Thatch & Barrel','theatfields_inn']]);
makeSimpleTown('dunesedge','Dunesedge',166,416,12,[[-3,2,'The Dusty Boot','dunesedge_inn']]);
makeSimpleTown('saltwell','Saltwell',139,462,10,[[-3,2,'Salt House','saltwell_inn']]);
makeSimpleTown('wheatstone','Wheatstone',169,289,12,[[-3,2,'The Wheat Sheaf','wheatstone_inn']]);

const OVERWORLD_TO_SETTLEMENT={};
(function(){
  // Map every footprint cell to its settlement id
  const fp=[
    ['aethel_keep',  136,258,142,266],
    ['weavers_deep', 258,145,262,151],
    ['high_crown',   251,393,255,399],
    ['gladehome',    310,208,312,212],
    ['sylvanis_root',337,412,339,416],
    ['briar_town',   400,439,401,440],
    ['frilar_town',  346,556,347,557],
    ['harvestfell',  188,642,192,646],
    ['theatfields',  249,543,251,545],
    ['dunesedge',    165,415,167,417],
    ['saltwell',     138,461,140,463],
    ['wheatstone',   168,288,170,290],
  ];
  for(const[id,x1,y1,x2,y2]of fp)
    for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)
      OVERWORLD_TO_SETTLEMENT[`${x},${y}`]=id;
})();

const NPC_TEMPLATES={
  'innkeeper_aethel':{id:'innkeeper_aethel',name:'Dara Fenn',role:'Innkeeper, The Aethel Arms',faction:'aethel_citizens',emoji:'🏠',personality:`Sturdy northern woman. Blunt but fair. Knows every face that passes through. Keeps secrets for coin.`,schedule:[{timeStart:6,timeEnd:24,layer:'interior',settlementId:'aethel_keep',posKey:'aethel_inn'}],trader:{stock:[{name:'Bed for the Night',basePriceCp:60,stock:99},{name:'Hot Stew',basePriceCp:10,stock:99},{name:'Aethel Ale',basePriceCp:5,stock:99},{name:'Healing Salve',basePriceCp:90,stock:3},{name:'Trail Rations (3 days)',basePriceCp:35,stock:5}],buyRate:0.3,sellMarkup:1.4}},
  'gate_captain_aethel':{id:'gate_captain_aethel',name:'Cort Vane',role:'Gate Captain, South Gate',faction:'aethel_guard',emoji:'⚔',personality:`Veteran soldier. Seen too much. Trusts no one from the east. Fair to honest travellers. Rigid about the law.`,schedule:[{timeStart:6,timeEnd:20,layer:'settlement',settlementId:'aethel_keep',posKey:'0,2'},{timeStart:20,timeEnd:6,layer:'interior',settlementId:'aethel_keep',posKey:'aethel_barracks'}]},
  'archivist_ruins':{id:'archivist_ruins',name:'Mael the Pale',role:'Wandering Scholar',faction:'scholars',emoji:'📜',personality:`Obsessive. Mutters to himself. Knows things about the Old Kingdom that should be forgotten. Not dangerous. Probably.`,schedule:[{timeStart:0,timeEnd:24,layer:'overworld',posKey:'275,254'}]},
  'innkeeper_harvestfell':{id:'innkeeper_harvestfell',name:'Tomas Brent',role:'Innkeeper, The Golden Sheaf',faction:'harvestfell_citizens',emoji:'🌾',personality:`Cheerful. Optimistic despite hard times. Deeply religious.`,schedule:[{timeStart:7,timeEnd:23,layer:'interior',settlementId:'harvestfell',posKey:'harvestfell_inn'}],trader:{stock:[{name:'Bed for the Night',basePriceCp:40,stock:99},{name:'Fish Stew',basePriceCp:8,stock:99},{name:'Southern Rum',basePriceCp:6,stock:99},{name:'Salt (pouch)',basePriceCp:20,stock:5}],buyRate:0.25,sellMarkup:1.3}},
  // ── EAST-PORT NPCs ──────────────────────────────────────────────────────

  // Harbormaster
  'ep_harbormaster':{id:'ep_harbormaster',name:'Aldric Crane',role:'Harbormaster, East-Port',faction:'eastport_guard',emoji:'⚓',
    personality:`Weathered man in his 50s. Precise and formal. Keeps meticulous records. Quietly corrupt — takes a cut from incoming cargo but never skims enough to draw attention. Respects competence.`,
    schedule:[{timeStart:7,timeEnd:19,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:10,14'},{timeStart:19,timeEnd:7,layer:'settlement',settlementId:'frilar_town',posKey:'10,14'}],
    relationships:{spouse:null,friends:['ep_guard_rona'],rivals:['ep_smuggler']}},

  // Salt & Sail Innkeeper
  'ep_innkeeper':{id:'ep_innkeeper',name:'Bess Oldwater',role:'Innkeeper, The Salt & Sail',faction:'eastport_citizens',emoji:'🍺',
    personality:`Round-faced woman, always warm, always listening. Knows every rumour in town before the person it concerns does. Charges fair but remembers debts. Widow — her husband drowned three winters ago.`,
    schedule:[{timeStart:6,timeEnd:24,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-5,12'}],
    relationships:{spouse:null,friends:['ep_priest'],rivals:[]},
    trader:{stock:[{name:'Bed for the Night',basePriceCp:50,stock:99},{name:'Salt Fish Stew',basePriceCp:8,stock:99},{name:'Harbour Ale',basePriceCp:4,stock:99},{name:'Salted Biscuit',basePriceCp:2,stock:99},{name:'Healing Salve',basePriceCp:80,stock:2},{name:'Trail Rations (3 days)',basePriceCp:30,stock:4}],buyRate:0.25,sellMarkup:1.35}},

  // Blacksmith
  'ep_blacksmith':{id:'ep_blacksmith',name:'Tor Ashfen',role:'Blacksmith, East-Port',faction:'eastport_citizens',emoji:'🔨',
    personality:`Enormous man. Barely speaks. When he does, it matters. Lost two fingers on his left hand to a forge accident years ago and is oddly cheerful about it. Married to Mira.`,
    schedule:[{timeStart:6,timeEnd:18,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:6,11'},{timeStart:18,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'-9,7'}],
    relationships:{spouse:'ep_mira',friends:[],rivals:[]},
    trader:{stock:[{name:'Iron Knife',basePriceCp:120,stock:2},{name:'Hatchet',basePriceCp:200,stock:1},{name:'Iron-Tipped Spear',basePriceCp:380,stock:1},{name:'Leather Armour',basePriceCp:450,stock:1},{name:'Iron Shield',basePriceCp:300,stock:1},{name:'Horseshoe Nail (bundle)',basePriceCp:15,stock:8},{name:'Rope (10m)',basePriceCp:25,stock:3}],buyRate:0.35,sellMarkup:1.3}},

  // Blacksmith's wife — domestic, residential SW
  'ep_mira':{id:'ep_mira',name:'Mira Ashfen',role:'Resident, East-Port',faction:'eastport_citizens',emoji:'👩',
    personality:`Sharp-tongued but generous. Runs the household accounts with an iron grip. Keeps a kitchen garden and gives surplus vegetables to the chapel. Quietly worries about Tor's health.`,
    schedule:[{timeStart:8,timeEnd:20,layer:'settlement',settlementId:'frilar_town',posKey:'-9,7'},{timeStart:20,timeEnd:8,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-9,7'}],
    relationships:{spouse:'ep_blacksmith',friends:['ep_priest'],rivals:[]}},

  // Watch guard — patrols streets
  'ep_guard_rona':{id:'ep_guard_rona',name:'Rona Stebbe',role:'Town Watch, East-Port',faction:'eastport_guard',emoji:'🛡',
    personality:`Young woman. Ambitious. Suspicious of strangers but not hostile — yet. Knows something is wrong with the cargo manifests but hasn't worked out who. Admires the harbormaster without realising he's part of the problem.`,
    schedule:[{timeStart:6,timeEnd:20,layer:'settlement',settlementId:'frilar_town',posKey:'0,14'},{timeStart:20,timeEnd:6,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-6,3'}],
    relationships:{spouse:null,friends:['ep_harbormaster'],rivals:['ep_smuggler']}},

  // Second guard — older, lazier
  'ep_guard_peck':{id:'ep_guard_peck',name:'Oswin Peck',role:'Town Watch, East-Port',faction:'eastport_guard',emoji:'🛡',
    personality:`Fat, slow, and comfortable with it. Has been on the watch for twenty years without incident — largely because he avoids incidents. Knows about the smuggling. Has decided not to know about it.`,
    schedule:[{timeStart:8,timeEnd:16,layer:'settlement',settlementId:'frilar_town',posKey:'0,6'},{timeStart:16,timeEnd:8,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-6,7'}],
    relationships:{spouse:null,friends:[],rivals:[]}},

  // Priest at chapel
  'ep_priest':{id:'ep_priest',name:'Sister Avane',role:'Keeper of the Chapel of the Tides',faction:'eastport_church',emoji:'✝',
    personality:`Calm and unhurried. Speaks slowly, as if choosing every word from a large and careful inventory. Tends the sick. Knows more about people's sins than anyone and judges none of them. Has a soft spot for strays — human or animal.`,
    schedule:[{timeStart:6,timeEnd:22,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-6,10'},{timeStart:22,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'-6,11'}],
    relationships:{spouse:null,friends:['ep_innkeeper','ep_mira'],rivals:[]}},

  // Smuggler — Fen Runners contact
  'ep_smuggler':{id:'ep_smuggler',name:'Dav Silt',role:'Fisherman (and other things)',faction:'eastport_smugglers',emoji:'🐟',
    personality:`Lean, quiet, smells of brine and something chemical. Officially a fisherman. Actually runs small cargoes through the fens at night for the Fen Runners. Not violent but will disappear if pressed. Has a tell — touches his left ear when lying.`,
    schedule:[{timeStart:7,timeEnd:14,layer:'settlement',settlementId:'frilar_town',posKey:'10,22'},{timeStart:14,timeEnd:19,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:6,19'},{timeStart:19,timeEnd:7,layer:'settlement',settlementId:'frilar_town',posKey:'11,4'}],
    relationships:{spouse:null,friends:[],rivals:['ep_guard_rona']}},

  // Tanner
  'ep_tanner':{id:'ep_tanner',name:'Wulf Grent',role:'Tanner, East-Port',faction:'eastport_citizens',emoji:'🪣',
    personality:`Permanently stained, permanently cheerful. Talks constantly about the merits of different hides. Has opinions about everything and shares them freely. His wife left years ago and he still doesn't understand why.`,
    schedule:[{timeStart:6,timeEnd:17,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:6,7'},{timeStart:17,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'6,8'}],
    relationships:{spouse:null,friends:['ep_blacksmith'],rivals:[]}},

  // Merchant at market hall
  'ep_merchant':{id:'ep_merchant',name:'Serafin Holdt',role:'Merchant, Market Hall',faction:'eastport_citizens',emoji:'💰',
    personality:`Slick hair, ink-stained fingers. Trades in cloth, spices, and information. Deeply invested in appearing richer than he is. Owes money to someone in Aethel-Keep and is quietly desperate about it.`,
    schedule:[{timeStart:8,timeEnd:18,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-5,16'},{timeStart:18,timeEnd:8,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:-13,46'}],
    relationships:{spouse:null,friends:[],rivals:['ep_harbormaster']},
    trader:{stock:[{name:'Bolt of Cloth',basePriceCp:180,stock:3},{name:'Pepper (small pouch)',basePriceCp:60,stock:4},{name:'Candles (bundle of 6)',basePriceCp:20,stock:5},{name:'Ink & Quill',basePriceCp:35,stock:2},{name:'Rope (10m)',basePriceCp:22,stock:3},{name:'Lantern',basePriceCp:80,stock:2}],buyRate:0.3,sellMarkup:1.4}},

  // Beggar — no fixed home
  'ep_beggar':{id:'ep_beggar',name:'Old Fetch',role:'Beggar',faction:'eastport_citizens',emoji:'🧤',
    personality:`Ancient. Possibly mad. Calls everyone "captain." Has lived in East-Port longer than anyone can remember and knows things about the town's history that no one else does — but getting a straight answer out of him requires patience and food.`,
    schedule:[{timeStart:0,timeEnd:24,layer:'settlement',settlementId:'frilar_town',posKey:'-3,14'}],
    relationships:{spouse:null,friends:['ep_priest'],rivals:[]}},

  // Fisher wife — residential
  'ep_fishwife':{id:'ep_fishwife',name:'Nance Cord',role:'Resident, Fishermen's Quarter',faction:'eastport_citizens',emoji:'👩',
    personality:`Practical, weather-beaten, completely unimpressed by anything. Repairs nets, salts fish, raises three children largely alone while her husband is at sea. Has a dry wit that catches people off guard.`,
    schedule:[{timeStart:7,timeEnd:19,layer:'settlement',settlementId:'frilar_town',posKey:'7,19'},{timeStart:19,timeEnd:7,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:7,19'}],
    relationships:{spouse:'ep_fisher',friends:[],rivals:[]}},

  // Fisher — out at sea during day, home at night
  'ep_fisher':{id:'ep_fisher',name:'Cole Cord',role:'Fisherman, East-Port',faction:'eastport_citizens',emoji:'🎣',
    personality:`Sun-dark, quiet. At sea more than he's home. Loves his wife deeply and is bad at showing it. Knows the coastal waters better than anyone. Has seen things in the fens at night that he doesn't talk about.`,
    schedule:[{timeStart:4,timeEnd:15,layer:'settlement',settlementId:'frilar_town',posKey:'11,4'},{timeStart:15,timeEnd:22,layer:'settlement',settlementId:'frilar_town',posKey:'7,19'},{timeStart:22,timeEnd:4,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:7,19'}],
    relationships:{spouse:'ep_fishwife',friends:[],rivals:[]}},

  // Carpenter
  'ep_carpenter':{id:'ep_carpenter',name:'Jenn Platt',role:'Carpenter, East-Port',faction:'eastport_citizens',emoji:'🪚',
    personality:`Methodical woman. Always has sawdust in her hair. Extraordinarily good at her craft and knows it. Does not like being rushed. Has a long-running disagreement with the tanner about whose work smell worse.`,
    schedule:[{timeStart:6,timeEnd:17,layer:'interior',settlementId:'frilar_town',posKey:'frilar_town:bld:9,7'},{timeStart:17,timeEnd:6,layer:'settlement',settlementId:'frilar_town',posKey:'9,8'}],
    relationships:{spouse:null,friends:[],rivals:['ep_tanner']}},

  // 'hunter_sylvanis' continues below...
  'hunter_sylvanis':{id:'hunter_sylvanis',name:'Bryn of the Root',role:"Hunter, Hunters' Hall",faction:'sylvanis_citizens',emoji:'🏹',personality:`Quiet and watchful. Short precise sentences. Suspicious of city folk. Respects those who know the wild.`,schedule:[{timeStart:8,timeEnd:18,layer:'interior',settlementId:'sylvanis_root',posKey:'sylvanis_hunters'}],trader:{stock:[{name:"Hunter's Shortbow",basePriceCp:450,stock:1},{name:'Arrow Bundle (24)',basePriceCp:36,stock:8},{name:'Skinning Knife',basePriceCp:120,stock:2},{name:'Dried Venison (3 days)',basePriceCp:28,stock:4},{name:'Wilds Salve',basePriceCp:70,stock:2}],buyRate:0.4,sellMarkup:1.2}},
};

const FACTIONS={
  aethel_guard:{name:'Aethel City Guard',color:'#7a9abf',rivals:['shadow_compact'],allies:['royal_court']},
  aethel_citizens:{name:'Aethel Folk',color:'#a0c878',rivals:[],allies:[]},
  royal_court:{name:'Royal Court',color:'#c9943a',rivals:['old_blood'],allies:['aethel_guard']},
  old_blood:{name:'Old Blood (nobles)',color:'#9a70c0',rivals:['royal_court'],allies:[]},
  shadow_compact:{name:'Shadow Compact',color:'#606080',rivals:['aethel_guard'],allies:[]},
  scholars:{name:'The Scholars',color:'#a0b8c8',rivals:[],allies:[]},
  sylvanis_citizens:{name:'Sylvanis Folk',color:'#70b870',rivals:[],allies:[]},
  harvestfell_citizens:{name:'Harvestfell Folk',color:'#c8b060',rivals:[],allies:[]},
  briar_citizens:{name:'Briar-Town Folk',color:'#b09060',rivals:[],allies:[]},
  weavers_citizens:{name:"Weaver's Deep Folk",color:'#70a0b8',rivals:[],allies:[]},
  eastport_citizens:{name:'East-Port Folk',color:'#8ab0a0',rivals:[],allies:['eastport_guard']},
  eastport_guard:{name:'East-Port Watch',color:'#6080a0',rivals:['eastport_smugglers'],allies:['eastport_citizens']},
  eastport_smugglers:{name:'Fen Runners',color:'#507060',rivals:['eastport_guard'],allies:[]},
  eastport_church:{name:'Church of the Tides',color:'#a0a0c8',rivals:[],allies:['eastport_citizens']},
};

window.WORLD_DATA={
  id:WORLD_ID,name:WORLD_NAME,
  meta:WORLD_META,
  inferTerrain,
  settlements:SETTLEMENTS,
  overworldToSettlement:OVERWORLD_TO_SETTLEMENT,
  npcTemplates:NPC_TEMPLATES,
  factions:FACTIONS,
};
})();
