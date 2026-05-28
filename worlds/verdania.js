// ═══════════════════════════════════════════════════
// VERDANIA — WORLD DATA
// This file defines one "island" / landmass.
// To create a new world, duplicate this file,
// change WORLD_ID, and swap the <script> tag in index.html.
// ═══════════════════════════════════════════════════

(function() {
const WORLD_ID = 'verdania';
const WORLD_NAME = 'Valdenmere';

// ── TERRAIN TYPE CONSTANTS ──────────────────────────
// (engine reads these from window.T — defined in engine.js)
// Listed here for reference when building settlement maps.
// T.OCEAN, T.PLAINS, T.FOREST, T.MOUNTAIN, T.CITY, T.TOWN,
// T.VILLAGE, T.ROAD, T.FARMLAND, T.RIVER, T.STREET,
// T.BUILDING, T.DOOR, T.WALL, T.COURTYARD, T.MARKET,
// T.DOCKS, T.GATE, T.INTERIOR

// ═══════════════════════════════════════════════════
// OVERWORLD MAP
// ═══════════════════════════════════════════════════
const WORLD_META = {};

function defRegion(x1, y1, x2, y2, type, name = '') {
  for (let x = x1; x <= x2; x++)
    for (let y = y1; y <= y2; y++)
      WORLD_META[`${x},${y}`] = { type, name };
}

// Ocean border
defRegion(-30,-30,30,-21,'ocean'); defRegion(-30,21,30,30,'ocean');
defRegion(-30,-30,-21,30,'ocean'); defRegion(21,-30,30,30,'ocean');

// Main landmass
defRegion(-20,-20,20,20,'plains');

// Major locations
defRegion(-3,-8,3,-3,'city','Ironhaven');
defRegion(-18,-5,-8,8,'forest','Ashwood Forest');
defRegion(8,-18,18,-6,'mountain','Greymount Range');
defRegion(-14,10,-10,13,'town','Thornwick');
defRegion(12,15,15,18,'town','Saltmere');
defRegion(6,-14,8,-12,'village','Greyveil');
defRegion(-16,2,-14,4,'village','Dunrock');

// River Veld
for (let y = -2; y <= 17; y++) WORLD_META[`2,${y}`] = { type:'river', name:'River Veld' };

// King's Road
(function(){
  const p=[[0,0],[0,1],[0,2],[0,3],[-1,3],[-2,3],[-2,4],[-2,5],[-2,6],[-3,6],[-4,6],[-5,6],[-5,7],[-5,8],[-5,9],[-6,9],[-7,9],[-8,9],[-8,10],[-8,11],[-9,11],[-10,11],[-11,11],[-12,11],[-12,12]];
  p.forEach(([x,y])=>WORLD_META[`${x},${y}`]={type:'road',name:"King's Road"});
})();

// River Road
(function(){
  for(let y=0;y<=12;y++)WORLD_META[`3,${y}`]={type:'road',name:'River Road'};
  [[4,13],[5,14],[6,14],[7,15],[8,15],[9,15],[10,15],[11,15],[12,15],[13,15],[13,16]].forEach(([x,y])=>WORLD_META[`${x},${y}`]={type:'road',name:'River Road'});
})();

// Northern Track
(function(){
  [[0,-3],[0,-4],[0,-5],[1,-5],[2,-5],[3,-5],[3,-6],[3,-7],[3,-8],[4,-8],[5,-8],[6,-8],[6,-9],[6,-10],[6,-11],[6,-12],[6,-13]].forEach(([x,y])=>WORLD_META[`${x},${y}`]={type:'road',name:'Northern Track'});
})();

// Dunrock Spur
(function(){
  [[-5,9],[-6,9],[-7,9],[-8,9],[-9,9],[-10,9],[-11,9],[-12,9],[-12,8],[-12,7],[-12,6],[-12,5],[-12,4],[-12,3],[-12,2],[-13,2],[-14,2],[-15,2]].forEach(([x,y])=>{
    if(!WORLD_META[`${x},${y}`]) WORLD_META[`${x},${y}`]={type:'road',name:'Dunrock Spur'};
  });
})();

// Farmlands
defRegion(-13,5,-5,12,'farmland','Southern Farmlands');
defRegion(-18,0,-17,8,'farmland','Dunrock Fields');

// ═══════════════════════════════════════════════════
// SETTLEMENT MAPS
// ═══════════════════════════════════════════════════
const SETTLEMENTS = {};

// ── IRONHAVEN ──────────────────────────────────────
(function(){
  const m = {};
  function sdef(x1,y1,x2,y2,type,name=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type,name};}

  // Walls and gates
  for(let x=-25;x<=25;x++){m[`${x},0`]={type:'wall',name:'South Wall'};m[`${x},50`]={type:'wall',name:'North Wall'};}
  for(let y=0;y<=50;y++){m[`-25,${y}`]={type:'wall',name:'West Wall'};m[`25,${y}`]={type:'wall',name:'East Wall'};}
  m[`0,0`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:0,y:0}}};
  m[`0,50`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:0,y:-4}}};
  m[`-25,25`]={type:'gate',name:'West Gate',exit:{layer:'overworld',pos:{x:-4,y:-5}}};
  m[`25,25`]={type:'gate',name:'East Gate',exit:{layer:'overworld',pos:{x:4,y:-5}}};

  // Main streets
  for(let y=1;y<=49;y++){if(!m[`0,${y}`]||m[`0,${y}`].type!=='gate')m[`0,${y}`]={type:'street',name:"King's Road"};}
  for(let x=-24;x<=24;x++){if(!m[`${x},20`]||m[`${x},20`].type!=='wall')m[`${x},20`]={type:'street',name:'Market Street'};}
  for(let x=-24;x<=24;x++){if(!m[`${x},35`]||m[`${x},35`].type!=='wall')m[`${x},35`]={type:'street',name:'Temple Row'};}
  for(let y=1;y<=49;y++){if(!m[`15,${y}`]||m[`15,${y}`].type==='street'){}else m[`15,${y}`]={type:'street',name:'Dock Street'};}
  for(let y=1;y<=49;y++){if(!m[`-15,${y}`]&&!(m[`-15,${y}`]?.type==='wall'))m[`-15,${y}`]={type:'street',name:'West Lane'};}

  // South quarter buildings
  sdef(-8,2,-3,8,'building','Stables');
  m[`-5,2`]={type:'door',name:'Stables Entrance',enter:{layer:'interior',id:'ironhaven_stables',entryPos:{x:2,y:1}}};
  sdef(3,2,8,8,'building','Customs House');
  m[`5,2`]={type:'door',name:'Customs House',enter:{layer:'interior',id:'ironhaven_customs',entryPos:{x:2,y:1}}};
  sdef(-14,3,-10,10,'building','Guard Barracks');
  m[`-12,3`]={type:'door',name:'Barracks Door',enter:{layer:'interior',id:'ironhaven_barracks',entryPos:{x:2,y:1}}};
  sdef(10,3,14,12,'building',"Traveller's Rest");
  m[`11,3`]={type:'door',name:"Traveller's Rest Inn",enter:{layer:'interior',id:'ironhaven_inn_south',entryPos:{x:1,y:1}}};

  // Market district
  sdef(-24,19,24,34,'courtyard','Market District');
  for(let x=-24;x<=24;x++)m[`${x},20`]={type:'street',name:'Market Street'};
  for(let x=-24;x<=24;x++)m[`${x},28`]={type:'street',name:'South Market Lane'};
  sdef(-20,21,-2,27,'market','Market Stalls');
  sdef(2,21,20,27,'market','Market Stalls');
  m[`0,24`]={type:'market',name:'Market Square Centre'};
  sdef(-24,21,-21,34,'building',"Merchants' Guild");
  m[`-22,21`]={type:'door',name:"Merchants' Guild Hall",enter:{layer:'interior',id:'ironhaven_guild',entryPos:{x:1,y:1}}};
  sdef(21,21,24,28,'building','The Forge');
  m[`22,21`]={type:'door',name:'The Forge',enter:{layer:'interior',id:'ironhaven_forge',entryPos:{x:1,y:1}}};
  sdef(16,29,20,34,'building',"Alchemist's Shop");
  m[`17,29`]={type:'door',name:"Alchemist's Shop",enter:{layer:'interior',id:'ironhaven_alchemist',entryPos:{x:1,y:1}}};
  sdef(-20,29,-16,34,'building','The Iron Flask');
  m[`-18,29`]={type:'door',name:'The Iron Flask (Tavern)',enter:{layer:'interior',id:'ironhaven_tavern',entryPos:{x:2,y:1}}};

  // Docks
  sdef(16,1,24,18,'docks','Dockside');
  sdef(20,5,24,15,'docks','River Docks');
  sdef(16,8,19,13,'building',"Dockmaster's Office");
  m[`17,8`]={type:'door',name:"Dockmaster's Office",enter:{layer:'interior',id:'ironhaven_dockmaster',entryPos:{x:1,y:1}}};
  sdef(16,15,19,18,'building','River Warehouse');
  m[`17,15`]={type:'door',name:'Warehouse',enter:{layer:'interior',id:'ironhaven_warehouse',entryPos:{x:1,y:1}}};

  // Temple district
  sdef(-24,35,-1,49,'courtyard','Temple District');
  for(let x=-24;x<=24;x++)m[`${x},35`]={type:'street',name:'Temple Row'};
  sdef(-20,38,-8,48,'building','Temple of Valdenmere');
  m[`-14,38`]={type:'door',name:'Temple of Valdenmere',enter:{layer:'interior',id:'ironhaven_temple',entryPos:{x:6,y:1}}};
  sdef(-6,37,-2,48,'courtyard','Temple Gardens');
  sdef(1,36,24,49,'courtyard','Castle Quarter');
  sdef(5,38,22,49,'building','Ironhaven Castle');
  m[`13,38`]={type:'door',name:'Castle Gatehouse',enter:{layer:'interior',id:'ironhaven_castle_gate',entryPos:{x:4,y:1}}};

  // Residences
  sdef(-24,9,-16,19,'building','West Residences');
  for(let bx=-14;bx<=-2;bx+=5)
    for(let by=9;by<=17;by+=5)
      sdef(bx,by,bx+3,by+3,'building','Residence');

  SETTLEMENTS['ironhaven'] = { map:m, name:'Ironhaven', entryPos:{x:0,y:2}, overworldCell:{x:0,y:-4} };
})();

// ── THORNWICK ──────────────────────────────────────
(function(){
  const m = {};
  function sdef(x1,y1,x2,y2,type,name=''){for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++)m[`${x},${y}`]={type,name};}
  for(let x=-15;x<=15;x++){m[`${x},0`]={type:'wall',name:'Town Wall'};m[`${x},30`]={type:'wall',name:'Town Wall'};}
  for(let y=0;y<=30;y++){m[`-15,${y}`]={type:'wall',name:'Town Wall'};m[`15,${y}`]={type:'wall',name:'Town Wall'};}
  m[`0,0`]={type:'gate',name:'South Gate',exit:{layer:'overworld',pos:{x:-12,y:12}}};
  m[`0,30`]={type:'gate',name:'North Gate',exit:{layer:'overworld',pos:{x:-12,y:9}}};
  for(let y=1;y<=29;y++)m[`0,${y}`]={type:'street',name:'High Street'};
  for(let x=-14;x<=14;x++)m[`${x},15`]={type:'street',name:'Cross Street'};
  sdef(-5,12,5,18,'market','Market Square');
  for(let x=-14;x<=14;x++)m[`${x},15`]={type:'street',name:'Cross Street'};
  m[`0,15`]={type:'street',name:'High Street'};
  sdef(2,2,8,8,'building','The Thornwick Inn');
  m[`3,2`]={type:'door',name:'The Thornwick Inn',enter:{layer:'interior',id:'thornwick_inn',entryPos:{x:1,y:1}}};
  sdef(-8,2,-3,7,'building','Smithy');
  m[`-6,2`]={type:'door',name:'Smithy',enter:{layer:'interior',id:'thornwick_smithy',entryPos:{x:1,y:1}}};
  sdef(-10,19,-4,27,'building','Temple of the Wanderer');
  m[`-7,19`]={type:'door',name:'Temple of the Wanderer',enter:{layer:'interior',id:'thornwick_temple',entryPos:{x:3,y:1}}};
  sdef(4,19,10,26,'building','General Store');
  m[`5,19`]={type:'door',name:'General Store',enter:{layer:'interior',id:'thornwick_store',entryPos:{x:1,y:1}}};
  SETTLEMENTS['thornwick'] = { map:m, name:'Thornwick', entryPos:{x:0,y:2} };
})();

// ── GREYVEIL ───────────────────────────────────────
(function(){
  const m = {};
  for(let x=-5;x<=5;x++)m[`${x},5`]={type:'street',name:'Village Lane'};
  for(let y=0;y<=10;y++)m[`0,${y}`]={type:'street',name:'Village Lane'};
  m[`0,5`]={type:'courtyard',name:'Village Well'};
  m[`2,6`]={type:'building',name:"Miller's Rest"};m[`3,6`]={type:'building',name:"Miller's Rest"};
  m[`2,7`]={type:'building',name:"Miller's Rest"};m[`3,7`]={type:'building',name:"Miller's Rest"};
  m[`2,6`]={type:'door',name:"Miller's Rest Inn",enter:{layer:'interior',id:'greyveil_inn',entryPos:{x:1,y:1}}};
  [[-3,3],[-3,6],[3,3],[-3,8],[3,8]].forEach(([x,y])=>{
    m[`${x},${y}`]={type:'building',name:'Dwelling'};m[`${x+1},${y}`]={type:'building',name:'Dwelling'};
    m[`${x},${y+1}`]={type:'building',name:'Dwelling'};m[`${x+1},${y+1}`]={type:'building',name:'Dwelling'};
  });
  SETTLEMENTS['greyveil'] = { map:m, name:'Greyveil', entryPos:{x:0,y:0}, overworldCell:{x:7,y:-13} };
})();

// ── DUNROCK ────────────────────────────────────────
(function(){
  const m = {};
  for(let x=-4;x<=4;x++)m[`${x},4`]={type:'street',name:'Farm Road'};
  for(let y=0;y<=8;y++)m[`0,${y}`]={type:'street',name:'Farm Road'};
  m[`0,4`]={type:'courtyard',name:'Village Green'};
  m[`-3,5`]={type:'door',name:'The Dunrock Alehouse',enter:{layer:'interior',id:'dunrock_alehouse',entryPos:{x:1,y:1}}};
  m[`-2,5`]={type:'building',name:'The Dunrock Alehouse'};
  m[`-3,6`]={type:'building',name:'The Dunrock Alehouse'};
  m[`-2,6`]={type:'building',name:'The Dunrock Alehouse'};
  SETTLEMENTS['dunrock'] = { map:m, name:'Dunrock', entryPos:{x:0,y:0}, overworldCell:{x:-15,y:3} };
})();

// ── OVERWORLD → SETTLEMENT LOOKUP ──────────────────
const OVERWORLD_TO_SETTLEMENT = {};
(function(){
  const sc = {
    ironhaven:[[-3,-8],[3,-3]],
    thornwick:[[-14,10],[-10,13]],
    greyveil:[[6,-14],[8,-12]],
    dunrock:[[-16,2],[-14,4]],
    saltmere:[[12,15],[15,18]]
  };
  for(const [id,[[x1,y1],[x2,y2]]] of Object.entries(sc))
    for(let x=x1;x<=x2;x++)
      for(let y=y1;y<=y2;y++)
        OVERWORLD_TO_SETTLEMENT[`${x},${y}`] = id;
})();

// ═══════════════════════════════════════════════════
// NPC DEFINITIONS
// ═══════════════════════════════════════════════════
const NPC_TEMPLATES = {

  // ── IRONHAVEN ────────────────────────────────────
  'mira_ironhaven': {
    id: 'mira_ironhaven',
    name: 'Mira Voss',
    role: "Innkeeper, Traveller's Rest",
    faction: 'ironhaven_citizens',
    emoji: '🏠',
    personality: 'Weathered and warm. Seen everything. Dry humour. Protective of guests. Knows every rumour in the south quarter.',
    schedule: [
      { timeStart:6, timeEnd:23, layer:'interior', settlementId:'ironhaven', posKey:'ironhaven_inn_south' },
      { timeStart:23, timeEnd:6, layer:'interior', settlementId:'ironhaven', posKey:'ironhaven_inn_south_back' }
    ],
    trader: {
      stock: [
        { name:'Bed for the night', basePriceCp:50, stock:99 },
        { name:'Hot meal (stew)', basePriceCp:8, stock:99 },
        { name:'Mug of Ale', basePriceCp:4, stock:99 },
        { name:'Healing Salve', basePriceCp:80, stock:3 },
        { name:'Waterskin (filled)', basePriceCp:12, stock:5 },
      ],
      buyRate: 0.3, sellMarkup: 1.4
    }
  },

  'aldric_gate': {
    id: 'aldric_gate',
    name: 'Aldric Brenn',
    role: 'Gate Captain, South Gate',
    faction: 'ironhaven_guard',
    emoji: '⚔',
    personality: 'Gruff, by-the-book. Twenty years on the wall. Suspects everyone but is fair. Respects strength and honesty. Bribes make him angry.',
    schedule: [
      { timeStart:6, timeEnd:18, layer:'settlement', settlementId:'ironhaven', posKey:'0,2' },
      { timeStart:18, timeEnd:6, layer:'interior', settlementId:'ironhaven', posKey:'ironhaven_barracks' }
    ]
  },

  'thessaly_alchemist': {
    id: 'thessaly_alchemist',
    name: 'Thessaly Ornn',
    role: 'Alchemist',
    faction: 'ironhaven_guild',
    emoji: '⚗',
    personality: 'Precise. Distracted by her work. Will talk endlessly about ingredients. Distrusts magic but loves chemistry. Hides something.',
    schedule: [
      { timeStart:8, timeEnd:20, layer:'interior', settlementId:'ironhaven', posKey:'ironhaven_alchemist' }
    ],
    trader: {
      stock: [
        { name:'Healing Draught', basePriceCp:120, stock:4 },
        { name:'Stamina Tincture', basePriceCp:90, stock:3 },
        { name:'Nightvision Drops', basePriceCp:200, stock:2 },
        { name:'Antidote', basePriceCp:150, stock:2 },
        { name:'Alchemist Fire (vial)', basePriceCp:300, stock:1 },
        { name:'Dried Wolfsbane', basePriceCp:35, stock:8 },
      ],
      buyRate: 0.5, sellMarkup: 1.5
    }
  },

  'gareth_forge': {
    id: 'gareth_forge',
    name: 'Gareth Sorn',
    role: 'Master Smith, The Forge',
    faction: 'ironhaven_guild',
    emoji: '🔨',
    personality: 'A mountain of a man. Quiet dignity. Speaks in short sentences. Judges people by their hands. Passionate about metallurgy.',
    schedule: [
      { timeStart:5, timeEnd:20, layer:'interior', settlementId:'ironhaven', posKey:'ironhaven_forge' }
    ],
    trader: {
      stock: [
        { name:'Iron Dagger', basePriceCp:180, stock:3 },
        { name:'Short Sword', basePriceCp:800, stock:2 },
        { name:'Brigandine Vest', basePriceCp:1200, stock:1 },
        { name:'Iron Shield', basePriceCp:600, stock:2 },
        { name:'Arrow Bundle (20)', basePriceCp:40, stock:10 },
        { name:'Whetstone', basePriceCp:15, stock:5 },
      ],
      buyRate: 0.45, sellMarkup: 1.3
    }
  },

  'crone_market': {
    id: 'crone_market',
    name: 'Old Nessa',
    role: 'Market Herbalist',
    faction: 'ironhaven_citizens',
    emoji: '🌿',
    personality: 'Ancient. Possibly senile, possibly very wise. Speaks in riddles. Knows things she should not. Fond of ravens.',
    schedule: [
      { timeStart:7, timeEnd:16, layer:'settlement', settlementId:'ironhaven', posKey:'0,24' }
    ],
    trader: {
      stock: [
        { name:'Dried Herbs (bundle)', basePriceCp:20, stock:10 },
        { name:'Fever Root', basePriceCp:45, stock:5 },
        { name:'Dream Leaf', basePriceCp:60, stock:3 },
        { name:'Thorn Apple (dangerous)', basePriceCp:80, stock:2 },
      ],
      buyRate: 0.4, sellMarkup: 1.2
    }
  },

  // ── THORNWICK ─────────────────────────────────────
  'bram_thornwick': {
    id: 'bram_thornwick',
    name: 'Bram Holt',
    role: "Innkeeper, Thornwick Inn",
    faction: 'thornwick_citizens',
    emoji: '🍺',
    personality: 'Jovial, loud, nosy. Loves stories. Inflates tales about himself. Generous with ale, stingy with coin.',
    schedule: [
      { timeStart:8, timeEnd:24, layer:'interior', settlementId:'thornwick', posKey:'thornwick_inn' }
    ],
    trader: {
      stock: [
        { name:'Bed for the night', basePriceCp:35, stock:99 },
        { name:'Bowl of Pottage', basePriceCp:5, stock:99 },
        { name:'Thornwick Bitter (pint)', basePriceCp:3, stock:99 },
      ],
      buyRate: 0.25, sellMarkup: 1.3
    }
  },

  'elara_thornwick': {
    id: 'elara_thornwick',
    name: 'Elara Mast',
    role: 'General Store',
    faction: 'thornwick_citizens',
    emoji: '🛖',
    personality: 'Efficient. Businesslike. Fair but unyielding on price. Fiercely proud of Thornwick. Wary of Ironhaven merchants.',
    schedule: [
      { timeStart:7, timeEnd:19, layer:'interior', settlementId:'thornwick', posKey:'thornwick_store' }
    ],
    trader: {
      stock: [
        { name:'Rope (10m)', basePriceCp:25, stock:5 },
        { name:'Torch (bundle of 3)', basePriceCp:12, stock:8 },
        { name:'Rations (3 days)', basePriceCp:30, stock:6 },
        { name:'Lantern', basePriceCp:90, stock:2 },
        { name:'Blanket', basePriceCp:20, stock:4 },
        { name:'Flint & Steel', basePriceCp:10, stock:5 },
      ],
      buyRate: 0.35, sellMarkup: 1.25
    }
  },

  // ── GREYVEIL ──────────────────────────────────────
  'oskar_greyveil': {
    id: 'oskar_greyveil',
    name: 'Oskar Mill',
    role: "Miller's Rest Tavern",
    faction: 'greyveil_citizens',
    emoji: '🌾',
    personality: 'Nervous. Jumpy. Keeps looking at the door. Something has frightened the villagers recently. Will not say what.',
    schedule: [
      { timeStart:9, timeEnd:22, layer:'interior', settlementId:'greyveil', posKey:'greyveil_inn' }
    ],
    trader: {
      stock: [
        { name:'Rough Cot (night)', basePriceCp:15, stock:99 },
        { name:'Barleybread', basePriceCp:3, stock:99 },
      ],
      buyRate: 0.2, sellMarkup: 1.1
    }
  }
};

// ═══════════════════════════════════════════════════
// FACTION DEFINITIONS
// ═══════════════════════════════════════════════════
const FACTIONS = {
  ironhaven_guard:    { name:'City Guard',         color:'#7a9abf', rivals:['ironhaven_thieves'], allies:['ironhaven_guild'] },
  ironhaven_guild:    { name:"Merchants' Guild",   color:'#c9943a', rivals:[], allies:['ironhaven_guard'] },
  ironhaven_citizens: { name:'Ironhaven Folk',     color:'#a0c878', rivals:[], allies:['ironhaven_citizens'] },
  ironhaven_thieves:  { name:'Shadow Compact',     color:'#8a6a9a', rivals:['ironhaven_guard'], allies:[] },
  thornwick_citizens: { name:'Thornwick Folk',     color:'#c8b060', rivals:[], allies:[] },
  greyveil_citizens:  { name:'Greyveil Folk',      color:'#90c890', rivals:[], allies:[] },
  dunrock_citizens:   { name:'Dunrock Folk',       color:'#b09060', rivals:[], allies:[] },
};

// ── Expose to engine ────────────────────────────────
window.WORLD_DATA = {
  id: WORLD_ID,
  name: WORLD_NAME,
  meta: WORLD_META,
  settlements: SETTLEMENTS,
  overworldToSettlement: OVERWORLD_TO_SETTLEMENT,
  npcTemplates: NPC_TEMPLATES,
  factions: FACTIONS,
};
})();
